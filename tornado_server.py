from tornado import websocket, web, ioloop, escape
import json
import threading
import time
import datetime
import os
import asyncio
import socket

import shure
import config
import discover


# https://stackoverflow.com/questions/5899497/checking-file-extension
def fileList(extension):
    files = []
    fileList = os.listdir(config.gif_dir)
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
    mp4s = fileList('.mp4')

    url = localURL()
    discovered = discover.discovered



    return json.dumps({'receivers': data, 'url': url, 'gif': gifs, 'jpg': jpgs, 'mp4': mp4s,
                       'config': config.config_tree, 'discovered': discovered },
                       sort_keys=True, indent=4)

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render(config.app_dir("static/index.html"))

class JsonHandler(web.RequestHandler):
    def get(self):
        self.set_header('Content-Type','application/json')
        self.write(json_rxs(shure.WirelessReceivers))

class SocketHandler(websocket.WebSocketHandler):
    clients = set()

    # def initialize(self):
    #     print("INIRT")
    #     ioloop.PeriodicCallback(self.ws_dump,100).start()


    def check_origin(self, origin):
        return True

    def open(self):
        self.clients.add(self)

    def on_close(self):
        self.clients.remove(self)

    @classmethod
    def broadcast(cls, data):
        for c in cls.clients:
            try:
                c.write_message(data)
            except:
                print("WS Error")

    @classmethod
    def ws_dump(cls):
        out = {}
        if shure.chart_update_list:
            out['chart-update'] = shure.chart_update_list

        if shure.data_update_list:
            out['data-update'] = []
            for tx in shure.data_update_list:
                out['data-update'].append(tx.tx_json_mini())

        if out:
            data = json.dumps(out)
            cls.broadcast(data)
        del shure.chart_update_list[:]
        del shure.data_update_list[:]

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
                f = open(os.path.join(config.gif_dir, filename), 'wb')
                f.write(body)
        self.write('OK')

class SettingsBulkUploadHandler(web.RequestHandler):
    def post(self):
        settings = escape.json_decode(self.request.body)
        config.write_json_config(settings)
        self.write('OK')



def twisted():
    app = web.Application([
        (r'/', IndexHandler),
        (r'/ws', SocketHandler),
        (r'/data', JsonHandler),
        (r'/upload', UploadHandler),
        (r'/api/settings/bulkuploader', SettingsBulkUploadHandler),
        (r'/static/(.*)', web.StaticFileHandler, {'path': config.app_dir('static')}),
        (r'/bg/(.*)', web.StaticFileHandler, {'path': config.get_gif_dir()})
    ])
    # https://github.com/tornadoweb/tornado/issues/2308
    asyncio.set_event_loop(asyncio.new_event_loop())
    app.listen(config.config_tree['port'])
    ioloop.PeriodicCallback(SocketHandler.ws_dump,50).start()
    ioloop.IOLoop.instance().start()
