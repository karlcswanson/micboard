import configparser
import shure
import re
import os
import sys
import json

APPNAME = 'micboard'

CONFIG_FILE_NAME = 'config.json'

config_tree = {}




def local_app_dir():
    path = os.getcwd()
    if sys.platform.startswith('linux'):
        path = os.getenv('XDG_DATA_HOME', os.path.expanduser("~/.local/share"))
    elif sys.platform == 'win32':
        path = os.getenv('LOCALAPPDATA')
    elif sys.platform == 'darwin':
        path = os.path.expanduser('~/Library/Application Support/')
    return path


def app_config_dir():
    return os.path.join(local_app_dir(),APPNAME)

def current_dir():
    return os.path.dirname(__file__)

def config_path():
    if os.path.exists(os.path.join(current_dir(),CONFIG_FILE_NAME)):
        return os.path.join(current_dir(),CONFIG_FILE_NAME)
    elif os.path.exists(os.path.join(app_config_dir(),CONFIG_FILE_NAME)):
        return os.path.join(app_config_dir(),CONFIG_FILE_NAME)
    else:
        print('No valid config found!')
        print('Please save config to {}'.format(os.path.join(app_config_dir(),CONFIG_FILE_NAME)))
        exit()

# old .ini config parser
def read_config(file):
    cfg = configparser.ConfigParser()
    cfg.read(file)


    for element in cfg.sections():
        if 'slot' in element:
            slot = int(re.search(r'\d+', repr(element)).group())
            rec = shure.check_add_receiver(cfg[element]['ip'],cfg[element]['type'])
            rec.add_transmitter(cfg.getint(element,'channel'),slot)


def read_json_config(file):
    global config_tree
    with open(file) as config_file:
        config_tree = json.load(config_file)
        for tx in config_tree['slots']:
            rec = shure.check_add_receiver(tx['ip'],tx['type'])
            rec.add_transmitter(tx['channel'],tx['slot'])
