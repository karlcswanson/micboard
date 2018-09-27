import configparser
import shure
import re

import os
import sys

APPNAME = 'micboard'

config = {}




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
    if os.path.exists(os.path.join(current_dir(),'config.ini')):
        return os.path.join(current_dir(),'config.ini')
    elif os.path.exists(os.path.join(app_config_dir(),'config.ini')):
        return os.path.join(app_config_dir(),'config.ini')
    else:
        print('No valid config found!')
        print('Please save config to {}'.format(os.path.join(app_config_dir(),'config.ini')))
        exit()

def read_config(file):
    cfg = configparser.ConfigParser()
    cfg.read(file)
    # print(cfg['micboard']['prefixes'])


    for element in cfg.sections():
        if 'slot' in element:
            slot = int(re.search(r'\d+', repr(element)).group())
            rec = shure.check_add_receiver(cfg[element]['ip'],cfg[element]['type'])
            rec.add_transmitter(cfg.getint(element,'channel'),slot)

        # if 'display' in element:
            # display = int(re.search(r'\d+', repr(element)).group())
            # start_slot = cfg[element]['start_slot']
            # stop_slot = cfg[element]['stop_slot']

            # print("display: {} start: {} stop: {}".format(display, start_slot, stop_slot))
