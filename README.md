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
