# Micboard
Micboard is a visual mic monitoring tool for network enabled Shure devices.


## Installation

## MacOS
xcode-select --install


### Debian/Raspberian


### Docker
```
docker build -t mictray .
docker run -d -p 8058:8058 -v "$(pwd)"/micboardcfgdir:/root/.local/share/micboard mictray
```


## Hardware

### Compatible Devices
* UHF-R
* QLX-D
* ULX-D
* Axient Digital
* PSM 1000

### Known Issues

#### QLX-D Firmware Bug Version 2.2.11

A bug causes receivers running `2.2.11` and later to crash. The network stack of the QLX-D locks when the TCP protocol is used. Micboard works well with receivers rolled back to `2.1.5`.

## Interface
### Smart Backgrounds
Video and image backgrounds can be used with Micboard. Images in the `backgrounds` folder of the micboard configuration directory are displayed based on the channel name. With backgrounds enabled, `BP03 Steve` will display `steve.jpg` as a background for the `BP03 Steve` slot.


### Keyboard Shortcuts
* <kbd>0</kbd> - Show all slots
* <kbd>1</kbd>...<kbd>9</kbd> - Go to group
* <kbd>d</kbd> - Start demo mode
* <kbd>e</kbd> - Open group editor
* <kbd>f</kbd> - Toggle fullscreen
* <kbd>g</kbd> - Change background mode
* <kbd>i</kbd> - Change display mode
* <kbd>n</kbd> - Extended Name editor
* <kbd>q</kbd> - Show QR code
* <kbd>t</kbd> - TV mode (toggle)
* <kbd>esc</kbd> - reload micboard



## Configuration
Configuration is stored in a json file.  On Mac OS X, `config.json` can be found in `~/Library/Application Support/micboard/`.  On Linux, it is typically located in `~/.local/share/micboard/`.


### Slots
Each wireless channel is stored in unique slot. A single channel QLXD receiver would use 1 slot while a ULXD4Q receiver takes 4.

Each slot needs 4 parameters:
* **slot** - A unique slot number
* **ip** - the IP address of the receiver
* **channel** - the channel of the receiver
* **type** - the type of the receiver

<details><summary>Configuration Example</summary>

```javascript
"slots": [
    {
      "slot": 1,
      "ip" : "192.0.2.11",
      "channel": 1,
      "type": "qlxd"
    },
    {
      "slot": 2,
      "ip" : "192.0.2.12",
      "channel": 1,
      "type": "qlxd"
    },
    {
      "slot": 3,
      "ip" : "192.0.2.13",
      "channel": 1,
      "type": "uhfr"
    },
    {
      "slot": 4,
      "ip" : "192.0.2.13",
      "channel": 2,
      "type": "uhfr"
    },
    {
      "slot": 5,
      "ip" : "192.0.2.14",
      "channel": 1,
      "type": "ulxd"
    },
    {
      "slot": 6,
      "ip" : "192.0.2.14",
      "channel": 2,
      "type": "ulxd"
    },
    {
      "slot": 7,
      "ip" : "192.0.2.14",
      "channel": 3,
      "type": "ulxd"
    },
    {
      "slot": 8,
      "ip" : "192.0.2.14",
      "channel": 4,
      "type": "ulxd"
    }
  ]
```
</details>

### Groups
Microphones can be grouped into custom views. These groups are accessible from the menu and keyboard shortcuts.

##### Viewing a group
Groups can be selected from the main menu or with numeric keys.  Pressing <kbd>0</kbd> will display all devices.

##### Editing a group
Once in a group, open the group editor by pressing "edit group" in the nav menu.  The group editor can also be opened by pressing <kbd>e</kbd>.

Once the editor is open -
1. Add title
2. Drag and channels from sidebar to display board
3. Save


<details><summary>Configuration Example</summary>

Groups need 3 parameters:
* **group** - A unique group number
* **title** - The name of the group
* **slots** - The microphones in the group

```javascript
"groups": [
    {
      "group": 1,
      "title": "Primary",
      "slots" : [1,3,5,7]
    },
    {
      "group": 2,
      "title": "Backup",
      "slots" : [2,4,6,8]
    },
    {
      "group": 3,
      "title": "Hosts",
      "slots" : [9,10]
    },
    {
      "group": 4,
      "title": "interview",
      "slots" : [11,12]
    },
    {
      "group": 5,
      "title": "Opening",
      "slots" : [18,19,20,21,0,9,10]
    },
    {
      "group": 6,
      "title": "Interview",
      "slots" : [10,0,11,12]
    },
    {
      "group" : 9,
      "title": "Band",
      "slots" : [18,19,20,21]
    }
],
```
</details>


### Extended Names
Large systems need channel IDs like 'H01' or 'bp14' in addition to name of the user.  These take up a minimum of 2 characters of a field that Shure often limits to 8.

Micboard has an optional feature called **Extended Names**.  When set, user-defined IDs and names will be displayed instead of the name pulled from the receiver.

When the receiver name is changed via WWB, the extended names for that receiver will be cleared and micboard will reflect the new from WWB.

Press <kbd>n</kbd> to bring up the extended names editor.  Press save once complete.

## Developer Information
### Building Micboard
#### Electron Wrapper (the Mac app)
There are a few different layers to the electron wrapper for micboard.

The frontend is written in JavaScript. [webpack](https://webpack.js.org) packages js, css, and font dependencies into a minified and distributable file.

The Micboard Server is written in python. [pyinstaller](https://pyinstaller.readthedocs.io/en/stable/) packages a python interpreter, micboard, and its dependencies into a single executable.

Electron-builder wraps this executable into a macOS menu bar app.

```
git clone https://github.com/karlcswanson/micboard
cd micboard/
pip3 install py/requirements.txt
npm install
npm run build
npm run binary
npm run pack
```


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

### Device Discovery and Updating the DCID Database
Modern Shure devices are discovered via [Service Location Protocol](https://en.wikipedia.org/wiki/Service_Location_Protocol).  SLP messages are sent via multicast across the network. Micboard parses these messages for a Device Class IDentifier and looks it up in a database to determine the receiver type and number of channels.

Micboard includes a utility to convert the DCID list included with the [Shure Update Utility](http://www.shure.com/americas/products/software/utilities/shure-update-utility) to file that can be included with Micboard.

The conversion utility can be run within the micboard directory
`python discover.py -c -o dcid.json`.  Running the utility without arguments shows Shure devices discovered on the network.  

### Extending Micboard
Micboard provides all data sent from receivers in JSON. This data is accessible by HTTP and WebSockets.

This capability lets you do a few fun things with the data
* Make a 40' high VU meter out of LEDs
* Log metrics into a database

<details><summary>Example Data</summary>

```javascript
{
  "antenna": "AX",
  "audio_level": 68,
  "battery": 5,
  "channel": 1,
  "frequency": "526.225",
  "name": "CFO 4",
  "raw": {
    "ALL": "AX 079 034",
    "AUDIO_GAIN": "030",
    "AUDIO_LVL": "000",
    "BATT_BARS": "005",
    "BATT_CHARGE": "100",
    "BATT_CYCLE": "00004",
    "BATT_HEALTH": "100",
    "BATT_RUN_TIME": "00607",
    "BATT_TEMP_C": "64",
    "BATT_TEMP_F": "116",
    "BATT_TYPE": "LION",
    "CHAN_NAME": "CFO 4",
    "ENCRYPTION_WARNING": "OFF",
    "FREQUENCY": "526225",
    "GROUP_CHAN": "--,--",
    "METER_RATE": "00100",
    "RF_ANTENNA": "XX",
    "RX_RF_LVL": "032",
    "TX_DEVICE_ID": "",
    "TX_MENU_LOCK": "OFF",
    "TX_MUTE_BUTTON_STATUS": "UNKN",
    "TX_MUTE_STATUS": "UNKN",
    "TX_OFFSET": "000",
    "TX_POWER_SOURCE": "UNKN",
    "TX_PWR_LOCK": "OFF",
    "TX_RF_PWR": "LOW",
    "TX_TYPE": "QLXD1"
    },
  "rf_level": 68,
  "slot": 4,
  "status": "AUDIO_PEAK",
  "tx_offset": 0,
  "type": "qlxd"
}
```
</details>
