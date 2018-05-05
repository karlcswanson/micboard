# MicTray
An intelligent mic tray for ethernet enabled Shure microphones.

## Installation

#### Debian/Raspberian
```
sudo apt-get update
sudo apt-get install python-pip
pip install -r requirements.txt
python mictray.py
```





ini file
### UDP Command Table

| -                 | QLX-D | ULX-D             | UHF-R        | Axient            |
|:------------------|:------|:------------------|:-------------|:------------------|
| start line        |       | <                 | *            | <                 |
| end line          |       | >                 | *            | >                 |
| get               |       | GET               | GET          | GET               |
| set               |       | SET               | SET          | SET               |
| rep               |       | REP               | REPORT       | REP               |
| sample            |       | SAMPLE            | SAMPLE       | SAMPLE            |
| firmware version  |       | FW_VER            |              |                   |
| channel name      |       | CHAN_NAME         | CHAN_NAME    | CHAN_NAME         |
|                   |       | {yyyyyyyy}        | yyyyyyyyyyyy | {yyyyyyyy}        |
| device id         |       | DEVICE_ID         |              |                   |
|                   |       | {yyyyyyyy}        |              | {yyyyyyyy}        |
| audio mute status |       | AUDIO_MUTE        | MUTE         | AUDIO_MUTE        |
| mute toggle       |       | AUDIO_MUTE TOGGLE | MUTE TOGGLE  | AUDIO_MUTE TOGGLE |
| audio gain        |       | AUDIO_GAIN        | AUDIO_GAIN   | AUDIO_GAIN        |
| frequency         |       | FREQUENCY         | FREQUENCY    | FREQUENCY         |
