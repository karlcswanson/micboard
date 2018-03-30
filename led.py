#!/usr/bin/python
from dotstar import Adafruit_DotStar

colorcode = {'COM_ERROR' : 0xffff00,
             'UNASSIGNED': 0x000000,
             'GOOD': 0x66ff33,
             'PREV_GOOD':0xbf00ff,
             'REPLACE' : 0xffff00,
             'PREV_REPLACE' : 0xffff00,
             'CRITICAL': 0x800000,
             'PREV_CRITICAL': 0x800000
              }

slotmap = { 1:(0,15),
            2:(16,31),
            3:(32,47),
            4:(48,63),
            5:(64,79),
            6:(80,95),
            7:(96,111),
            8:(112,127)
           }


numpixels = 128
datapin  = 10
clockpin = 11


def setup():
    strip = Adafruit_DotStar(numpixels, datapin, clockpin, order='bgr' )
    strip.begin()
    strip.setBrightness(200)
    return strip

def set_strip(strip, slot, state):
    start, stop = slotmap[slot]
    for i in range(start, stop + 1):
        strip.setPixelColor(i,colorcode[state])





def strip_test(strip):
    for key, value in slotmap.iteritems():
        start,stop,state = value
        if state == 'COM_ERROR':
            strip.setPixelColor(start,colorcode[state])

        else:
            for i in range(start,stop+1):
                strip.setPixelColor(i,colorcode[state])

    strip.show()
