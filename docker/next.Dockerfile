FROM node:18

WORKDIR /app

COPY src/client/package*.json ./

RUN npm install

COPY src/client .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
