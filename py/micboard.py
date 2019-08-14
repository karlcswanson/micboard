import threading
import time


import config
import tornado_server
import shure
import discover


def main():
    config.config()

    time.sleep(.1)
    rxquery_t = threading.Thread(target=shure.WirelessQueryQueue)
    rxcom_t = threading.Thread(target=shure.SocketService)
    web_t = threading.Thread(target=tornado_server.twisted)
    discover_t = threading.Thread(target=discover.discover)
    rxparse_t = threading.Thread(target=shure.ProcessRXMessageQueue)

    rxquery_t.start()
    rxcom_t.start()
    web_t.start()
    discover_t.start()
    rxparse_t.start()


if __name__ == '__main__':
    main()
