import configparser
import time
import socket
import select
import threading
import re
import queue

from collections import defaultdict


DATA_TIMEOUT = 30
PORT = 2202
WirelessReceivers = []

data_output_queue = queue.Queue()


sample = {}
sample['qlxd'] = ['RF_ANTENNA','RX_RF_LVL','AUDIO_LVL']
sample['ulxd'] = ['RF_ANTENNA','RX_RF_LVL','AUDIO_LVL']
sample['axtd'] = []



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
            self.f = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.f.settimeout(.2)
            self.f.connect((self.ip, PORT))
            self.set_rx_com_status('CONNECTED')
            self.enable_metering(.1)
            for string in self.get_query_strings():
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

    def add_transmitter(self, tx, slot):
        self.transmitters.append(WirelessTransmitter(tx, slot))

    def get_transmitter_by_channel(self, channel):
        return next((x for x in self.transmitters if x.channel == int(channel)), None)


    def parse_raw_rx(self, data):
        data = data.split()
        if data[2] in ['1','2','3','4']:
            tx = self.get_transmitter_by_channel(int(data[2]))
            tx.parse_raw_tx(' '.join(data[1:-1]),self.type)

        else:
            self.raw[data[2]] = ' '.join(data[3:-1]).strip('{}').rstrip()

    def parse_data(self, data):
        self.parse_raw_rx(data)
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

    def get_query_strings(self):
        ret = []
        if self.type == 'qlxd' or self.type == 'ulxd':
            for i in self.get_channels():
                ret.append('< GET {} ALL >'.format(i))

        elif self.type == 'uhfr':
            for i in self.get_channels():
                ret.append('* GET {} CHAN_NAME *'.format(i))
                ret.append('* GET {} BATT_BARS *'.format(i))
                ret.append('* GET {} GROUP_CHAN *'.format(i))

        return ret


    def enable_metering(self, interval):
        if self.type == 'qlxd' or self.type == 'ulxd':
            for i in self.get_channels():
                self.writeQueue.put('< SET {} METER_RATE {:05d} >'.format(i,int(interval * 1000)))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                self.writeQueue.put('* METER {} ALL {:03d} *'.format(i,int(interval/30 * 1000)))

    def disable_metering(self):
        if self.type == 'qlxd' or self.type == 'ulxd':
            for i in self.get_channels():
                self.writeQueue.put('< SET {} METER_RATE 0 >'.format(i))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                self.writeQueue.put('* METER {} ALL STOP *'.format(i))

    def rx_json(self):
        tx_data = []
        for transmitter in self.transmitters:
            tx_data.append(transmitter.tx_json())
        data = {'ip': self.ip, 'type': self.type, 'status': self.rx_com_status, 'raw': self.raw, 'tx': tx_data}
        return data



class WirelessTransmitter:
    def __init__(self, channel, slot):
        self.chan_name = 'DEFAULT'
        self.channel = channel
        self.frequency = '000000'
        self.battery = 255
        self.prev_battery = 255
        self.timestamp = time.time() - 60
        self.slot = slot
        self.audio_level = 0
        self.rf_level = 0
        self.antenna = 'XX'
        self.raw = defaultdict(dict)


    def set_frequency(self, frequency):
        self.frequency = frequency[:3] + '.' + frequency[3:]

    def set_antenna(self, antenna):
        self.antenna = antenna

    def set_audio_level(self, audio_level):
        self.audio_level = int(audio_level)

    def set_rf_level(self, rf_level):
        self.rf_level = int(rf_level)

    def set_battery(self, level):
        if level == 'U':
            level = 255
        level = int(level)
        self.battery = level
        if 1 <= level <= 5:
            self.prev_battery = level
        self.timestamp = time.time()

    def set_chan_name(self, chan_name):
        self.chan_name = chan_name

    def tx_state(self):
        # WCCC Specific State for unassigned microphones
        name = self.chan_name.split()
        if name[0][:2] == 'HH' or name[0][:2] == 'BP':
            if len(name) == 1:
                return 'UNASSIGNED'

        if (time.time() - self.timestamp) < DATA_TIMEOUT:
            if 4 <= self.battery <= 5:
                return 'GOOD'
            elif self.battery == 255 and 4 <= self.prev_battery <= 5:
                return 'PREV_GOOD'
            elif self.battery == 3:
                return 'REPLACE'
            elif self.battery == 255 and self.prev_battery == 3:
                return 'PREV_REPLACE'
            elif 0 <= self.battery <= 2:
                return 'CRITICAL'
            elif self.battery == 255 and 0 <= self.prev_battery <= 2:
                return 'PREV_CRITICAL'

        return 'COM_ERROR'

    def tx_json(self):
        return {'name': self.chan_name, 'channel': self.channel, 'antenna':self.antenna,
                'audio_level': self.audio_level, 'rf_level': self.rf_level,
                'frequency': self.frequency, 'battery':self.battery,
                'status': self.tx_state(), 'slot': self.slot, 'raw': self.raw }

    def tx_json_push(self):
        data_output_queue.put(self.tx_json())

    def parse_raw_tx(self,data,type):
        data = data.split()
        self.raw[data[2]] = ' '.join(data[3:]).strip('{}').rstrip()
        if data[2] == 'ALL':
            for index, val in enumerate(data[3:]):
                self.raw[sample[type][index]] = val


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

def config(file):
    cfg = configparser.ConfigParser()
    cfg.read(file)
    for element in cfg.sections():
        slot = int(re.search(r'\d+', repr(element)).group())
        rec = check_add_receiver(cfg[element]['ip'],cfg[element]['type'])
        rec.add_transmitter(cfg.getint(element,'channel'),slot)

def print_ALL():
    for rx in WirelessReceivers:
        print("RX Type: {} IP: {} Status: {}".format(rx.type, rx.ip, rx.rx_com_status))
        for tx in rx.transmitters:
            print("Channel Name: {} Frequency: {} Slot: {} TX: {} TX State: {}".format(tx.chan_name, tx.frequency, tx.slot, tx.channel, tx.tx_state()))

def watchdog_monitor():
    for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'CONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 10:
            print('disconnected from: {}'.format(rx.ip))
            rx.socket_disconnect()

    for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'DISCONNECTED'):
        if (int(time.perf_counter()) - rx.socket_watchdog) > 10:
            rx.socket_connect()


def WirelessQueue():
    while True:
        for rx in (rx for rx in WirelessReceivers if rx.rx_com_status == 'CONNECTED'):
            strings = rx.get_query_strings()
            for string in strings:
                rx.writeQueue.put(string)
        time.sleep(10)

def SocketService():
    for rx in WirelessReceivers:
        rx.socket_connect()

    while True:
        watchdog_monitor()
        readrx = [rx for rx in WirelessReceivers if rx.rx_com_status == 'CONNECTED']
        writerx = [rx for rx in readrx if not rx.writeQueue.empty()]

        read_socks,write_socks,error_socks = select.select(readrx, writerx, readrx, .2)

        for rx in read_socks:
            data = rx.f.recv(1024).decode('UTF-8')

            # print("read: {} data: {}".format(rx.ip,data))

            d = '>'
            data =  [e+d for e in data.split(d) if e]

            for line in data:
                rx.parse_data(line)

            rx.socket_watchdog = int(time.perf_counter())

        for rx in write_socks:
            string = rx.writeQueue.get()
            print("write: {} data: {}".format(rx.ip,string))
            # print(string)
            rx.f.sendall(bytearray(string,'UTF-8'))

        for sock in error_socks:
            rx.set_rx_com_status('DISCONNECTED')




def state_test():
    tx = get_receiver_by_ip('10.231.3.50').get_transmitter_by_channel(1)
    tx.set_battery(3)
    print("tx: {}".format(tx.tx_state()))
    time.sleep(2)
    tx.set_battery(255)
    print("tx: {}".format(tx.tx_state()))
    time.sleep(2)


def main():
    config('config.ini')
    t1 = threading.Thread(target=WirelessQueue)
    t2 = threading.Thread(target=WirelessListen)

    t1.start()
    t2.start()

    time.sleep(2)
    get_receiver_by_ip('10.231.3.50').enable_metering(.1)
    time.sleep(4)
    get_receiver_by_ip('10.231.3.50').disable_metering()
    while True:
       print_ALL()
       time.sleep(3)

if __name__ == '__main__':
    main()
