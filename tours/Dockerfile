FROM node:18-alpine

WORKDIR /app

COPY tours/shared ./shared

RUN if [ -f ./shared/package.json ]; then \
        cd ./shared && npm install --production; \
    fi

COPY tours/package*.json ./
RUN npm install --production

COPY tours/src ./src

EXPOSE 3002
CMD ["node", "src/index.js"]
