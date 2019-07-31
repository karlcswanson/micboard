# Configuration
Configuration is stored in a json file.  On Mac OS X, `config.json` can be found in `~/Library/Application Support/micboard/`.  On Linux, it is typically located in `~/.local/share/micboard/`.  On first run, a default configuration file is copied to the configuration directory.  Exit micboard and add in a 'slot' for each device.


## Slots
Each wireless channel is assigned unique slot. A single channel QLXD receiver would use 1 slot while a ULXD4Q receiver takes 4.

Each slot requires 4 parameters:
* **slot** - A unique slot number
* **ip** - the IP address of the receiver
* **channel** - the device channel on the receiver
* **type** - the type of the receiver - `["uhfr", "qlxd", "ulxd", "atxd", "p10r"]`


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

## Groups
Devices can be grouped into custom views. These groups are accessible from the menu and keyboard shortcuts.

#### View a group
Groups can be selected from the main menu or with numeric keys.  View all devices by pressing <kbd>0</kbd>.

#### Edit a group
Once in a group, open the group editor by pressing "edit group" in the nav menu.  The group editor can also be opened by pressing <kbd>e</kbd>.

Once the editor is open -
1. Add title
2. Drag and channels from sidebar to display board
3. Save

## Visual Backgrounds
Video and image backgrounds can be used with Micboard. Images in the `backgrounds` folder of the micboard configuration directory are displayed based on the channel name. With backgrounds enabled, `BP03 Steve` will display `steve.jpg` as a background for the `BP03 Steve` slot.

The micboard `backgrounds` folder can be shared via a fileserver.  This provides an easy way for teams to update pictures.

[Additional Documentation](docs/fileshare.md)

## Extended Names
Larger systems benefit from static channel IDs like 'H01' or 'bp14' and user names, like Dave.  It can be difficult to fit both in a field that Shure often limits to 8.

Micboard has an optional feature called **Extended Names**.  When set, user-defined IDs and names will be displayed instead of the name pulled from the receiver.

When the receiver name is changed via WWB, Micboard follows suit and displays the new name.

Press <kbd>n</kbd> to bring up the extended names editor.  Press save once complete.
