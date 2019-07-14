# QLX-D Firmware Issue
QLX-D receivers running `2.2.11` and later will eventually crash while using the Crestron/AMX protocol. Micboard works well with receivers rolled back to `2.1.5`.

Any disruption, such as a missed packet, causes the device to lock up.

Here is a simple test setup to demonstrate the bug -

* 1 QLXD4 receiver running 2.2.11
* 1 Cisco SG-300 ethernet switch
* 1 netcat Mac (10.13.6)
* 1 WWB PC (Windows 10, WWB 6.12.5)

## Test Procedure
1. Plug the computers and wireless receiver into the ethernet switch and power them on.
2. Open up WWB on the WWB PC
3. Note the IP address of the QLXD4
4. Enable samples on the receiver by running `echo "< SET 1 METER_RATE 00100 >" | nc QLX-D_IP 2202` in the terminal of the netcat mac.
5. See samples from the receiver by running `nc QLX-D_IP 2202` on the netcat mac. Data is also displayed in the Monitor tab of WWB.
6. Unplug the ethernet cable from mac running netcat.
7. The receiver disappears from WWB running on computers still connected to the network. The device no longer responds to pings and the front panel is locked up.

## Whats Happening?
I am guessing a buffer fills with sample data when the mac is unplugged.  The unit locks up and stops sending ACN data to WWB. Maybe there is a misconfigured Keep-Alive or timeout parameter for the TCP/AMX socket.  A bug report was filed with Shure in September of 2018.  They were able to reproduce the issue, but have not issued a fix.

## Can I still use Micboard with QLXD?
Using the [Shure Update Utility](https://www.shure.com/en-US/products/software/shure_update_utility), many QLXD devices can be rolled back to `2.1.5`.  Devices using newer bands may not be able to be rolled back to `2.1.5 `.
