import cherrypy
import json
import threading
import time
import os
import shure

PORT = 8058

conf = {
        '/': {
            'tools.trailing_slash.extra': False
            },

        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'),
            'tools.staticdir.index': "1080.html"
        }
    }
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
    @cherrypy.expose
    def data(self):
        response = cherrypy.response
        response.headers['Content-Type'] = 'application/json'
        return json_rxs(shure.WirelessReceivers)


def http():
    cherrypy.server.socket_host = '0.0.0.0'
    cherrypy.quickstart(HelloWorld(),'/',conf)

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
