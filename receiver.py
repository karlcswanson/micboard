import time
import datetime
import queue
import socket
from collections import defaultdict

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
            if self.type in ['qlxd','ulxd','axtd']:
                self.f = socket.socket(socket.AF_INET, socket.SOCK_STREAM) #TCP
            elif self.type == 'uhfr':
                self.f = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) #UDP
            self.f.settimeout(.2)
            self.f.connect((self.ip, PORT))
            self.set_rx_com_status('CONNECTED')
            self.enable_metering(.1)

            # if self.ip == '10.231.1.154':
            #     self.enable_metering(.1)

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
        if status == 'CONNECTED':
            print("Connected to {} at {}".format(self.ip,datetime.datetime.now()))
        elif status == 'DISCONNECTED':
            print("Disconnected from {} at {}".format(self.ip,datetime.datetime.now()))



    def add_transmitter(self, tx, slot):
        self.transmitters.append(WirelessTransmitter(tx, slot))

    def get_transmitter_by_channel(self, channel):
        return next((x for x in self.transmitters if x.channel == int(channel)), None)


    def parse_raw_rx(self, data):
        data = data.strip('< >').strip('* ')
        data = data.replace('{','').replace('}','')
        split = data.split()

        if split[0] in ['REP','REPORT','SAMPLE'] and split[1] in ['1','2','3','4']:
            tx = self.get_transmitter_by_channel(int(split[1]))
            tx.parse_raw_tx(data,self.type)

        elif split[0] in ['REP','REPORT']:
            self.raw[split[1]] = ' '.join(split[2:])

    def parse_data(self, data):
        if self.type == 'qlxd' or self.type == 'ulxd':
            return self.ulxd_parse(data)
        if self.type == 'uhfr':
            return self.uhfr_parse(data)

    def ulxd_parse(self, data):
        # print(data)
        res, channel, command = data.split()[1:4]
        try:
            channel = int(channel)
        except:
            pass
        if res == 'REP' and isinstance(channel,int):
            tx = self.get_transmitter_by_channel(channel)
            if command == 'CHAN_NAME':
                tx.set_chan_name(data[data.find("{")+1:data.find("}")])
            if command == 'BATT_BARS':
                print('BATTERY UPDATE!')
                tx.set_battery(data.split()[4])
            if command == 'FREQUENCY':
                tx.set_frequency(data.split()[4])
        elif res == 'SAMPLE':
            tx = self.get_transmitter_by_channel(channel)
            tx.set_antenna(data.split()[4])
            tx.set_rf_level(data.split()[5])
            tx.set_audio_level(data.split()[6])
            tx.tx_json_push()


    def uhfr_parse(self, data):
        res, channel, command = data.split()[1:4]
        if res == 'REPORT' and 1 <= channel <= 2:
            tx = self.get_transmitter_by_channel(channel)
            if command == 'CHAN_NAME':
                # grabing this range makes sure we copy channel names with spaces
                tx.set_chan_name(data[21:33])
            if command == 'TX_BATT':
                tx.set_battery(data.split()[4])
            if command == 'FREQUENCY':
                tx.set_frequency(data.split()[4])
        elif res == 'SAMPLE':
            tx = self.get_transmitter_by_channel(channel)
            tx.set_antenna(data.split()[4])
            tx.rf_level.a = data.split()[5]
            tx.rf_level.b = data.split()[6]
            tx.set_battery(data.split()[7])
            tx.set_audio_level(data.split()[8])
            tx.tx_json_push()



    def get_channels(self):
        channels = []
        for transmitter in self.transmitters:
            channels.append(transmitter.channel)
        return channels

    def get_all(self):
        ret = []
        if self.type in ['qlxd','ulxd','axtd']:
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
        if self.type in ['qlxd','ulxd']:
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
                ret.append('* GET {} BATT_BARS *'.format(i))
                ret.append('* GET {} GROUP_CHAN *'.format(i))

        return ret


    def enable_metering(self, interval):
        if self.type in ['qlxd','ulxd','axtd']:
            for i in self.get_channels():
                self.writeQueue.put('< SET {} METER_RATE {:05d} >'.format(i,int(interval * 1000)))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                self.writeQueue.put('* METER {} ALL {:03d} *'.format(i,int(interval/30 * 1000)))

    def disable_metering(self):
        if self.type in ['qlxd','ulxd','axtd']:
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
        data = {'ip': self.ip, 'type': self.type, 'status': self.rx_com_status, 'raw': self.raw, 'tx': tx_data, 'queue':self.writeQueue.qsize() }
        return data
