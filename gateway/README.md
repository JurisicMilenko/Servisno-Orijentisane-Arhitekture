# API Gateway

This is a small API Gateway that proxies requests to backend microservices.

By default it proxies:
- /api/auth -> http://localhost:3000
- /api/attractions -> http://localhost:3000
 - /api/stakeholders -> http://localhost:3001
 - /api/blog -> http://localhost:3002

How to run
1. Install dependencies:

```bash
cd gateway
npm install
```

2. Start the gateway:

```bash
npm start
```

3. Change the target service URLs using env vars (optional):

```bash
export AUTH_SERVICE_URL="http://localhost:3000"
export ATTRACTIONS_SERVICE_URL="http://localhost:3000"
export PORT=4000
npm start
```

Notes
- This is a minimal gateway for development/demonstration. For production consider adding auth, rate limiting, logging and better error handling.

