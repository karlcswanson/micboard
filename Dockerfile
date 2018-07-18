FROM ubuntu

MAINTAINER Karl Swanson <karlcswanson@gmail.com>

RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get update -y && apt-get install git python3 python3-pip nodejs -y
RUN cd /tmp \
    && git clone https://karlcswanson:b36c40083a5417d717e7d1ed95dde8538678ebdb@github.com/karlcswanson/mictray.git \
    && cd mictray \
    && pip3 install -r requirements.txt \
    && npm install


EXPOSE 8058

CMD ["python3", "/tmp/mictray/tornado_server.py"]
