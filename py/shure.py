import time
import select
import queue
import atexit
import sys
import logging

from networkdevice import ShureNetworkDevice
from channel import chart_update_list, data_update_list
# from mic import WirelessMic
# from iem import IEM

NetworkDevices = []
DeviceMessageQueue = queue.Queue()


def get_network_device_by_ip(ip):
    return next((x for x in NetworkDevices if x.ip == ip), None)

def get_network_device_by_slot(slot):
    for networkdevice in NetworkDevices:
        for channel in networkdevice.channels:
            if channel.slot == slot:
                return channel

def check_add_network_device(ip, type):
    net = get_network_device_by_ip(ip)
    if net:
        return net

    net = ShureNetworkDevice(ip, type)
    NetworkDevices.append(net)
    return net

def watchdog_monitor():
    for rx in (rx for rx in NetworkDevices if rx.rx_com_status == 'CONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 5:
            logging.debug('disconnected from: %s', rx.ip)
            rx.socket_disconnect()

    for rx in (rx for rx in NetworkDevices if rx.rx_com_status == 'CONNECTING'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 2:
            rx.socket_disconnect()


    for rx in (rx for rx in NetworkDevices if rx.rx_com_status == 'DISCONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 20:
            rx.socket_connect()

def WirelessQueryQueue():
    while True:
        for rx in (rx for rx in NetworkDevices if rx.rx_com_status == 'CONNECTED'):
            strings = rx.get_query_strings()
            for string in strings:
                rx.writeQueue.put(string)
        time.sleep(10)

def ProcessRXMessageQueue():
    while True:
        rx, msg = DeviceMessageQueue.get()
        rx.parse_raw_rx(msg)


def SocketService():
    for rx in NetworkDevices:
        rx.socket_connect()

    while True:
        watchdog_monitor()
        readrx = [rx for rx in NetworkDevices if rx.rx_com_status in ['CONNECTING', 'CONNECTED']]
        writerx = [rx for rx in readrx if not rx.writeQueue.empty()]

        read_socks, write_socks, error_socks = select.select(readrx, writerx, readrx, .2)

        for rx in read_socks:
            try:
                data = rx.f.recv(1024).decode('UTF-8')
            except:
                rx.socket_disconnect()
                break
            # print("read: {} data: {}".format(rx.ip,data))

            d = '>'
            if rx.type == 'uhfr':
                d = '*'
            data = [e+d for e in data.split(d) if e]

            for line in data:
                # rx.parse_raw_rx(line)
                DeviceMessageQueue.put((rx, line))

            rx.socket_watchdog = int(time.perf_counter())
            rx.set_rx_com_status('CONNECTED')


        for rx in write_socks:
            string = rx.writeQueue.get()
            logging.debug("write: %s data: %s", rx.ip, string)
            try:
                if rx.type in ['qlxd', 'ulxd', 'axtd', 'p10t']:
                    rx.f.sendall(bytearray(string, 'UTF-8'))
                elif rx.type == 'uhfr':
                    rx.f.sendto(bytearray(string, 'UTF-8'), (rx.ip, 2202))
            except:
                logging.warning("TX ERROR IP: %s String: %s", rx.ip, string)


        for rx in error_socks:
            rx.set_rx_com_status('DISCONNECTED')



# @atexit.register
def on_exit():
    connected = [rx for rx in NetworkDevices if rx.rx_com_status == 'CONNECTED']
    for rx in connected:
        rx.disable_metering()
    time.sleep(50)
    print("IT DONE!")
    sys.exit(0)

# atexit.register(on_exit)
# signal.signal(signal.SIGTERM, on_exit)
# signal.signal(signal.SIGINT, on_exit)
