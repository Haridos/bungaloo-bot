FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY src/ ./src/
ENV NODE_ENV production
CMD node src/index.js