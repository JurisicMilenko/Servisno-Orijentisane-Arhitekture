FROM node:18-alpine

WORKDIR /app

COPY purchase/shared ./shared

RUN if [ -f ./shared/package.json ]; then \
        cd ./shared && npm install --production; \
    fi

COPY purchase/package*.json ./
RUN npm install --production

COPY purchase/src ./src

EXPOSE 3004

CMD ["npm", "start"]
