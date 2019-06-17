# Micboard Server Platforms
## Suggested Hardware
Micboard server runs on a variety of platforms.



# MacOS
xcode-select --install

install the homebrew package manager

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```


# Debian (Ubuntu & Raspbery Pi)
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
$ npm install
$ pip3 install -r py/requirements.txt
```

build the micboard frontend and run micboard
```
$ npm run build
$ python py/micboard.py
```


If micboard runs successfully, edit `User` and `WorkingDirectory` within `micboard.service` to match your installation and install it as a service.
```
$ sudo cp micboard.service /etc/systemd/system/
$ sudo systemctl start micboard.service
$ sudo systemctl enable micboard.service
```
# Docker
```
$ git clone https://github.com/karlcswanson/micboard.git
$ cd micboard/
$ docker build -t micboard .
$ docker run -d -p 8058:8058 -v "$(pwd)"/micboardcfgdir:/root/.local/share/micboard micboard
```
