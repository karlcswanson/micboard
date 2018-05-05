FROM ubuntu

MAINTAINER Karl Swanson <karlcswanson@gmail.com>

RUN apt-get update -y && apt-get install git python python-pip -y
RUN cd /tmp \
    && git clone https://karlcswanson:b36c40083a5417d717e7d1ed95dde8538678ebdb@github.com/karlcswanson/mictray.git \
    && cd mictray \
    && pip install -r requirements.txt

EXPOSE 8058

CMD ["python", "/tmp/mictray/tornado_server.py"]
