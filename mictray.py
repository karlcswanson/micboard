#!/usr/bin/python

import shure
import threading
import oled
import led
import time

slots = []

strip = led.setup()
disp = oled.setup()

class Slot:
    def __init__(self, number, chan_name,tx):
        self.number = number
        self.chan_name = chan_name
        self.tx_id = ''
        self.name = ''
        self.tx = tx
        self.state = 'UNASSIGNED'


    def update_name(self):
        self.chan_name = self.tx.chan_name
        parts = self.chan_name.split()
        if parts[0][:2] == 'HH' or parts[0][:2] == 'BP':
            tx_id = parts[0]
            name = ' '.join(parts[1:])
            # JUST FOR THE DEMO
            if self.number == 1:
                oled.drawName(disp,tx_id,name)
        else:
            if self.number == 1:
                oled.drawName(disp,'',self.tx.chan_name)


    def update_state(self, state):
        self.state = state
        led.set_strip(strip,self.number,self.state)

    def update(self):
        state = self.tx.tx_state()
        if self.chan_name != self.tx.chan_name:
            self.update_name()
        if self.state != state:
            self.update_state(state)


def slot_setup():
    for rx in shure.WirelessReceivers:
        for tx in rx.transmitters:
            slots.append(Slot(tx.slot,tx.chan_name, tx))

    for slot in slots:
        slot.update_name()
        slot.update_state(slot.tx.tx_state())
    strip.show()


def update_slots():
    while True:
        for slot in slots:
            slot.update()
        time.sleep(.5)
        strip.show()


def main():
    shure.config()
    slot_setup()


    # t1 = threading.Thread(target=shure.WirelessPoll)
    t2 = threading.Thread(target=shure.WirelessListen)
    t3 = threading.Thread(target=update_slots)

    #
    # t1.start()
    t2.start()
    t3.start()

    while True:
        time.sleep(3)
        shure.print_ALL()



if __name__ == "__main__":
    main()
