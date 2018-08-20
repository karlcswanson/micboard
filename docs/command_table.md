# UDP Command Table

| -                     | QLX-D                      | ULX-D                | UHF-R            | Axient            |
|:----------------------|:---------------------------|:---------------------|:-----------------|:------------------|
| start line            |                            | <                    | *                | <                 |
| end line              |                            | >                    | *                | >                 |
| get                   |                            | GET                  | GET              | GET               |
| set                   |                            | SET                  | SET              | SET               |
| rep                   |                            | REP                  | REPORT           | REP               |
| sample                |                            | SAMPLE               | SAMPLE           | SAMPLE            |
| firmware version      | FW_VER                     | FW_VER               |                  |                   |
|                       | {yyyyy.yyyyy.yyyyy.yyyyy } | {yyyyyyyyyyyyyyyyyy} |                  |                   |
| channel name          | CHAN_NAME                  | CHAN_NAME            | CHAN_NAME        | CHAN_NAME         |
|                       | {yyyyyyyy}                 | {yyyyyyyy}           | yyyyyyyyyyyy     | {yyyyyyyy}        |
| device id             | DEVICE_ID                  | DEVICE_ID            |                  |                   |
|                       | {yyyyyyyy}                 | {yyyyyyyy}           |                  | {yyyyyyyy}        |
| audio mute status     | TX_MUTE_STATUS             | AUDIO_MUTE           | MUTE             | AUDIO_MUTE        |
| mute toggle           |                            | AUDIO_MUTE TOGGLE    | MUTE TOGGLE      | AUDIO_MUTE TOGGLE |
| audio gain            | AUDIO_GAIN                 | AUDIO_GAIN           | AUDIO_GAIN       | AUDIO_GAIN        |
|                       | yyy                        |                      |                  |                   |
| frequency             | FREQUENCY                  | FREQUENCY            | FREQUENCY        | FREQUENCY         |
|                       | yyyyyy                     | yyyyyy               | yyyyyy           |                   |
| battery cycles        | BATT_CYCLE                 | BATT_CYCLE           |                  |                   |
|                       | yyyyy                      | yyyyy                |                  |                   |
| battery run time      | BATT_RUN_TIME              | BATT_RUN_TIME        |                  |                   |
|                       | yyyyy                      | yyyyy                |                  |                   |
| battery temp f        | BATT_TEMP_F                | BATT_TEMP_F          |                  |                   |
| battery temp c        | BATT_TEMP_C                | BATT_TEMP_C          |                  |                   |
| battery type          | BATT_TYPE                  | TX_TYPE              |                  |                   |
| battery charge        | BATT_CHARGE                | BATT_CHARGE          |                  |                   |
| battery health        | BATT_HEALTH                | BATT_HEALTH          |                  |                   |
| battery bars          | BATT_BARS                  | BATT_BARS            | TX_BAT           |                   |
| transmitter type      | TX_TYPE                    | TX_TYPE              | TX_TYPE          |                   |
| transmitter offset    | TX_OFFSET                  | TX_OFFSET            |                  |                   |
| transmitter rf power  | TX_RF_POWER                | TX_RF_PWR            |                  |                   |
| transmitter menu lock | TX_MENU_LOCK               | TX_MENU_LOCK         |                  |                   |
| encryption            | ENCRYPTION                 | ENCRYPTION           |                  |                   |
| transmitter device id | TX_DEVICE_ID               |                      |                  |                   |
|                       | {yyyyyyyy}                 |                      |                  |                   |
| tx mute button status | TX_MUTE_BUTTON_STATUS      |                      |                  |                   |
| set meter rate        | METER_RATE sssss           | METER_RATE sssss     | METER x sss      |                   |
| stop metering         | METER_RATE 0               | METER_RATE 0         | METER x ALL STOP |                   |
| get mac address       | MAC_ADDR                   |                      |                  |                   |
|                       | aa:aa:aa:aa:aa:aa          |                      |                  |                   |
