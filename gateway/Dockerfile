FROM node:18-alpine

WORKDIR /app

COPY gateway/shared ./shared

RUN if [ -f ./shared/package.json ]; then \
        cd ./shared && npm install --production; \
    fi

COPY gateway/package*.json ./
RUN npm install --production

COPY gateway/src ./src

EXPOSE 4000
CMD ["node", "src/index.js"]
