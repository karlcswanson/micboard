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

BASE_CONST = {}


BASE_CONST['uhfr'] = {
    'ch_const' : {
        'battery': 'TX_BAT',
        'frequency': 'FREQUENCY',
        'name': 'CHAN_NAME',
        'tx_offset': 'NOTQWERT',
    },
    'base_const': {
        'getAll' : [
            '* GET {} CHAN_NAME *',
            '* GET {} BATT_BARS *',
            '* GET {} GROUP_CHAN *'
        ],
        'query' : [
            '* GET {} CHAN_NAME *',
            '* GET {} TX_BAT *',
            '* GET {} GROUP_CHAN *'
        ],
        'meter_stop' : '* METER {} ALL STOP *'
    }
}

BASE_CONST['qlxd'] = {
    'ch_const' : {
        'battery': 'BATT_BARS',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LVL',
        'rf_level': 'RX_RF_LVL',
        'name': 'CHAN_NAME',
        'antenna': 'RF_ANTENNA',
        'tx_offset' : 'TX_OFFSET'
        },
    'base_const' : {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    }
}

BASE_CONST['ulxd'] = {
    'ch_const' : {
        'battery': 'BATT_BARS',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LVL',
        'rf_level': 'RX_RF_LVL',
        'name': 'CHAN_NAME',
        'antenna': 'RF_ANTENNA',
        'tx_offset' : 'TX_OFFSET'
    },
    'base_const': {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    }
}

BASE_CONST['axtd'] = {
    'ch_const' : {
        'battery': 'TX_BATT_BARS',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LEVEL_RMS',
        'rf_level': 'RSSI',
        'name': 'CHAN_NAME',
        'antenna': 'ANTENNA_STATUS',
        'tx_offset': 'TX_OFFSET'
    },
    'base_const' : {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} TX_BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    }
}


class ChannelDevice:
    def __init__(self, rx, cfg):
        self.rx = rx
        self.cfg = cfg
        self.chan_name_raw = 'SLOT {}'.format(cfg['slot'])
        self.channel = cfg['channel']
        self.timestamp = time.time() - 60
        self.frequency = '000000'
        self.slot = cfg['slot']
        self.raw = defaultdict(dict)
        self.CHCONST = BASE_CONST[self.rx.type]['ch_const']


    def set_frequency(self, frequency):
        if self.rx.type == 'axtd':
            frequency = frequency.lstrip('0')
        self.frequency = frequency[:3] + '.' + frequency[3:]

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


class IEM(ChannelDevice):
    def __init__(self, rx, cfg):
        super().__init__(rx, cfg)
        self.audio_level_l = 0
        self.audio_level_r = 0

    def tx_json(self):
        name = self.get_chan_name()
        return {
            'id': name[0], 'name': name[1], 'channel': self.channel,
            'frequency': self.frequency, 'slot': self.slot, 'raw': self.raw,
            'type': self.rx.type, 'name_raw' : self.chan_name_raw
        }

class WirelessMic(ChannelDevice):
    def __init__(self, rx, cfg):
        super().__init__(rx, cfg)
        self.battery = 255
        self.prev_battery = 255
        self.prev_battery_uhfr_raw = 255
        self.audio_level = 0
        self.rf_level = 0
        self.antenna = 'XX'
        self.tx_offset = 0
        self.peakstamp = time.time() - 60



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


    def parse_raw_tx(self, data):
        split = data.split()
        self.raw[split[2]] = ' '.join(split[3:])

        try:
            if split[0] == 'SAMPLE' and split[2] == 'ALL':
                self.parse_sample(data)
                chart_update_list.append(self.tx_json_chart())

            if split[0] in ['REP', 'REPLY', 'REPORT']:
                if split[2] == self.CHCONST['battery']:
                    self.set_battery(split[3])
                elif split[2] == self.CHCONST['name']:
                    self.set_chan_name_raw(' '.join(split[3:]))
                elif split[2] == self.CHCONST['frequency']:
                    self.set_frequency(split[3])
                elif split[2] == self.CHCONST['tx_offset']:
                    self.set_tx_offset(split[3])

                if self not in data_update_list:
                    data_update_list.append(self)

        except Exception as e:
            print("Index Error(TX): {}".format(data.split()))
            print(e)

    def parse_sample(self, data):
        split = data.split()
        if self.rx.type in ['qlxd', 'ulxd']:
            self.set_antenna(split[3])
            self.set_rf_level(split[4])
            self.set_audio_level(split[5])

        elif self.rx.type == 'uhfr':
            self.set_antenna(split[3])
            self.set_rf_level(split[4])
            self.set_battery(split[6])
            self.set_audio_level(split[7])

        elif self.rx.type == 'axtd':
            self.set_antenna(split[7])
            self.set_rf_level(split[9])
            self.set_audio_level(split[6])
