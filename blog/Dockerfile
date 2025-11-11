FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["node", "src/index.js"]
