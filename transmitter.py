import time
import queue
from collections import defaultdict

data_output_queue = queue.Queue()



DATA_TIMEOUT = 30


# https://github.com/gaetano-guerriero/pypjlink/blob/master/pypjlink/projector.py
reverse_dict = lambda d: dict(zip(d.values(), d.keys()))


rx_strings = {}
rx_strings['qlxd'] = {'battery': 'BATT_BARS',
                      'frequency': 'FREQUENCY',
                      'audio_level': 'AUDIO_LVL',
                      'rf_level': 'RX_RF_LVL',
                      'name': 'CHAN_NAME',
                      'antenna': 'RF_ANTENNA',
                      'tx_offset' : 'TX_OFFSET'}

rx_strings['ulxd'] = {'battery': 'BATT_BARS',
                      'frequency': 'FREQUENCY',
                      'audio_level': 'AUDIO_LVL',
                      'rf_level': 'RX_RF_LVL',
                      'name': 'CHAN_NAME',
                      'antenna': 'RF_ANTENNA'}

rx_strings['axtd'] = {'battery': 'TX_BATT_BARS',
                      'frequency': 'FREQUENCY',
                      'audio_level': 'AUDIO_LVL',
                      'rf_level': 'RX_RF_LVL',
                      'name': 'CHAN_NAME',
                      'antenna': 'RF_ANTENNA'}

rx_strings_rev = { 'qlxd' : reverse_dict(rx_strings['qlxd']),
                   'ulxd' : reverse_dict(rx_strings['ulxd']),
                   'axtd' : reverse_dict(rx_strings['axtd'])}

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
        self.tx_offset = 0
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

    def set_tx_offset(self, tx_offset):
        if tx_offset == '255':
            tx_offset = '0'
        self.tx_offset = tx_offset

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

        return 'TX_COM_ERROR'

    def tx_json(self):
        return {'name': self.chan_name, 'channel': self.channel,
                'antenna':self.antenna,'audio_level': self.audio_level,
                'rf_level': self.rf_level,'frequency': self.frequency,
                'battery':self.battery,'tx_offset': self.tx_offset,
                'status': self.tx_state(), 'slot': self.slot, 'raw': self.raw }

    def tx_json_mini(self):
        data = self.tx_json()

        del data['raw']
        return data

    def tx_json_push(self):
        data_output_queue.put(self.tx_json_mini())

    def parse_raw_tx(self,data,type):
        data = data.split()
        self.raw[data[2]] = ' '.join(data[3:]).strip('{}').rstrip()
        if data[2] == 'ALL':
            self.set_antenna(data[3])
            self.set_rf_level(data[4])
            self.set_audio_level(data[5])
            # for index, val in enumerate(data[3:]):
                # self.raw[sample[type][index]] = val

            self.tx_json_push()


        if data[2] == rx_strings[type]['battery']:
            self.set_battery(data[3])
        elif data[2] == rx_strings[type]['name']:
            self.set_chan_name(' '.join(data[3:]).strip('{}').rstrip())
        elif data[2] == rx_strings[type]['frequency']:
            self.set_frequency(data[3])
        elif data[2] == rx_strings[type]['tx_offset']:
            self.set_tx_offset(data[3])
