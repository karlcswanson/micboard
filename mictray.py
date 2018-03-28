#!/usr/bin/python

import shure
import oled
import led

def main():
    strip = led.setup()
    disp = oled.setup()

    led.strip_test(strip)

    oled.drawImage(disp)

    print("Hello World  TEST2")


if __name__ == "__main__":
    main()
