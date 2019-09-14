OfflineDevices = []

class OfflineDevice:
    def __init__(self, cfg):
        self.cfg = cfg
        self.slot = cfg['slot']

    def get_chan_name(self):
        chan_id = ''
        chan_name = ''

        if 'extended_id' in self.cfg:
            chan_id = self.cfg['extended_id']

        if 'extended_name' in self.cfg:
            chan_name = self.cfg['extended_name']


        return(chan_id, chan_name)


    def ch_json(self):
        name = self.get_chan_name()
        return {
            'id': name[0],
            'name': name[1],
            'type': 'offline',
            'status': 'UNASSIGNED',
            'slot': self.slot,
            'name_raw' : name[0] + ' ' + name[1],
            'frequency': '000000'
        }

def offline_json():
    output = []
    for offline_slot in OfflineDevices:
        output.append(offline_slot.ch_json())

    data = {
        'type': 'offline',
        'tx': output,
        'ip': 'offine device',
    }

    return data

def add_device(chan):
    slot = OfflineDevice(chan)
    OfflineDevices.append(slot)
