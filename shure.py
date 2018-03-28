import configparser
import time
import socket
import select
import threading

PORT = 2202
WirelessReceivers = []


class WirelessReceiver:
    def __init__(self, ip, type):
        self.ip = ip
        self.type = type
        self.transmitters = []

    def add_transmitter(self, channel):
        self.transmitters.append(WirelessTransmitter(channel))

    def get_transmitter_by_channel(self,channel):
        return next((x for x in self.transmitters if x.channel == int(channel)), None)

    def parse_data(self,i):
        if self.type == 'qlxd' or self.type == 'ulxd':
            return self.ulxd_parse(i)
        if self.type == 'uhfr':
            return self.uhfr_parse(i)

    def ulxd_parse(self,i):
        res, channel, command = i.split()[1:4]
        if res == 'REP':
            xmit = self.get_transmitter_by_channel(channel)
            if command == 'CHAN_NAME':
                xmit.set_chan_name(i[i.find("{")+1:i.find("}")])
            if command == 'BATT_BARS':
                xmit.set_battery(i.split()[4])

    def uhfr_parse(self,i):
        res, channel, command = i.split()[1:4]
        if res == 'REPORT':
            xmit = self.get_transmitter_by_channel(channel)
            if command == 'CHAN_NAME':
                xmit.set_chan_name(i[21:33])
            if command == 'TX_BATT':
                xmit.set_battery(i.split()[4])

    def get_channels(self):
        channels = []
        for transmitter in self.transmitters:
            channels.append(transmitter.channel)
        return channels

    def get_query_strings(self):
        ret = []
        if self.type == 'qlxd' or self.type == 'ulxd':
            for i in self.get_channels():
                ret.append('< GET {} CHAN_NAME >'.format(i))
                ret.append('< GET {} BATT_BARS >'.format(i))
        elif self.type == 'uhfr':
            for i in self.get_channels():
                ret.append('* GET {} CHAN_NAME *'.format(i))
                ret.append('* GET {} BATT_BARS *'.format(i))

        return ret

    def manual_update(self,socket):
        strings = self.get_query_strings()
        for string in strings:
            socket.sendall(bytearray(string,'UTF-8'))


class WirelessTransmitter:
    def __init__(self, channel):
        self.chan_name = 'DEFAULT'
        self.channel = int(channel)
        self.battery = 255
        self.prev_battery = 255
        self.battery_check_time = time.time() - 60

    def set_battery(self, level):
        level = int(level)
        self.battery = level
        if 1 <= level <= 5:
            self.prev_battery = level
        self.battery_check_time = time.time()

    def set_chan_name(self, chan_name):
        self.chan_name = chan_name

    def tx_state(self):
        if (time.time() - self.battery_check_time) < 30:
            if 4 <= self.battery <= 5:
                return 'GOOD'
            elif self.battery == 3 or (self.battery == 255 and self.prev_battery == 3):
                return 'REPLACE_BATTERY'
            elif self.battery <= 2  or (self.battery == 255 and self.prev_battery <= 2):
                return 'CRITICAL'
            elif self.battery == 255 and 4 <= self.prev_battery <=5:
                return 'PREV_GOOD'
        return 'COM_ERROR'


def get_receiver_by_ip(ip):
    return next((x for x in WirelessReceivers if x.ip == ip), None)

def check_add_receiver(ip,type):
    rec = get_receiver_by_ip(ip)
    if rec:
        return rec
    else:
        rec = WirelessReceiver(ip,type)
        WirelessReceivers.append(rec)
        return rec

def config():
    cfg = configparser.ConfigParser()
    cfg.read('config.ini')
    for element in cfg.sections():
        rec = check_add_receiver(cfg[element]['ip'],cfg[element]['type'])
        rec.add_transmitter(cfg[element]['channel'])

def print_ALL():
    for rx in WirelessReceivers:
        print("IP: {}".format(rx.ip))
        for tx in rx.transmitters:
            print("TX: {}  Status: {}".format(tx.chan_name,tx.tx_state()))

def WirelessPoll():
    while True:
        for receiver in WirelessReceivers:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(.2)
                s.connect((receiver.ip, PORT))
                receiver.manual_update(s)
                s.close()
            except socket.error as e:
                print("send connection  BAD to {}".format(receiver.ip))

        time.sleep(5)

def WirelessListen():
    socks = []
    for receiver in WirelessReceivers:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(.2)
            s.connect((receiver.ip, PORT))
            socks.append(s)
        except socket.error as e:
            print("listen connection  BAD to {}".format(receiver.ip))

    while True:
        ready_socks,_,_ = select.select(socks, [], [])
        for sock in ready_socks:
            ip,port = sock.getpeername()
            data, addr = sock.recvfrom(1024)
            receiver = get_receiver_by_ip(ip)
            receiver.parse_data(repr(data))


def state_test():
    tx = get_receiver_by_ip('10.231.3.50').get_transmitter_by_channel(1)
    tx.set_battery(5)
    print("tx: {}".format(tx.tx_state()))
    time.sleep(2)
    tx.set_battery(255)
    print("tx: {}".format(tx.tx_state()))
    time.sleep(2)


def main():
    config()
    t = threading.Thread(target=WirelessPoll)
    t2 = threading.Thread(target=WirelessListen)
    # state_test()
    t.start()
    t2.start()

    while True:
        print_ALL()
        time.sleep(3)

if __name__ == "__main__":
    main()
