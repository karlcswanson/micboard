# File Sharing via Samba
The micboard server can can be run on a variety of platforms.  Micboard's configuration directory can be shared via [Samba](https://www.samba.org).  This makes it easy to remotely add backgrounds, edit micboard configurations, and view logs.

### MacOS
On MacOS, open up the Sharing pane within System Preferences

Enable File Sharing

Add the micboard config folder.

### Debian Servers (Ubuntu & Raspberian)
Install Samba using apt.

```
sudo apt-get update
sudo apt-get install samba
```

Add a share for micboard in /etc/XXXTODO/smb.conf

```
[micboard]
    comment = Micboard
    path = /home/micboard/.local/share/micboard
    read only = no
    browsable = yes
```

restart samba

`sudo service smbd restart`
