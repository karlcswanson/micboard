import configparser
import shure
import re



config = {}

def read_config(file):
    cfg = configparser.ConfigParser()
    cfg.read(file)
    print(cfg['micboard']['prefixes'])


    for element in cfg.sections():
        if 'slot' in element:
            slot = int(re.search(r'\d+', repr(element)).group())
            rec = shure.check_add_receiver(cfg[element]['ip'],cfg[element]['type'])
            rec.add_transmitter(cfg.getint(element,'channel'),slot)

        if 'display' in element:
            display = int(re.search(r'\d+', repr(element)).group())
            start_slot = cfg[element]['start_slot']
            stop_slot = cfg[element]['stop_slot']

            print("display: {} start: {} stop: {}".format(display, start_slot, stop_slot))
