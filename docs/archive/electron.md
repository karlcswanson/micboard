# Electron Wrapper (Discontinued)
Python & JavaScript dependencies can be wrapped with electron to make deployment a bit easer for those running macOS.  This is far from the ideal way to package and deploy an application for the mac, but it eliminates the need for the command line during the install process.  A Cocoa or Swift wrapper should be made, Electron adds ~300mb to the ~19mb micboard executable.

There are a few different layers.

The frontend is written in JavaScript. [webpack](https://webpack.js.org) packages js, css, and font dependencies into a minified and distributable file.

The Micboard Server is written in python. [pyinstaller](https://pyinstaller.readthedocs.io/en/stable/) packages a python interpreter, micboard, and its dependencies into a single executable.

The Electron wrapper is written in JavaScript.  It provides a menubar app with access to micboard, the micboard configuration directory, and the micboard logs.

## Building the Electron Wrapper
Here are the steps to generate `micboard-server.app`

Download micboard and install dependencies.
```shell
micboard@micboard:~$ git clone https://github.com/karlcswanson/micboard
micboard@micboard:~$ cd micboard/
micboard@micboard:~/micboard$ pip3 install -r py/requirements.txt
micboard@micboard:~/micboard$ pip3 install pyinstaller
micboard@micboard:~/micboard$ npm install
```

Build the frontend JavaScript using webpack.
```shell
micboard@micboard:~/micboard$ npm run build
```

Package the micboard server application using [PyInstaller](https://pyinstaller.readthedocs.io/en/stable/).
```shell
micboard@micboard:~/micboard$ npm run binary
```

Wrap the PyInstaler generated executable within an Electron app using Electron-builder.
```shell
micboard@micboard:~/micboard$ npm run pack
```
