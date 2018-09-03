# MicTray
An intelligent mic tray for ethernet enabled Shure microphones.

## Installation

#### Debian/Raspberian
```
sudo apt-get update
sudo apt-get install python-pip
pip install -r requirements.txt

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
npm install

python tornado_server.py
```

#### Docker
```
docker build -t mictray .
docker run -d -p 8058:8058 mictray
```



### pyinstaller notes
https://github.com/pyenv/pyenv/issues/454
xcode-select --install

https://github.com/pyenv/pyenv/issues/443
`env PYTHON_CONFIGURE_OPTS="--enable-framework" pyenv install -v 3.4.3
