import time
import queue
import socket
from collections import defaultdict
import logging

from transmitter import WirelessTransmitter


PORT = 2202


class WirelessReceiver:
    def __init__(self, ip, type):
        self.ip = ip
        self.type = type
        self.transmitters = []
        self.rx_com_status = 'DISCONNECTED'
        self.writeQueue = queue.Queue()
        self.f = None
        self.socket_watchdog = int(time.perf_counter())
        self.raw = defaultdict(dict)

    def socket_connect(self):
        try:
            if self.type in ['qlxd', 'ulxd', 'axtd']:
                self.f = socket.socket(socket.AF_INET, socket.SOCK_STREAM) #TCP
                self.f.settimeout(.2)
                self.f.connect((self.ip, PORT))


            elif self.type == 'uhfr':
                self.f = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) #UDP

            self.set_rx_com_status('CONNECTING')
            self.enable_metering(.1)

            for string in self.get_all():
                self.writeQueue.put(string)
        except socket.error as e:
            self.set_rx_com_status('DISCONNECTED')

        self.socket_watchdog = int(time.perf_counter())


    def socket_disconnect(self):
        self.f.close()
        self.set_rx_com_status('DISCONNECTED')
        self.socket_watchdog = int(time.perf_counter())


    def fileno(self):
        return self.f.fileno()

    def set_rx_com_status(self, status):
        self.rx_com_status = status
        # if status == 'CONNECTED':
        #     print("Connected to {} at {}".format(self.ip,datetime.datetime.now()))
        # elif status == 'DISCONNECTED':
        #     print("Disconnected from {} at {}".format(self.ip,datetime.datetime.now()))

    def add_transmitter(self, tx, slot):
        self.transmitters.append(WirelessTransmitter(self, tx, slot))

    def get_transmitter_by_channel(self, channel):
        return next((x for x in self.transmitters if x.channel == int(channel)), None)

    def parse_raw_rx(self, data):
        data = data.strip('< >').strip('* ')
        data = data.replace('{', '').replace('}', '')
        split = data.split()
        try:
            if split[0] in ['REP', 'REPORT', 'SAMPLE'] and split[1] in ['1', '2', '3', '4']:
                tx = self.get_transmitter_by_channel(int(split[1]))
                tx.parse_raw_tx(data, self.type)

            elif split[0] in ['REP', 'REPORT']:
                self.raw[split[1]] = ' '.join(split[2:])
        except:
            logging.warning("Index Error(RX): %s", data)


    def get_channels(self):
        channels = []
        for transmitter in self.transmitters:
            channels.append(transmitter.channel)
        return channels

    def get_all(self):
        ret = []
        if self.type in ['qlxd', 'ulxd', 'axtd']:
            for i in self.get_channels():
                ret.append('< GET {} ALL >'.format(i))

        elif self.type == 'uhfr':
            for i in self.get_channels():
                ret.append('* GET {} CHAN_NAME *'.format(i))
                ret.append('* GET {} BATT_BARS *'.format(i))
                ret.append('* GET {} GROUP_CHAN *'.format(i))

        return ret

    def get_query_strings(self):
        ret = []
        if self.type in ['qlxd', 'ulxd']:
            for i in self.get_channels():
                ret.append('< GET {} CHAN_NAME >'.format(i))
                ret.append('< GET {} BATT_BARS >'.format(i))

        elif self.type == 'axtd':
            for i in self.get_channels():
                ret.append('< GET {} CHAN_NAME >'.format(i))
                ret.append('< GET {} TX_BATT_BARS >'.format(i))

        elif self.type == 'uhfr':
            for i in self.get_channels():
                ret.append('* GET {} CHAN_NAME *'.format(i))
                ret.append('* GET {} TX_BAT *'.format(i))
                ret.append('* GET {} GROUP_CHAN *'.format(i))

        return ret


    def enable_metering(self, interval):
        if self.type in ['qlxd', 'ulxd', 'axtd']:
            for i in self.get_channels():
                self.writeQueue.put('< SET {} METER_RATE {:05d} >'.format(i, int(interval * 1000)))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                self.writeQueue.put('* METER {} ALL {:03d} *'.format(i, int(interval/30 * 1000)))

    def disable_metering(self):
        if self.type in ['qlxd', 'ulxd', 'axtd']:
            for i in self.get_channels():
                self.writeQueue.put('< SET {} METER_RATE 0 >'.format(i))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                self.writeQueue.put('* METER {} ALL STOP *'.format(i))

    def rx_json(self):
        tx_data = []
        for transmitter in self.transmitters:
            data = transmitter.tx_json()
            if self.rx_com_status == 'DISCONNECTED':
                data['status'] = 'RX_COM_ERROR'
            tx_data.append(data)
        data = {
            'ip': self.ip, 'type': self.type, 'status': self.rx_com_status,
            'raw': self.raw, 'tx': tx_data
        }
        return data
