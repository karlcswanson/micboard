from tornado import websocket, web, ioloop
import json
import threading
import time
import os
import asyncio
import socket

import shure
import config


# PORT = 8058
cl = []

UPLOAD_FILE_PATH = os.path.join(os.path.dirname(__file__), 'static/backgrounds/')

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

# Its not efficecent to get the IP each time, but for now we'll assume server might have dynamic IP
def localURL():
    ip = socket.gethostbyname(socket.gethostname())
    return 'http://{}:{}'.format(ip,config.config_tree['port'])

def json_rxs(rxs):
    data = []
    for rx in rxs:
        data.append(rx.rx_json())

    gifs = fileList('.gif')
    jpgs = fileList('.jpg')
    url = localURL()



    return json.dumps({'receivers': data, 'url': url, 'gif': gifs, 'jpg': jpgs,
                       'config': config.config_tree }, sort_keys=True, indent=4)

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

# https://github.com/tornadoweb/tornado/blob/master/demos/file_upload/file_receiver.py
class UploadHandler(web.RequestHandler):
    def post(self):
        filename = self.get_argument('filename')
        for field_name, files in self.request.files.items():
            for info in files:
                # filename = info['filename']
                content_type = info['content_type']
                body = info['body']
                print('POST {} {} {} bytes'.format(filename, content_type, len(body)))
                f = open(UPLOAD_FILE_PATH + filename, 'wb')
                f.write(body)
        self.write('OK')



app = web.Application([
    (r'/', IndexHandler),
    (r'/ws', SocketHandler),
    (r'/api', ApiHandler),
    (r'/data', JsonHandler),
    (r'/upload', UploadHandler),
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
    app.listen(config.config_tree['port'])
    ioloop.IOLoop.instance().start()

def socket_send():
    while True:
        writeWeb(shure.data_output_queue.get())
