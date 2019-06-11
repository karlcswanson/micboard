### Device Discovery and Updating the DCID Database
Modern Shure devices are discovered via [Service Location Protocol](https://en.wikipedia.org/wiki/Service_Location_Protocol).  SLP messages are sent via multicast across the network. Micboard parses these messages for a Device Class IDentifier and looks it up in a database to determine the receiver type and number of channels.

Micboard includes a utility to convert the DCID list included with the [Shure Update Utility](http://www.shure.com/americas/products/software/utilities/shure-update-utility) to file that can be included with Micboard.

The conversion utility can be run within the micboard directory
`python discover.py -c -o dcid.json`.  Running the utility without arguments shows Shure devices discovered on the network.
