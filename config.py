import shure
import re
import os
import sys
import json

APPNAME = 'micboard'

CONFIG_FILE_NAME = 'config.json'

config_tree = {}

gif_dir = ''


def local_app_dir():
    path = os.getcwd()
    if sys.platform.startswith('linux'):
        path = os.getenv('XDG_DATA_HOME', os.path.expanduser("~/.local/share"))
    elif sys.platform == 'win32':
        path = os.getenv('LOCALAPPDATA')
    elif sys.platform == 'darwin':
        path = os.path.expanduser('~/Library/Application Support/')
    return path


def default_app_config_dir():
    path = os.path.join(local_app_dir(),APPNAME)
    if not os.path.exists(path):
        os.makedirs(path)
    return path

def current_dir():
    return os.path.dirname(__file__)

def default_gif_dir():
    path = os.path.join(default_app_config_dir(),'backgrounds')
    if not os.path.exists(path):
        os.makedirs(path)
    print("GIFCHECK!")
    return path

def get_gif_dir():
    if config_tree.get('background-folder'):
        return os.path.expanduser(config_tree.get('background-folder'))
    else:
        return default_gif_dir()

def config_path():
    if os.path.exists(os.path.join(current_dir(),CONFIG_FILE_NAME)):
        return os.path.join(current_dir(),CONFIG_FILE_NAME)
    elif os.path.exists(os.path.join(default_app_config_dir(),CONFIG_FILE_NAME)):
        return os.path.join(default_app_config_dir(),CONFIG_FILE_NAME)
    else:
        print('No valid config found!')
        print('Please save config to {}'.format(os.path.join(default_app_config_dir(),CONFIG_FILE_NAME)))
        exit()

def config():
    return read_json_config(config_path())

def read_json_config(file):
    global config_tree
    global gif_dir
    with open(file) as config_file:
        config_tree = json.load(config_file)

        for tx in config_tree['slots']:
            rec = shure.check_add_receiver(tx['ip'],tx['type'])
            rec.add_transmitter(tx['channel'],tx['slot'])

    gif_dir = get_gif_dir()
