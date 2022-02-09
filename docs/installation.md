# Server Installation
Micboard server can be installed on many different platforms.  For small and portable systems, Micboard can run on a Raspberry Pi hidden in the back of a rack.

## Docker (Recommended)
Download and install Docker & Docker Compose

Run docker the docker-compose.yaml file
```
$ mkdir -p ~/docker/micboard
$ cd ~/docker/micboard/
$ curl -O https://raw.githubusercontent.com/karlcswanson/micboard/master/docker-compose.yaml
$ docker compose up
```


## Debian (Ubuntu & Raspberry Pi)
Install git, python3-pip, and Node.js
```
$ sudo apt-get update
$ sudo apt-get install git python3-pip
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
$ sudo apt-get install nodejs
```

Download micboard
```
$ git clone https://github.com/karlcswanson/micboard.git
```

Install micboard software dependencies via npm and pip
```
$ cd micboard/
$ npm install --only=prod
$ pip3 install -r py/requirements.txt
```

build the micboard frontend and run micboard
```
$ npm run build
$ python3 py/micboard.py
```

Edit `User` and `WorkingDirectory` within `micboard.service` to match your installation and install it as a service.
```
$ sudo cp micboard.service /etc/systemd/system/
$ sudo systemctl start micboard.service
$ sudo systemctl enable micboard.service
```

Check the [configuration](configuration.md) docs for more information on configuring micboard.

## macOS - Desktop Application
The Mac desktop app has been discontinued.


## macOS - From Source
Install the Xcode command-line tools
```
$ xcode-select --install
```

Install the homebrew package manager
```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Install python3 and node
```
$ brew install python3 node
```

Download Micboard
```
$ git clone https://github.com/karlcswanson/micboard.git
```

Install micboard software dependencies via npm and pip
```
$ cd micboard/
$ npm install --only=prod
$ pip3 install -r py/requirements.txt
```

build the micboard frontend and run micboard
```
$ npm run build
$ python3 py/micboard.py
```

Check the [configuration](configuration.md) docs for more information on configuring micboard.

Restart micboard
```
$ python3 py/micboard.py
```