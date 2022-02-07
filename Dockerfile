# STAGE 1
FROM node:14.19 as builder
COPY package*.json ./
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
COPY . .
RUN npm run build && npm run package

# STAGE 2
FROM node:14.19
COPY entrypoint.sh /entrypoint.sh
RUN npm install -g typescript
COPY --from=builder /dist ./dist

ENTRYPOINT ["/entrypoint.sh"]
