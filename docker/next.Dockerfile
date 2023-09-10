FROM node:18

ENV BACKEND_URL=http://mumsmums:8080

WORKDIR /app

COPY src/client/package*.json ./

RUN npm install

COPY src/client .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
