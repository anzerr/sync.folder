FROM node:11.1.0-alpine
RUN apk update && apk upgrade && apk add git bash && mkdir -p /home/anzerr/workdir/ && cd /home/anzerr/ && git clone https://github.com/anzerr/sync.folder.git && cd sync.folder && git config --global url."https://github.com/".insteadOf git@github.com: && git config --global url."https://".insteadOf git:// && git config --global url."https://".insteadOf ssh:// && npm install --only=prod
CMD node /home/anzerr/sync.folder/bin/index.js server --host 0.0.0.0:5970 --cwd /home/anzerr/workdir
