import datetime
import time

from influxdb import InfluxDBClient

import config

influx_queue = []

def influx_send_sample(slot):
    chan_id, chan_name = slot.get_chan_name()
    ip_slot = "{}:{}".format(slot.rx.ip, slot.channel)
    json_body = {
        "measurement": "slot_mic_sample",
        "tags": {
            "chan_name": chan_name,
            "slot": slot.slot,
            "chan_id": chan_id,
            "ip_slot": ip_slot
        },
        "time": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        "fields": {
            "status": slot.tx_state(),
            "audio_level": slot.audio_level,
            "rf_level": slot.rf_level,
            "battery": slot.battery,
            "tx_offset": slot.tx_offset,
            "antenna": slot.antenna,
            "frequency": slot.frequency,
        }
    }
    influx_queue.append(json_body)


def influx_thread():
    while True:
        try:
            client.write_points(influx_queue)
            del influx_queue[:]
        except:
            pass
        time.sleep(5)

def setup():
    global client
    auth = config.config_tree['influxdb']
    client = InfluxDBClient(auth['host'], auth['port'], auth['user'],
                            auth['password'], auth['database'])

def main():
    config.config()


if __name__ == '__main__':
    main()
