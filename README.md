<p align="center">
  <a href="https://micboard.io"><img width="90px" height="90px" src="docs/img/logo.png"></a>
</p>

<h1 align="center">Micboard</h1>

A visual monitoring tool for network enabled Shure devices.  Micboard simplifies microphone monitoring and storage for artists, engineers, and volunteers.  View battery, audio, and RF levels from any device on the network.

![Micboard Storage Photo](docs/img/wccc.jpg)


![micboard diagram](docs/img/slug.png)

## Screenshots
#### Desktop
![Desktop](docs/img/desktop_ui.png)


#### Mobile
<p align="center">
  <img width="33%" src="docs/img/phone_home.png"><img width="33%" src="docs/img/phone_ui.png"><img width="33%" src="docs/img/phone_ui_exp.png">
</p>

#### Mic Storage
![mic storage](docs/img/tv_imagebg.png)

## Compatible Devices
Micboard supports the following devices -
* Shure UHF-R
* Shure QLX-D<sup>[1](#qlxd)</sup>
* Shure ULX-D
* Shure Axient Digital
* Shure PSM 1000

Micboard uses IP addresses to connect to RF devices.  RF devices can be addressed through static or reserved IPs.  They just need to be consistent.


## Documentation
* [Installation](docs/installation.md)
* [Configuration](docs/configuration.md)
* [Micboard MultiVenue](docs/multivenue.md)

#### Developer Info
* [Building the Electron wrapper for macOS](docs/electron.md)
* [Extending micboard using the API](docs/api.md)


## Known Issues
<a name="qlxd">1</a>: [QLX-D Firmware](docs/qlxd.md)
