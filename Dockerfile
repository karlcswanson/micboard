
FROM python:3.9.14-slim-buster

RUN apt-get update -y
RUN apt-get install git curl make build-essential -y
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install nodejs -y
RUN npm install yarn -g

WORKDIR /usr/src/app
COPY . .

RUN yarn install --prod
RUN pip3 install -r py/requirements.txt

RUN yarn build
CMD ["python", "py/micboard.py"]