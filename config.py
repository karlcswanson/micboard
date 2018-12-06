import shure
import re
import os
import sys
import json
from shutil import copyfile


APPNAME = 'micboard'

CONFIG_FILE_NAME = 'config.json'

config_tree = {}

gif_dir = ''


group_update_list = []


def local_app_dir():
    path = os.getcwd()
    if sys.platform.startswith('linux'):
        path = os.getenv('XDG_DATA_HOME', os.path.expanduser("~/.local/share"))
    elif sys.platform == 'win32':
        path = os.getenv('LOCALAPPDATA')
    elif sys.platform == 'darwin':
        path = os.path.expanduser('~/Library/Application Support/')
    return path


def default_app_config_dir(folder = None):
    path = os.path.join(local_app_dir(),APPNAME)
    if not os.path.exists(path):
        os.makedirs(path)

    if folder:
        return os.path.join(path,folder)
    return path

# https://stackoverflow.com/questions/404744/determining-application-path-in-a-python-exe-generated-by-pyinstaller
def app_dir(folder = None):
    if getattr(sys, 'frozen', False):
        # application_path = os.path.dirname(sys.executable)
        application_path = sys._MEIPASS
    elif __file__:
        application_path = os.path.dirname(__file__)

    if folder:
        return os.path.join(application_path,folder)

    return application_path

def default_gif_dir():
    path = default_app_config_dir('backgrounds')
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
    if os.path.exists(app_dir(CONFIG_FILE_NAME)):
        return app_dir(CONFIG_FILE_NAME)
    elif os.path.exists(default_app_config_dir(CONFIG_FILE_NAME)):
        return default_app_config_dir(CONFIG_FILE_NAME)
    else:
        copyfile(app_dir('democonfig.json'),default_app_config_dir(CONFIG_FILE_NAME))
        return default_app_config_dir(CONFIG_FILE_NAME)


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


def write_json_config(data):
    with open(config_path(),'w') as config_file:
        json.dump(data,config_file, indent=2, separators=(',',': '), sort_keys=True)

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

    save_current_config()
