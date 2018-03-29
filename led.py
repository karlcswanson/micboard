#!/usr/bin/python
from dotstar import Adafruit_DotStar

colorcode = {'COM_ERROR' : 0xffff00,
             'UNASSIGNED': 0x000000,
             'GOOD': 0x66ff33,
             'REPLACE_BATTERY' : 0xffff00,
             'CRITICAL': 0x800000,
             'PREV_GOOD':0xbf00ff }

slotmap = { 1:(0,15,'GOOD'),
            2:(16,31,'UNASSIGNED'),
            3:(32,47,'GOOD'),
            4:(48,63,'REPLACE_BATTERY'),
            5:(64,79,'CRITICAL'),
            6:(80,95,'PREV_GOOD'),
            7:(96,111,'GOOD'),
            8:(112,127,'GOOD')
           }


numpixels = 180
datapin  = 10
clockpin = 11
def setup():
    strip = Adafruit_DotStar(numpixels, datapin, clockpin, order='bgr' )
    strip.begin()
    strip.setBrightness(200)
    return strip



def strip_test(strip):
    for key, value in slotmap.iteritems():
        start,stop,state = value
        if state == 'COM_ERROR':
            strip.setPixelColor(start,colorcode[state])

        else:
            for i in range(start,stop+1):
                strip.setPixelColor(i,colorcode[state])

    strip.show()
