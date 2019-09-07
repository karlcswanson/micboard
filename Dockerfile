FROM python:3

MAINTAINER Karl Swanson <karlcswanson@gmail.com>

WORKDIR /usr/src/app

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install nodejs

COPY . .

RUN pip3 install -r py/requirements.txt
RUN npm install --only=prod
RUN npm run build

EXPOSE 8058

CMD ["python3", "py/micboard.py"]
