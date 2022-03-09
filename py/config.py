import os
import sys
import json
import logging
import argparse
import uuid
import time
from shutil import copyfile

import shure
import offline
import tornado_server

APPNAME = 'micboard'

CONFIG_FILE_NAME = 'config.json'

FORMAT = '%(asctime)s %(levelname)s:%(message)s'

config_tree = {}

gif_dir = ''

group_update_list = []

args = {}

def uuid_init():
    if 'uuid' not in config_tree:
        micboard_uuid = str(uuid.uuid4())
        logging.info('Adding UUID: {} to config.conf'.format(micboard_uuid))
        config_tree['uuid'] = micboard_uuid
        save_current_config()


def logging_init():
    formatter = logging.Formatter(FORMAT)
    log = logging.getLogger()
    log.setLevel(logging.DEBUG)

    sthandler = logging.StreamHandler(sys.stdout)
    fhandler = logging.handlers.RotatingFileHandler(log_file(),
                                                    maxBytes=10*1024*1024,
                                                    backupCount=5)

    sthandler.setFormatter(formatter)
    fhandler.setFormatter(formatter)

    log.addHandler(sthandler)
    log.addHandler(fhandler)


def web_port():
    if args['server_port'] is not None:
        return int(args['server_port'])

    elif 'MICBOARD_PORT' in os.environ:
        return int(os.environ['MICBOARD_PORT'])

    return config_tree['port']


def os_config_path():
    path = os.getcwd()
    if sys.platform.startswith('linux'):
        path = os.getenv('XDG_DATA_HOME', os.path.expanduser("~/.local/share"))
    elif sys.platform == 'win32':
        path = os.getenv('LOCALAPPDATA')
    elif sys.platform == 'darwin':
        path = os.path.expanduser('~/Library/Application Support/')
    return path


def config_path(folder=None):
    if args['config_path'] is not None:
        if os.path.exists(os.path.expanduser(args['config_path'])):
            path = os.path.expanduser(args['config_path'])
        else:
            logging.warning("Invalid config path")
            sys.exit()

    else:
        path = os.path.join(os_config_path(), APPNAME)
        if not os.path.exists(path):
            os.makedirs(path)

    if folder:
        return os.path.join(path, folder)
    return path

def log_file():
    return config_path('micboard.log')

# https://stackoverflow.com/questions/404744/determining-application-path-in-a-python-exe-generated-by-pyinstaller
def app_dir(folder=None):
    if getattr(sys, 'frozen', False):
        application_path = sys._MEIPASS
        return os.path.join(application_path, folder)

    if __file__:
        application_path = os.path.dirname(__file__)

    return os.path.join(os.path.dirname(application_path), folder)


def default_gif_dir():
    path = config_path('backgrounds')
    if not os.path.exists(path):
        os.makedirs(path)
    print("GIFCHECK!")
    return path

def get_gif_dir():
    if args['background_directory'] is not None:
        if os.path.exists(os.path.expanduser(args['background_directory'])):
            return os.path.expanduser(args['background_directory'])
        else:
            logging.warning("invalid config path")
            sys.exit()

    if config_tree.get('background-folder'):
        return os.path.expanduser(config_tree.get('background-folder'))
    return default_gif_dir()

def config_file():
    if os.path.exists(app_dir(CONFIG_FILE_NAME)):
        return app_dir(CONFIG_FILE_NAME)
    elif os.path.exists(config_path(CONFIG_FILE_NAME)):
        return config_path(CONFIG_FILE_NAME)
    else:
        copyfile(app_dir('democonfig.json'), config_path(CONFIG_FILE_NAME))
        return config_path(CONFIG_FILE_NAME)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--config-path', help='configuration directory')
    parser.add_argument('-p', '--server-port', help='server port')
    parser.add_argument('-b', '--background-directory', help='background directory')
    args,_ = parser.parse_known_args()

    return vars(args)


def config():
    global args
    args = parse_args()
    logging_init()
    read_json_config(config_file())
    uuid_init()


    logging.info('Starting Micboard {}'.format(config_tree['micboard_version']))


def config_mix(slots):
    for slot in slots:
        current = get_slot_by_number(slot['slot'])
        if current:
            if 'extended_id' in current:
                slot['extended_id'] = current['extended_id']

            if 'extended_name' in current:
                slot['extended_name'] = current['extended_name']

            if 'chan_name_raw' in current:
                slot['chan_name_raw'] = current['chan_name_raw']

    return slots


def reconfig(slots):
    tornado_server.SocketHandler.close_all_ws()

    config_tree['slots'] = config_mix(slots)

    save_current_config()

    config_tree.clear()
    for device in shure.NetworkDevices:
        # device.socket_disconnect()
        device.disable_metering()
        del device.channels[:]

    del shure.NetworkDevices[:]
    del offline.OfflineDevices[:]

    time.sleep(2)

    config()
    for rx in shure.NetworkDevices:
        rx.socket_connect()

def get_version_number():
    with open(app_dir('package.json')) as package:
        pkginfo = json.load(package)

    return pkginfo['version']

def read_json_config(file):
    global config_tree
    global gif_dir
    with open(file) as config_file:
        config_tree = json.load(config_file)

        for chan in config_tree['slots']:
            if chan['type'] in ['uhfr', 'qlxd', 'ulxd', 'axtd', 'p10t']:
                netDev = shure.check_add_network_device(chan['ip'], chan['type'])
                netDev.add_channel_device(chan)

            elif chan['type'] == 'offline':
                offline.add_device(chan)


    gif_dir = get_gif_dir()
    config_tree['micboard_version'] = get_version_number()

def write_json_config(data):
    with open(config_file(), 'w') as f:
        json.dump(data, f, indent=2, separators=(',', ': '), sort_keys=True)

def save_current_config():
    return write_json_config(config_tree)

def get_group_by_number(group_number):
    for group in config_tree['groups']:
        if group['group'] == int(group_number):
            return group
    return None

def update_group(data):
    group_update_list.append(data)
    group = get_group_by_number(data['group'])
    if not group:
        group = {}
        group['group'] = data['group']
        config_tree['groups'].append(group)

    group['slots'] = data['slots']
    group['title'] = data['title']
    group['hide_charts'] = data['hide_charts']

    save_current_config()

def get_slot_by_number(slot_number):
    for slot in config_tree['slots']:
        if slot['slot'] == slot_number:
            return slot
    return None

def update_slot(data):
    slot_cfg = get_slot_by_number(data['slot'])
    save_name = False

    if data.get('extended_id'):
        slot_cfg['extended_id'] = data['extended_id']
        save_name = True
    elif 'extended_id' in slot_cfg:
        slot_cfg.pop('extended_id', None)

    if data.get('extended_name'):
        slot_cfg['extended_name'] = data['extended_name']
        save_name = True
    elif 'extended_name' in slot_cfg:
        slot_cfg.pop('extended_name', None)

    if save_name:
        try:
            slot_cfg['chan_name_raw'] = shure.get_network_device_by_slot(data['slot']).chan_name_raw
        except:
            pass

    elif 'chan_name_raw' in slot_cfg:
        slot_cfg.pop('chan_name_raw')

    save_current_config()
