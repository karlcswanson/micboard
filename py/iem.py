import time
import logging

from device_config import BASE_CONST
from channel import ChannelDevice, data_update_list, chart_update_list

class IEM(ChannelDevice):
    def __init__(self, rx, cfg):
        super().__init__(rx, cfg)
        self.audio_level_l = 0
        self.audio_level_r = 0


    def set_audio_level(self, audio_level, side):
        if side == 'LEFT':
            self.audio_level_r = audio_level
        elif side == 'RIGHT':
            self.audio_level_r = audio_level

    def parse_report(self, split):
        if split[2] == self.CHCONST['name']:
            self.set_chan_name_raw(' '.join(split[3:]))
        elif split[2] == self.CHCONST['frequency']:
            self.set_frequency(split[3])
        elif split[2] == self.CHCONST['audio_level_l']:
            self.set_audio_level(split[3], 'LEFT')
        elif split[2] == self.CHCONST['audio_level_r']:
            self.set_audio_level(split[3], 'RIGHT')
            chart_update_list.append(self.chart_json())

    def parse_sample(self, split):
        pass

    def chart_json(self):
        # audio_level = self.audio_level
        # rf_level = self.rf_level
        # timestamp = time.time()

        return {
            'audio_level_l': self.audio_level_l,
            'audio_level_r': self.audio_level_r,
            'slot': self.slot,
            'type': self.rx.type,
            'timestamp': time.time()
        }


    def ch_json(self):
        name = self.get_chan_name()
        return {
            'id': name[0], 'name': name[1], 'channel': self.channel,
            'audio_level_l' : self.audio_level_l, 'audio_level_r' : self.audio_level_r,
            'frequency': self.frequency, 'slot': self.slot, 'raw': self.raw,
            'type': self.rx.type, 'name_raw' : self.chan_name_raw
        }
