FROM node:14.19
WORKDIR /prod
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build && npm run package

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
