# Micboard

## Installation

#### Debian/Raspberian
```
sudo apt-get update
sudo apt-get install git python3-pip
pip3 install -r py/requirements.txt

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
npm install

python py/micboard.py

sudo cp micboard.service /etc/systemd/system/
sudo systemctl start micboard.service
sudo systemctl enable micboard.service
```

#### Docker
```
docker build -t mictray .
docker run -d -p 8058:8058 -v "$(pwd)"/micboardcfgdir:/root/.local/share/micboard mictray
```



### pyinstaller notes
https://github.com/pyenv/pyenv/issues/454
xcode-select --install

https://github.com/pyenv/pyenv/issues/443
`env PYTHON_CONFIGURE_OPTS="--enable-framework" pyenv install -v 3.4.3`

### Git Notes
git pull origin master


### Grafana & Influx DB notes
docker volume create grafana-storage
docker volume create influxdb-storage

docker run \
  -d \
  -p 3000:3000 \
  --name=grafana \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana

docker run \
  -d \
  -p 8086:8086 \
  --name=influxdb \
  -v influxdb-storage:/var/lib/influxdb \
  influxdb  


# micboard
Micboard is a monitoring tool for network enabled Shure wireless microphones.  It is compatible with UHF-R, QLX-D, and ULX-D microphones.


### Hardware Notes
Axient Digital and PSM1000 support will be added once hardware is available for testing.

##### QLX-D Firmware Bug Version 2.2.11

A bug causes receivers running `2.2.11` to crash. The network stack of the QLX-D locks when the TCP protocol is used. Micboard works well with receivers rolled back to `2.1.5`.

## Interface
### Backgrounds
Video and image backgrounds can be used with Micboard. Images in the `backgrounds` folder of the Micboard configuration directory are displayed based on the channel name. With backgrounds enabled, `BP03 Steve` will display `steve.jpg` as a background for the `BP03 Steve` slot.


**Upload Mode** will correctly name files and save them to the `backgrounds` directory. Pressing <kbd>u</kbd> enables Upload Mode. Upload mode stops updates to Micboard and enables a drag and drop page. When uploaded, files are renamed to match the slot they are dropped on. An mp4 dropped on `HH07 David` will be renamed to `david.mp4`.

### Keyboard Shortcuts
* <kbd>0</kbd> - Show all slots
* <kbd>1</kbd>...<kbd>9</kbd> - Change to group
* <kbd>d</kbd> - Toggle demo mode
* <kbd>e</kbd> - Group editor
* <kbd>f</kbd> - Toggle fullscreen
* <kbd>g</kbd> - Toggle background mode
* <kbd>i</kbd> - Toggle display mode
* <kbd>q</kbd> - Show QR code
* <kbd>s</kbd> - Edit settings
* <kbd>t</kbd> - TV mode
* <kbd>u</kbd> - Upload mode


## Installation
### Mac OS
### Linux (Debian, Raspberry Pi)
### Docker


## Configuration
Configuration is stored in a json file.  On Mac OS X, `config.json` can be found in `~/Library/Application Support/micboard/`.  On Linux, its located in `~/.local/share/micboard/`.  Settings can be edited manually or using settings page.


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


Groups need 3 parameters:
* **group** - A unique group number
* **title** - The name of the group
* **slots** - The microphones in the group

<details><summary>Configuration Example</summary>

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

## Developer Information
### Building Micboard
### Electron Wrapper (the Mac app)
There are a few different layers to the electron wrapper for micboard.

The frontend is written in JavaScript. [webpack](https://webpack.js.org) packages js, css, and font dependencies into a minified and distributable file.

The Shure communications part of micboard is written in python. [pyinstaller](https://pyinstaller.readthedocs.io/en/stable/) packages a python interpreter, micboard, and its dependencies into a single executable.

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

Micboard connects to each receiver and enables sampling. With sampling enabled, receivers send data every 100ms.

Messages from the receiver look like this -
`< SAMPLE 1 ALL XB 035 098 >`


### Device Discovery and Updating the DCID Database
Shure devices are discovered via [Service Location Protocol](https://en.wikipedia.org/wiki/Service_Location_Protocol).  SLP messages are sent via multicast across the network. Micboard parses these messages for a Device Class IDentifier and looks it up in a database to determine the receiver type and number of channels.

Micboard includes a utility to convert the DCID list included with the [Shure Update Utility](http://www.shure.com/americas/products/software/utilities/shure-update-utility) to file that can be included with Micboard.

The conversion utility can be run within the micboard directory
`python discover.py -c -o dcid.json`.  Running the utility without arguments shows Shure devices discovered on the network.  

### Extending Micboard
Micboard provides all data sent from receivers in JSON. This data is accessible by HTTP and WebSockets.

This capability lets you do a few fun things with the data
* Make a 40' high VU meter out of LEDs
* Log mic metrics into a database with InfluxDB and Grafana

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
