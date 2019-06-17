# Micboard Multivenue
Using NGINX, a single server can provide a separate instances of micboard for each venue across a campus.


## Micboard Configuration
Setup and enable a service for each venue

```
[Unit]
Description=Micboard Service
After=network.target

[Service]
Environment=MICBOARD_PORT=8080
ExecStart=/usr/bin/python3 -u py/micboard.py -f ~/.local/share/micboard/chapel
WorkingDirectory=/home/micboard/micboard
StandardOutput=inherit
StandardError=inherit
Restart=always
User=micboard
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

```
sudo cp micboard-chapel.service /etc/systemd/system/
sudo systemctl start micboard-chapel.service
sudo systemctl enable micboard-chapel.service
```


## Configure NGINX
A sample [nginx.conf](docs/nginx-sample.conf) is provided in the 
