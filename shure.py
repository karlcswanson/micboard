import time
import socket
import select
import threading

from receiver import WirelessReceiver
from transmitter import WirelessTransmitter, data_output_queue

WirelessReceivers = []


sample = {}
sample['uhfr'] = []
sample['qlxd'] = ['RF_ANTENNA','RX_RF_LVL','AUDIO_LVL']
sample['ulxd'] = ['RF_ANTENNA','RX_RF_LVL','AUDIO_LVL']
sample['axtd'] = []


def get_receiver_by_ip(ip):
    return next((x for x in WirelessReceivers if x.ip == ip), None)

def check_add_receiver(ip, type):
    rec = get_receiver_by_ip(ip)
    if rec:
        return rec
    else:
        rec = WirelessReceiver(ip,type)
        WirelessReceivers.append(rec)
        return rec


def print_ALL():
    for rx in WirelessReceivers:
        print("RX Type: {} IP: {} Status: {}".format(rx.type, rx.ip, rx.rx_com_status))
        for tx in rx.transmitters:
            print("Channel Name: {} Frequency: {} Slot: {} TX: {} TX State: {}".format(tx.chan_name, tx.frequency, tx.slot, tx.channel, tx.tx_state()))

def watchdog_monitor():
    for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'CONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 5:
            print('disconnected from: {}'.format(rx.ip))
            rx.socket_disconnect()

    for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'DISCONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 20:
            rx.socket_connect()

def memory_summary():
    # Only import Pympler when we need it. We don't want it to
    # affect our process if we never call memory_summary.
    from pympler import summary, muppy
    mem_summary = summary.summarize(muppy.get_objects())
    rows = summary.format_(mem_summary)
    return '\n'.join(rows)


def WirelessQueue():
    while True:
        for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'CONNECTED'):
            strings = rx.get_query_strings()
            for string in strings:
                rx.writeQueue.put(string)
        # print(memory_summary())

        time.sleep(10)

def SocketService():
    for rx in WirelessReceivers:
        rx.socket_connect()

    while True:
        watchdog_monitor()
        readrx = [rx for rx in WirelessReceivers if rx.rx_com_status in ['CONNECTING','CONNECTED']]
        writerx = [rx for rx in readrx if not rx.writeQueue.empty()]

        read_socks,write_socks,error_socks = select.select(readrx, writerx, readrx, .2)

        for rx in read_socks:
            data = rx.f.recv(1024).decode('UTF-8')

            # print("read: {} data: {}".format(rx.ip,data))

            d = '>'
            if rx.type == 'uhfr':
                d = '*'
            data =  [e+d for e in data.split(d) if e]

            for line in data:
                rx.parse_raw_rx(line)

            rx.socket_watchdog = int(time.perf_counter())
            rx.set_rx_com_status('CONNECTED')

        for rx in write_socks:
            string = rx.writeQueue.get()
            print("write: {} data: {}".format(rx.ip,string))
            if rx.type in ['qlxd','ulxd','axtd']:
                rx.f.sendall(bytearray(string,'UTF-8'))
            elif rx.type == 'uhfr':
                rx.f.sendto(bytearray(string,'UTF-8'),(rx.ip,2202))


        for sock in error_socks:
            rx.set_rx_com_status('DISCONNECTED')
