import time
import logging

from device_config import BASE_CONST
from channel import ChannelDevice, data_update_list, chart_update_list


BATTERY_TIMEOUT = 30*60
PEAK_TIMEOUT = 10


PEAK_LEVEL = {
    'qlxd': 80,
    'ulxd': 80,
    'axtd': 90,
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

class WirelessMic(ChannelDevice):
    def __init__(self, rx, cfg):
        super().__init__(rx, cfg)
        self.battery = 255
        self.prev_battery = 255
        self.prev_battery_uhfr_raw = 255
        self.audio_level = 0
        self.rf_level = 0
        self.antenna = 'XX'
        self.tx_offset = 255
        self.peakstamp = time.time() - 60
        self.quality = 255

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

    def set_tx_quality(self, quality):
        self.quality = int(quality)

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

    def ch_json(self):
        name = self.get_chan_name()
        return {
            'id': name[0], 'name': name[1], 'channel': self.channel,
            'antenna':self.antenna, 'audio_level': self.audio_level,
            'rf_level': self.rf_level, 'frequency': self.frequency,
            'battery':self.battery, 'tx_offset': self.tx_offset, 'quality': self.quality,
            'status': self.tx_state(), 'slot': self.slot, 'raw': self.raw,
            'type': self.rx.type, 'name_raw' : self.chan_name_raw
        }

    def ch_json_mini(self):
        data = self.ch_json()
        data['timestamp'] = time.time()
        del data['raw']
        return data

    def chart_json(self):
        return {
            'audio_level': self.audio_level,
            'rf_level': self.rf_level,
            'slot': self.slot,
            'type': self.rx.type,
            'timestamp': time.time()
        }

    def parse_sample(self, split):
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
            self.set_tx_quality(split[3])

    def parse_report(self, split):
        if split[2] == self.CHCONST['battery']:
            self.set_battery(split[3])
        elif split[2] == self.CHCONST['name']:
            self.set_chan_name_raw(' '.join(split[3:]))
        elif split[2] == self.CHCONST['quality']:
            self.set_tx_quality(split[3])
        elif split[2] == self.CHCONST['frequency']:
            self.set_frequency(split[3])
        elif split[2] == self.CHCONST['tx_offset']:
            self.set_tx_offset(split[3])
