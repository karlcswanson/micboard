import threading
import os
import time


import config
import tornado_server
import shure

def main():
    config.read_json_config(os.path.join(os.path.dirname(__file__), 'config.json'))

    time.sleep(.1)
    t1 = threading.Thread(target=shure.WirelessQueue)
    t2 = threading.Thread(target=shure.SocketService)
    t3 = threading.Thread(target=tornado_server.twisted)
    t1.start()
    t2.start()
    t3.start()
    tornado_server.socket_send()


if __name__ == '__main__':
    main()
