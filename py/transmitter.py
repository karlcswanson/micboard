import time
import re
from collections import defaultdict
import logging


chart_update_list = []
data_update_list = []

BATTERY_TIMEOUT = 30*60
PEAK_TIMEOUT = 10


PEAK_LEVEL = {
    'qlxd': 80,
    'ulxd': 80,
    'axtd': 80,
    'uhfr': 100
}

# https://github.com/gaetano-guerriero/pypjlink/blob/master/pypjlink/projector.py
reverse_dict = lambda d: dict(zip(d.values(), d.keys()))


UHFR_AUDIO_TABLE = {
    0: 0,
    1: 13,
    3: 25,
    7: 37,
    15: 50,
    31: 63,
    63: 75,
    127: 88,
    255: 100
}

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
                      'audio_level': 'AUDIO_LEVEL_RMS',
                      'rf_level': 'RSSI',
                      'name': 'CHAN_NAME',
                      'antenna': 'ANTENNA_STATUS',
                      'tx_offset': 'TX_OFFSET'}

rx_strings_rev = {
    'qlxd': reverse_dict(rx_strings['qlxd']),
    'ulxd': reverse_dict(rx_strings['ulxd']),
    'axtd': reverse_dict(rx_strings['axtd'])
}

class WirelessTransmitter:
    def __init__(self, rx, cfg):
        self.rx = rx
        self.cfg = cfg
        self.chan_name_raw = 'SLOT {}'.format(cfg['slot'])
        self.channel = cfg['channel']
        self.frequency = '000000'
        self.battery = 255
        self.prev_battery = 255
        self.prev_battery_uhfr_raw = 255
        self.timestamp = time.time() - 60
        self.slot = cfg['slot']
        self.audio_level = 0
        self.rf_level = 0
        self.antenna = 'XX'
        self.tx_offset = 0
        self.raw = defaultdict(dict)
        self.peakstamp = time.time() - 60


    def set_frequency(self, frequency):
        if self.rx.type == 'axtd':
            frequency = frequency.lstrip('0')
        self.frequency = frequency[:3] + '.' + frequency[3:]

    def set_antenna(self, antenna):
        self.antenna = antenna

    def set_audio_level(self, audio_level):
        audio_level = float(audio_level)
        if self.rx.type in ['qlxd', 'ulxd']:
            audio_level = int(2 * audio_level)

        if self.rx.type == 'axtd':
            audio_level = int(audio_level - 20)

        if self.rx.type == 'uhfr':
            try:
                audio_level = UHFR_AUDIO_TABLE[audio_level]
            except:
                logging.warning("invalid Lookup UHFR Audio Value: %s", audio_level)
            # audio_level = int(100 * (audio_level / 255))

        if audio_level >= PEAK_LEVEL[self.rx.type]:
            self.peakstamp = time.time()
            if self not in data_update_list:
                data_update_list.append(self)

        self.audio_level = audio_level

    def set_rf_level(self, rf_level):
        rf_level = float(rf_level)
        if self.rx.type in ['qlxd', 'ulxd']:
            rf_level = 100 * (rf_level / 115)

        if self.rx.type == 'axtd':
            rf_level = 100 * (rf_level / 115)

        if self.rx.type == 'uhfr':
            rf_level = 100 * ((100 - rf_level) / 80)

        self.rf_level = int(rf_level)

    def set_battery(self, level):
        self.prev_battery_uhfr_raw = self.battery
        if level == 'U':
            level = 255
        level = int(level)
        self.battery = level
        ### UNTESTED


        if self.rx.type == 'uhfr' and self.prev_battery_uhfr_raw != self.battery:
            if self not in data_update_list:
                logging.debug("UHFR Battery Change Slot: %s", self.slot)
                data_update_list.append(self)

        if 1 <= level <= 5:
            self.prev_battery = level
            self.timestamp = time.time()


    def set_chan_name_raw(self, chan_name):
        chan_name = chan_name.replace('_', ' ')

        self.chan_name_raw = chan_name


    def get_chan_name(self):
        name = self.chan_name_raw.split()
        prefix = re.match("([A-Za-z]+)([0-9])+", name[0])

        chan_id = ''
        chan_name = ''

        if prefix:
            chan_id = name[0]
            chan_name = ' '.join(name[1:])
        else:
            chan_name = self.chan_name_raw

        if 'extended_id' in self.cfg:
            if self.cfg['extended_id']:
                chan_id = self.cfg['extended_id']

        if 'extended_name' in self.cfg:
            if self.cfg['extended_name']:
                chan_name = self.cfg['extended_name']

        return (chan_id, chan_name)


    def set_tx_offset(self, tx_offset):
        if tx_offset != '255':
            if self.rx.type in ['qlxd', 'ulxd']:
                self.tx_offset = int(tx_offset)

            if self.rx.type == 'axtd':
                self.tx_offset = int(tx_offset) - 12

    def tx_state(self):
        # WCCC Specific State for unassigned microphones
        if self.rx.rx_com_status in ['DISCONNECTED', 'CONNECTING']:
            return 'RX_COM_ERROR'

        if (time.time() - self.peakstamp) < PEAK_TIMEOUT:
            return 'AUDIO_PEAK'

        if not self.get_chan_name()[1]:
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
        name = self.get_chan_name()
        return {
            'id': name[0], 'name': name[1], 'channel': self.channel,
            'antenna':self.antenna, 'audio_level': self.audio_level,
            'rf_level': self.rf_level, 'frequency': self.frequency,
            'battery':self.battery, 'tx_offset': self.tx_offset,
            'status': self.tx_state(), 'slot': self.slot, 'raw': self.raw,
            'type': self.rx.type, 'name_raw' : self.chan_name_raw
        }

    def tx_json_mini(self):
        data = self.tx_json()
        data['timestamp'] = time.time()
        del data['raw']
        return data

    def tx_json_chart(self):
        audio_level = self.audio_level
        rf_level = self.rf_level
        timestamp = time.time()

        return {
            'audio_level': audio_level,
            'rf_level': rf_level,
            'slot': self.slot,
            'timestamp': timestamp
        }


    def parse_raw_tx(self, data, rx_type):
        split = data.split()

        self.raw[split[2]] = ' '.join(split[3:])
        try:
            if split[0] == 'SAMPLE' and split[2] == 'ALL':
                self.parse_sample(data, rx_type)
                chart_update_list.append(self.tx_json_chart())

            if split[0] in ['REP', 'REPLY', 'REPORT']:
                if split[2] == rx_strings[rx_type]['battery']:
                    self.set_battery(split[3])
                elif split[2] == rx_strings[rx_type]['name']:
                    self.set_chan_name_raw(' '.join(split[3:]))
                elif split[2] == rx_strings[rx_type]['frequency']:
                    self.set_frequency(split[3])
                elif split[2] == rx_strings[rx_type]['tx_offset']:
                    self.set_tx_offset(split[3])

                if self not in data_update_list:
                    data_update_list.append(self)

        except Exception as e:
            print("Index Error(TX): {}".format(data.split()))
            print(e)

    def parse_sample(self, data, rx_type):
        split = data.split()
        if rx_type in ['qlxd', 'ulxd']:
            self.set_antenna(split[3])
            self.set_rf_level(split[4])
            self.set_audio_level(split[5])

        elif rx_type == 'uhfr':
            self.set_antenna(split[3])
            self.set_rf_level(split[4])
            self.set_battery(split[6])
            self.set_audio_level(split[7])

        elif rx_type == 'axtd':
            self.set_antenna(split[7])
            self.set_rf_level(split[9])
            self.set_audio_level(split[6])
        # if self.slot == 6:
        #     print(data)
