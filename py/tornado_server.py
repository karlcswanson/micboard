import json
import os
import asyncio
import socket
import logging

from tornado import websocket, web, ioloop, escape

import shure
import config
import discover
import offline


# https://stackoverflow.com/questions/5899497/checking-file-extension
def file_list(extension):
    files = []
    dir_list = os.listdir(config.gif_dir)
    # print(fileList)
    for file in dir_list:
        if file.lower().endswith(extension):
            files.append(file)
    return files

# Its not efficecent to get the IP each time, but for now we'll assume server might have dynamic IP
def localURL():
    if 'local_url' in config.config_tree:
        return config.config_tree['local_url']
    try:
        ip = socket.gethostbyname(socket.gethostname())
        return 'http://{}:{}'.format(ip, config.config_tree['port'])
    except:
        return 'https://micboard.io'
    return 'https://micboard.io'

def micboard_json(network_devices):
    offline_devices = offline.offline_json()
    data = []
    discovered = []
    for net_device in network_devices:
        data.append(net_device.net_json())

    if offline_devices:
        data.append(offline_devices)

    gifs = file_list('.gif')
    jpgs = file_list('.jpg')
    mp4s = file_list('.mp4')
    url = localURL()

    for device in discover.time_filterd_discovered_list():
        discovered.append(device)

    return json.dumps({
        'receivers': data, 'url': url, 'gif': gifs, 'jpg': jpgs, 'mp4': mp4s,
        'config': config.config_tree, 'discovered': discovered
    }, sort_keys=True, indent=4)

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render(config.app_dir('demo.html'))

class AboutHandler(web.RequestHandler):
    def get(self):
        self.render(config.app_dir('static/about.html'))

class JsonHandler(web.RequestHandler):
    def get(self):
        self.set_header('Content-Type', 'application/json')
        self.write(micboard_json(shure.NetworkDevices))

class SocketHandler(websocket.WebSocketHandler):
    clients = set()

    def check_origin(self, origin):
        return True

    def open(self):
        self.clients.add(self)

    def on_close(self):
        self.clients.remove(self)

    @classmethod
    def close_all_ws(cls):
        for c in cls.clients:
            c.close()

    @classmethod
    def broadcast(cls, data):
        for c in cls.clients:
            try:
                c.write_message(data)
            except:
                logging.warning("WS Error")

    @classmethod
    def ws_dump(cls):
        out = {}
        if shure.chart_update_list:
            out['chart-update'] = shure.chart_update_list

        if shure.data_update_list:
            out['data-update'] = []
            for ch in shure.data_update_list:
                out['data-update'].append(ch.ch_json_mini())

        if config.group_update_list:
            out['group-update'] = config.group_update_list

        if out:
            data = json.dumps(out)
            cls.broadcast(data)
        del shure.chart_update_list[:]
        del shure.data_update_list[:]
        del config.group_update_list[:]

class SlotHandler(web.RequestHandler):
    def get(self):
        self.write("hi - slot")

    def post(self):
        data = json.loads(self.request.body)
        self.write('{}')
        for slot_update in data:
            config.update_slot(slot_update)
            print(slot_update)

class ConfigHandler(web.RequestHandler):
    def get(self):
        self.write("hi - slot")

    def post(self):
        data = json.loads(self.request.body)
        print(data)
        self.write('{}')
        config.reconfig(data)

class GroupUpdateHandler(web.RequestHandler):
    def get(self):
        self.write("hi - group")

    def post(self):
        data = json.loads(self.request.body)
        config.update_group(data)
        print(data)
        self.write(data)

class MicboardReloadConfigHandler(web.RequestHandler):
    def post(self):
        print("RECONFIG")
        config.reconfig()
        self.write("restarting")



# https://stackoverflow.com/questions/12031007/disable-static-file-caching-in-tornado
class NoCacheHandler(web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')


def twisted():
    app = web.Application([
        (r'/', IndexHandler),
        (r'/about', AboutHandler),
        (r'/ws', SocketHandler),
        (r'/data.json', JsonHandler),
        (r'/api/group', GroupUpdateHandler),
        (r'/api/slot', SlotHandler),
        (r'/api/config', ConfigHandler),
        # (r'/restart/', MicboardReloadConfigHandler),
        (r'/static/(.*)', web.StaticFileHandler, {'path': config.app_dir('static')}),
        (r'/bg/(.*)', NoCacheHandler, {'path': config.get_gif_dir()})
    ])
    # https://github.com/tornadoweb/tornado/issues/2308
    asyncio.set_event_loop(asyncio.new_event_loop())
    app.listen(config.web_port())
    ioloop.PeriodicCallback(SocketHandler.ws_dump, 50).start()
    ioloop.IOLoop.instance().start()
