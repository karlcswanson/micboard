import socket
import struct
import json
import time

import os
import platform
from optparse import OptionParser
import sys


import xml.etree.ElementTree as ET

import config
from device_config import BASE_CONST

MCAST_GRP = '239.255.254.253'
MCAST_PORT = 8427

DEFAULT_DCID_XML = '/Applications/Shure Update Utility.app/Contents/Resources/DCIDMap.xml'


deviceList = {}

discovered = []

# https://stackoverflow.com/questions/603852/multicast-in-python
def discover():
    dcid_restore_from_file(config.app_dir('dcid.json'))
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    # sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1) #mac fix
    sock.bind((MCAST_GRP, MCAST_PORT))  # use MCAST_GRP instead of '' to listen only
                                 # to MCAST_GRP, not all groups on MCAST_PORT
    mreq = struct.pack("4sl", socket.inet_aton(MCAST_GRP), socket.INADDR_ANY)

    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    while True:
        data, (ip, _) = sock.recvfrom(1024)
        data = data.decode('UTF-8', errors="ignore")
        try:
            process_discovery_packet(ip, data)
        except:
            pass

def process_discovery_packet(ip, data):
    dcid = dcid_find(data)
    device = dcid_get(dcid)
    rx_type, channels = dcid_model_lookup(device['model'])
    if __name__ == '__main__':
        print('RX: {} at: {} DCID: {} BAND: {} CHANNELS: {}'.format(rx_type, ip, dcid, device['band'], channels))

    add_rx_to_dlist(ip, rx_type, channels)

def dcid_find(data):
    dcid = ''
    data = data.split(',')
    for i in data:
        i = i.strip('()')

        if 'cd:' in i:
            i = i.split('cd:')[-1]
            dcid = i

    return dcid

def dcid_get(dcid):
    return deviceList[dcid]

def dcid_model_lookup(name):
    for (type_k, type_v) in BASE_CONST.items():
        for (model_k, model_v) in type_v['DCID_MODEL'].items():
            if name == model_k:
                # print('Type: {} DCID_MODEL: {} Channels: {}'.format(type_k, model_k, model_v))
                return (type_k, model_v)
    return None


def add_rx_to_dlist(ip, rx_type, channels):
    rx = next((x for x in discovered if x['ip'] == ip), None)

    if rx:
        rx['timestamp'] = time.time()

    else:
        discovered.append({
            'ip' : ip,
            'type': rx_type,
            'channels': channels,
            'timestamp': time.time()
        })

    discovered.sort(key=lambda x: x['ip'])


def time_filterd_discovered_list():
    out = []
    for i in discovered:
        if (time.time() - i['timestamp']) < 30:
            out.append(i)
    return out


def DCID_Parse(file):
    tree = ET.parse(file)
    root = tree.getroot()

    devices = root.findall('./MapEntry')

    for device in devices:
        model = device.find('Key').text
        model_name = device.find('ModelName').text
        dcid = []
        for dccid in device.find('DCIDList').iter('DCID'):
            try:
                band = dccid.attrib['band']
            except:
                band = ''

            dev = {'model': model,'model_name':model_name, 'band':band }
            deviceList[dccid.text] = dev

def dcid_save_to_file(file):
    with open(file, 'w') as f:
        json.dump(deviceList, f, indent=2, separators=(',', ': '), sort_keys=True)
        f.write('\n')

def dcid_restore_from_file(file):
    global deviceList
    with open(file,'r') as f:
        deviceList = json.load(f)

def updateDCIDmap(inputFile, outputFile):
    DCID_Parse(inputFile)
    dcid_save_to_file(outputFile)

def DCIDMapCheck():
    if platform.system() == 'Darwin' and os.path.isfile(DEFAULT_DCID_XML):
        return DEFAULT_DCID_XML
    return None

def main():
    usage = "usage: %prog [options] arg"
    parser = OptionParser(usage)

    parser.add_option("-i", "--input", dest="input_file",
                      help="DCID input file")
    parser.add_option("-o", "--output", dest="output_file",
                      help="output file")
    parser.add_option("-c", "--convert", default=False,
                      action="store_true", dest="convert",
                      help="Generate dcid.json from input DCIDMap.xml file")
    parser.add_option("-d", "--discover", default=True,
                      action="store_true", dest="discover",
                      help="Discover Shure devices on the network")

    (options, args) = parser.parse_args()

    if options.convert:
        if not options.output_file:
            print("use -o to specify a DCID output file destination")
            sys.exit()

        if options.input_file:
            p = options.input_file

        elif DCIDMapCheck():
            p = DCIDMapCheck()

        else:
            print("Specify an input DCIDMap.xml file with -i or install Wireless Workbench")
            sys.exit()

        if p:
            updateDCIDmap(p, options.output_file)
            print("Converting {} to {}".format(p, options.output_file))
        sys.exit()

    if options.discover:
        print("lets discover some stuff")
        discover()


if __name__ == '__main__':
    main()
