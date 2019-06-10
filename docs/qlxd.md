# QLX-D Firmware Issue
A bug causes receivers running `2.2.11` and later to crash. The network stack of the QLX-D locks when the TCP protocol is used. Micboard works well with receivers rolled back to `2.1.5`.
