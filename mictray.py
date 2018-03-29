#!/usr/bin/python

import shure
import threading
# import oled
# import led
import time

def main():
    shure.config()
    t1 = threading.Thread(target=shure.WirelessPoll)
    t2 = threading.Thread(target=shure.WirelessListen)
    # state_test()
    t1.start()
    t2.start()

    while True:
        shure.print_ALL()
        time.sleep(3)
    # strip = led.setup()
    # disp = oled.setup()

    # led.strip_test(strip)

    # oled.drawImage(disp)
    # time.sleep(1)
    # oled.drawName(disp,"HH06:","KARL")
    # time.sleep(5)
    # oled.drawName(disp,"T,":)")




if __name__ == "__main__":
    main()
