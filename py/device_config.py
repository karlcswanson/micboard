BASE_CONST = {}


BASE_CONST['uhfr'] = {
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'UDP',
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
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL' : 'TCP',
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
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'TCP',
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
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'TCP',
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

BASE_CONST['p10t'] = {
    'DEVICE_CLASS' : 'IEM',
    'PROTOCOL': 'TCP',
    'ch_const' : {
        'frequency': 'FREQUENCY',
        'audio_level_l': 'AUDIO_IN_LVL_L',
        'audio_level_r': 'AUDIO_IN_LVL_R',
        'name': 'CHAN_NAME',
        'tx_offset': 'TX_OFFSET'
    },
    'base_const' : {
        'getAll' : [
            '< GET {} CHAN_NAME >\r\n',
            '< GET {} FREQUENCY >\r\n'
        ],
        'query' : ['< GET {} CHAN_NAME >\r\n'],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    }
}
