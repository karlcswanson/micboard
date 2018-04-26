import cherrypy
import json
import threading
import time
import shure

PORT = 8058

cherrypy.config.update({'server.socket_port': PORT})

def rx_data(rx):
    tx_data = []
    for tx in rx.transmitters:
        tx_data.append({'name': tx.chan_name, 'channel': tx.channel,
                        'frequency': tx.frequency, 'battery':tx.battery,
                        'status': tx.tx_state(), 'slot': tx.slot })

    data = {'ip': rx.ip, 'type': rx.type, 'tx': tx_data}
    return data

def json_rxs(rxs):
    data = []
    for rx in rxs:
        data.append(rx_data(rx))

    return json.dumps({'receivers': data}, sort_keys=True, indent=4)

class HelloWorld(object):
    def index(self):
        response = cherrypy.response
        response.headers['Content-Type'] = 'application/json'
        return json_rxs(shure.WirelessReceivers)
    index.exposed = True

def http():
    cherrypy.quickstart(HelloWorld())

def main():
    shure.config()
    t1 = threading.Thread(target=shure.WirelessPoll)
    t2 = threading.Thread(target=shure.WirelessListen)
    t3 = threading.Thread(target=http)

    t1.start()
    t2.start()
    t3.start()

if __name__ == '__main__':
    main()
