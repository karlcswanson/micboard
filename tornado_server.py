from tornado import websocket, web, ioloop
import json
import threading
import time
import os
import shure
import asyncio

cl = []

settings = {
    'static_path': os.path.join(os.path.dirname(__file__), "static")
    }


# https://stackoverflow.com/questions/5899497/checking-file-extension
def fileList(extension):
    files = []
    fileList = os.listdir(os.path.join(os.path.dirname(__file__), "static/backgrounds"))
    # print(fileList)
    for file in fileList:
        if file.lower().endswith(extension):
            files.append(file)
    return files


def json_rxs(rxs):
    data = []
    for rx in rxs:
        data.append(rx.rx_json())

    gifs = fileList('.gif')
    jpgs = fileList('.jpg')

    return json.dumps({'receivers': data, 'gif': gifs, 'jpg': jpgs}, sort_keys=True, indent=4)

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
            # self.write_message('WELCOME BOYS!')
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
    (r'/node_modules/(.*)', web.StaticFileHandler, {'path': 'node_modules/'}),
    (r'/(rest_api_example.png)', web.StaticFileHandler, {'path': './'}),
], **settings)


def writeWeb(data):
    for c in cl:
        c.write_message(data)

def twisted():
    # https://github.com/tornadoweb/tornado/issues/2308
    asyncio.set_event_loop(asyncio.new_event_loop())
    app.listen(8058)
    ioloop.IOLoop.instance().start()

def socket_send():
    while True:
        writeWeb(shure.data_output_queue.get())

def main():
    shure.config(os.path.join(os.path.dirname(__file__), 'config.ini'))

    time.sleep(.1)
    t1 = threading.Thread(target=shure.WirelessQueue)
    t2 = threading.Thread(target=shure.SocketService)
    t3 = threading.Thread(target=twisted)
    t1.start()
    t2.start()
    t3.start()
    socket_send()
    # while True:
        # time.sleep(1)



if __name__ == '__main__':
    main()
