#!/usr/bin/python
from dotstar import Adafruit_DotStar

colorcode = {'COM_ERROR' : 0xffff00,
             'UNASSIGNED': 0x000000,
             'GOOD': 0x66ff33,
             'REPLACE_BATTERY' : 0xffff00,
             'CRITICAL': 0x800000,
             'PREV_GOOD':0xbf00ff }

slotmap = { 1:(0,3,'COM_ERROR'),
            2:(4,7,'UNASSIGNED'),
            3:(8,11,'GOOD'),
            4:(12,15,'REPLACE_BATTERY'),
            5:(16,19,'CRITICAL'),
            6:(20,23,'PREV_GOOD'),
            7:(24,27,'GOOD'),
            8:(28,31,'COM_ERROR')
           }


numpixels = 180
datapin  = 10
clockpin = 11
def setup():
    strip = Adafruit_DotStar(numpixels, datapin, clockpin, order='bgr' )
    strip.begin()
    strip.setBrightness(64)
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
