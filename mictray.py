#!/usr/bin/python

import shure
import oled
import led
import time

def main():
    strip = led.setup()
    disp = oled.setup()

    led.strip_test(strip)

    oled.drawImage(disp)
    time.sleep(1)
    oled.drawName(disp,"HH06:","KARL")
    # time.sleep(5)
    # oled.drawName(disp,"T,":)")

    print("Hello World  poo")


if __name__ == "__main__":
    main()
