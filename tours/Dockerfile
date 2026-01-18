FROM node:18-alpine

WORKDIR /app

# Copy shared monitoring module
COPY shared ./node_modules/soa-shared-monitoring

# Install shared monitoring dependencies
RUN cd ./node_modules/soa-shared-monitoring && npm install --production

# Install tours dependencies
COPY tours/package*.json ./
RUN npm install --production

# Copy application source
COPY tours .

EXPOSE 3002

CMD ["node", "src/index.js"]
