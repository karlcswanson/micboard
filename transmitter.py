import time
import datetime
import queue
from collections import defaultdict
import os

import config

data_output_queue = queue.Queue()
data_output_list = []

BATTERY_TIMEOUT = 30*60


# https://github.com/gaetano-guerriero/pypjlink/blob/master/pypjlink/projector.py
reverse_dict = lambda d: dict(zip(d.values(), d.keys()))


rx_strings = {}


rx_strings['uhfr'] = {'battery': 'TX_BAT',
                      'frequency': 'FREQUENCY',
                      'name': 'CHAN_NAME',
                      'tx_offset': 'NOTQWERT'}

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
                      'antenna': 'RF_ANTENNA',
                      'tx_offset' : 'TX_OFFSET'}

rx_strings['axtd'] = {'battery': 'TX_BATT_BARS',
                      'frequency': 'FREQUENCY',
                      'audio_level': 'AUDIO_LVL',
                      'rf_level': 'RX_RF_LVL',
                      'name': 'CHAN_NAME',
                      'antenna': 'RF_ANTENNA'}

rx_strings_rev = { 'qlxd': reverse_dict(rx_strings['qlxd']),
                   'ulxd': reverse_dict(rx_strings['ulxd']),
                   'axtd': reverse_dict(rx_strings['axtd'])}

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
        chan_name = chan_name.replace('_',' ')
        self.chan_name = chan_name

    def set_tx_offset(self, tx_offset):
        if tx_offset != '255':
            self.tx_offset = int(tx_offset)

    def tx_state(self):
        # WCCC Specific State for unassigned microphones
        name = self.chan_name.split()
        prefix = ''.join([i for i in name[0] if not i.isdigit()])
        if prefix in config.config_tree['prefixes']:
            if len(name) == 1:
                return 'UNASSIGNED'

        if (time.time() - self.timestamp) < BATTERY_TIMEOUT:
            if 4 <= self.battery <= 5:
                return 'GOOD'
            elif self.battery == 255 and 4 <= self.prev_battery <= 5:
                return 'PREV_GOOD'
            elif self.battery == 3:
                return 'REPLACE'
            elif self.battery == 255 and self.prev_battery == 3:
                return 'PREV_REPLACE'
                # return 'UNASSIGNED'
            elif 0 <= self.battery <= 2:
                return 'CRITICAL'
            elif self.battery == 255 and 0 <= self.prev_battery <= 2:
                return 'PREV_CRITICAL'

        return 'TX_COM_ERROR'

    def tx_json(self):
        return {'name': self.chan_name, 'channel': self.channel,
                'antenna':self.antenna, 'audio_level': self.audio_level,
                'rf_level': self.rf_level, 'frequency': self.frequency,
                'battery':self.battery, 'tx_offset': self.tx_offset,
                'status': self.tx_state(), 'slot': self.slot, 'raw': self.raw }

    def tx_json_mini(self):
        data = self.tx_json()
        data['timestamp'] = time.time()
        # data['timestamp'] = datetime.datetime.now().isoformat()

        del data['raw']
        return data

    def tx_json_push(self):
        data_output_list.append(self.tx_json_mini())
        # data_output_queue.put(self.tx_json_mini())

    def parse_raw_tx(self,data,type):
        split = data.split()

        self.raw[split[2]] = ' '.join(split[3:])
        try:
            if split[0] == 'SAMPLE' and split[2] == 'ALL':
                self.parse_sample(data,type)
                self.tx_json_push()

            if split[0] in ['REP','REPLY','REPORT']:
                if split[2] == rx_strings[type]['battery']:
                    self.set_battery(split[3])
                elif split[2] == rx_strings[type]['name']:
                    self.set_chan_name(' '.join(split[3:]))
                elif split[2] == rx_strings[type]['frequency']:
                    self.set_frequency(split[3])
                elif split[2] == rx_strings[type]['tx_offset']:
                    self.set_tx_offset(split[3])
        except Exception as e:
            print("Index Error(TX): {}".format(data.split()))
            print(e)
            # os._exit(1)

    def parse_sample(self,data,type):
        split = data.split()
        if type in ['qlxd','ulxd']:
            self.set_antenna(split[3])
            self.set_rf_level(split[4])
            self.set_audio_level(split[5])

        elif type == 'uhfr':
            self.set_antenna(split[3])
            self.set_rf_level(23*(100-int(split[4]))/16 )
            self.set_battery(split[6])
            self.set_audio_level(50*int(split[7])/255)
