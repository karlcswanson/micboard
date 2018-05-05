from tornado import websocket, web, ioloop
import json
import threading
import time
import os
import shure
import asyncio

cl = []


def json_rxs(rxs):
    data = []
    for rx in rxs:
        data.append(rx.rx_json())
    return json.dumps({'receivers': data}, sort_keys=True, indent=4)

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render("static/index.html")

class JsonHandler(web.RequestHandler):
    def get(self):
        self.set_header('Content-Type','application/json')
        self.write(json_rxs(shure.WirelessReceivers))

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            self.write_message('WELCOME BOYS!')
            cl.append(self)

    def on_close(self):
        if self in cl:
            cl.remove(self)

class ApiHandler(web.RequestHandler):
    @web.asynchronous
    def get(self, *args):
        self.finish()
        id = self.get_argument("id")
        value = self.get_argument("value")
        data = {"id": id, "value" : value}
        data = json.dumps(data)
        for c in cl:
            c.write_message(data)

    @web.asynchronous
    def post(self):
        pass

app = web.Application([
    (r'/', IndexHandler),
    (r'/ws', SocketHandler),
    (r'/api', ApiHandler),
    (r'/data', JsonHandler),
    (r'/(favicon.ico)', web.StaticFileHandler, {'path': '../'}),
    (r'/static/(.*)', web.StaticFileHandler, {'path': 'static/'}),
    (r'/(rest_api_example.png)', web.StaticFileHandler, {'path': './'}),
])


def writeWeb(data):
    for c in cl:
        c.write_message(data)

def twisted():
    # https://github.com/tornadoweb/tornado/issues/2308
    asyncio.set_event_loop(asyncio.new_event_loop())
    app.listen(8058)
    ioloop.IOLoop.instance().start()



def timeGen():
    value = 0
    while True:
        time.sleep(3)
        print('YOSH!')
        val = json.dumps({"id": 2, "value" : value})
        value = value + 1
        writeWeb(val)

def main():
    shure.dataUpdateCall = writeWeb
    shure.config('config.ini')
    time.sleep(1)
    t1 = threading.Thread(target=shure.WirelessPoll)
    t2 = threading.Thread(target=shure.WirelessListen)
    t3 = threading.Thread(target=twisted)
    # t4 = threading.Thread(target=timeGen)
    t1.start()
    t2.start()
    t3.start()
    # t4.start()



if __name__ == '__main__':
    main()
