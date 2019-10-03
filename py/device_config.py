BASE_CONST = {}


BASE_CONST['uhfr'] = {
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'UDP',
    'ch_const' : {
        'battery': 'TX_BAT',
        'quality': 'NOTSUPPORTED',
        'frequency': 'FREQUENCY',
        'name': 'CHAN_NAME',
        'tx_offset': 'NOTQWERT',
        'runtime' : 'NOTQWERT',
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
    },
    'DCID_MODEL' : {
        'UR4S' : 1,
        'UR4D' : 2,
    }
}

BASE_CONST['qlxd'] = {
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL' : 'TCP',
    'ch_const' : {
        'battery': 'BATT_BARS',
        'quality': 'NOTSUPPOTTED',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LVL',
        'rf_level': 'RX_RF_LVL',
        'name': 'CHAN_NAME',
        'antenna': 'RF_ANTENNA',
        'tx_offset' : 'TX_OFFSET',
        'runtime' : 'BATT_RUN_TIME',
        },
    'base_const' : {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    },
    'DCID_MODEL' : {
        'QLX-DSingle' : 1,
        'QLX-D1GSingle' : 1,
        'QLX-DIsmSingle' : 1,
    }

}

BASE_CONST['ulxd'] = {
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'TCP',
    'ch_const' : {
        'battery': 'BATT_BARS',
        'quality': 'NOT_SUPPORTED',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LVL',
        'rf_level': 'RX_RF_LVL',
        'name': 'CHAN_NAME',
        'antenna': 'RF_ANTENNA',
        'tx_offset' : 'TX_OFFSET',
        'runtime' : 'BATT_RUN_TIME',
    },
    'base_const': {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    },
    'DCID_MODEL' : {
        'ULX-DSingle': 1,
        'ULX-D1GSingle' : 1,
        'ULX-DIsmSingle' : 1,
        'ULX-DDual': 2,
        'ULX-D1GDual' : 2,
        'ULX-DIsmDual' : 2,
        'ULX-DQuad': 4,
        'ULX-D1GQuad' : 4,
        'ULX-DIsmQuad' : 4,
    }
}

BASE_CONST['axtd'] = {
    'DEVICE_CLASS' : 'WirelessMic',
    'PROTOCOL': 'TCP',
    'ch_const' : {
        'battery': 'TX_BATT_BARS',
        'quality': 'CHAN_QUALITY',
        'frequency': 'FREQUENCY',
        'audio_level': 'AUDIO_LEVEL_RMS',
        'rf_level': 'RSSI',
        'name': 'CHAN_NAME',
        'antenna': 'ANTENNA_STATUS',
        'tx_offset': 'TX_OFFSET',
        'runtime' : 'TX_BATT_MINS',
    },
    'base_const' : {
        'getAll' : ['< GET {} ALL >'],
        'query' : [
            '< GET {} CHAN_NAME >',
            '< GET {} TX_BATT_BARS >'
        ],
        'meter_stop' : '< SET {} METER_RATE 0 >'
    },
    'DCID_MODEL' : {
        'AD4D': 2,
        'AD4Q': 4,
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
    },
    'DCID_MODEL' : {
        'PSM1KTx': 2,
    }
}
