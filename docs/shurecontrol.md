### Shure UDP/TCP Protocol
Shure receivers include a protocol for integration with Crestron/AMX control systems. This protocol varies slightly for each receiver. Documentation for the protocol can be found on Shure's website.
* [UHF-R](https://www.shure.com/americas/support/find-an-answer/amx-crestron-control-of-uhf-r-receiver)
* [QLX-D](https://www.shure.com/americas/support/find-an-answer/qlx-d-crestron-amx-control-strings)
* [ULX-D](https://www.shure.com/americas/support/find-an-answer/ulx-d-crestron-amx-control-strings)
* [Axient Digital](https://www.shure.com/americas/support/find-an-answer/axient-digital-crestron-amx-control-strings)
* [PSM 1000](https://pubs.shure.com/guide/PSM1000/en-US)

Micboard connects to each receiver and enables sampling. With sampling enabled, receivers send data every 100ms.

Messages from the receiver look like this -
`< SAMPLE 1 ALL XB 035 098 >`
`< REP 1 BATT_BARS 004 >`

Micboard converts data from different types of wireless receivers into a uniform format for the micboard frontend.
