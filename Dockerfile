# syntax=docker/dockerfile:1
FROM node:17-alpine AS micboard_frontend
WORKDIR /home/node/app
COPY . .
RUN npm install
RUN npm run build

FROM python:3-alpine as micboard_server

LABEL org.opencontainers.image.authors="karl@micboard.io"

WORKDIR /usr/src/app

COPY . .
COPY --from=micboard_frontend /home/node/app/static /usr/src/app/static/

RUN pip3 install -r py/requirements.txt

EXPOSE 8058

CMD ["python3", "py/micboard.py"]
