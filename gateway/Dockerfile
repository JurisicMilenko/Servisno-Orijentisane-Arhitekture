FROM node:18-alpine

WORKDIR /usr/src/app

# Copy shared monitoring module
COPY shared ./node_modules/soa-shared-monitoring

# Install shared monitoring dependencies
RUN cd ./node_modules/soa-shared-monitoring && npm install --production

# Install gateway dependencies
COPY gateway/package*.json ./
RUN npm ci --only=production || npm install --only=production

# Copy application source
COPY gateway .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/index.js"]
