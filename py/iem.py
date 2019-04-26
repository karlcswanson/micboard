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
        audio_level = int(audio_level)
        if audio_level < 10272:
            audio_level = 0
        elif 10272 <= audio_level < 23728:
            audio_level = 10
        elif 23728 <= audio_level < 85488:
            audio_level = 20
        elif 85488 <= audio_level < 246260:
            audio_level = 30
        elif 246260 <= audio_level < 641928:
            audio_level = 40
        elif 641928 <= audio_level < 1588744:
            audio_level = 50
        elif 1588744 <= audio_level < 2157767:
            audio_level = 60
        elif 2157767 <= audio_level < 2502970:
            audio_level = 70
        elif 2502970 <= audio_level:
            audio_level = 80

        if side == 'LEFT':
            self.audio_level_l = audio_level
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

    def ch_state(self):
        if self.rx.rx_com_status in ['DISCONNECTED', 'CONNECTING']:
            return 'RX_COM_ERROR'

        if self.rx.rx_com_status == 'CONNECTED':
            return 'UNASSIGNED'

        return 'TX_COM_ERROR'

    def chart_json(self):

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
            'id': name[0], 'name': name[1], 'channel': self.channel, 'status': self.ch_state(),
            'audio_level_l' : self.audio_level_l, 'audio_level_r' : self.audio_level_r,
            'frequency': self.frequency, 'slot': self.slot, 'raw': self.raw,
            'type': self.rx.type, 'name_raw' : self.chan_name_raw
        }

    def ch_json_mini(self):
        data = self.ch_json()
        data['timestamp'] = time.time()
        del data['raw']
        return data
