FROM node:18-alpine

WORKDIR /usr/src/app

# Copy shared monitoring module
COPY shared ./node_modules/soa-shared-monitoring

# Install shared monitoring dependencies
RUN cd ./node_modules/soa-shared-monitoring && npm install --production

# Install purchase dependencies
COPY purchase/package*.json ./
RUN npm install --production

# Copy application source
COPY purchase .

EXPOSE 3004

CMD ["npm", "start"]
