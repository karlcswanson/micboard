# Micboard
Micboard - A visual monitoring tool for network enabled Shure devices.

Micboard is an open source microphone monitoring application.  Micboard provides views for engineers, mobile, and microphone storage.


## Getting Started

## Compatible Devices
Micboard supports the following devices -
* UHF-R
* QLX-D<sup>[1](#qlxd)</sup>
* ULX-D
* Axient Digital
* PSM 1000



## Interface
### Smart Backgrounds
Video and image backgrounds can be used with Micboard. Images in the `backgrounds` folder of the micboard configuration directory are displayed based on the channel name. With backgrounds enabled, `BP03 Steve` will display `steve.jpg` as a background for the `BP03 Steve` slot.


### Keyboard Shortcuts
* <kbd>0</kbd> - Show all slots
* <kbd>1</kbd>...<kbd>9</kbd> - Go to group
* <kbd>d</kbd> - Start demo mode
* <kbd>e</kbd> - Open group editor
* <kbd>f</kbd> - Toggle fullscreen
* <kbd>g</kbd> - Change image backgrounds
* <kbd>v</kbd> - Change video backgrounds
* <kbd>i</kbd> - Change display mode
* <kbd>n</kbd> - Extended Name editor
* <kbd>q</kbd> - Show QR code
* <kbd>t</kbd> - TV mode (toggle)
* <kbd>esc</kbd> - reload micboard



## Configuration
Configuration is stored in a json file.  On Mac OS X, `config.json` can be found in `~/Library/Application Support/micboard/`.  On Linux, it is typically located in `~/.local/share/micboard/`.  On first run, a default configuration file is copied to the configuration directory.  Exit micboard and add in a 'slot' for each device.


### Slots
Each wireless channel is assigned unique slot. A single channel QLXD receiver would use 1 slot while a ULXD4Q receiver takes 4.

Each slot requires 4 parameters:
* **slot** - A unique slot number - `12`
* **ip** - the IP address of the receiver - `"192.168.1.45"`
* **channel** - the channel of the receiver - `[1, 2, 3, 4]`
* **type** - the type of the receiver - `["uhfr", "qlxd", "ulxd", "atxd", "p10r"]`

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

##### View a group
Groups can be selected from the main menu or with numeric keys.  View all devices by pressing <kbd>0</kbd>.

##### Edit a group
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
Large systems may need static channel IDs like 'H01' or 'bp14' in addition to name of the user.  These take up a minimum of 2 characters of a field that Shure often limits to 8.

Micboard has an optional feature called **Extended Names**.  When set, user-defined IDs and names will be displayed instead of the name pulled from the receiver.

When the receiver name is changed via WWB, Micboard follows suit and displays the new name.

Press <kbd>n</kbd> to bring up the extended names editor.  Press save once complete.

## Developer Information
[Building the Electron wrapper for macOS](docs/electron.md)
[Extending micboard using the API](docs/api.md)


## Known Issues
<a name="qlxd">1</a>: [QLX-D Firmware](docs/qlxd.md)
