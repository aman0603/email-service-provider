# Resilient Email Sending Service

A production-ready Node.js + Express application to reliably send emails using multiple providers.  
It features **retry with exponential backoff**, **provider fallback**, **rate limiting**, **circuit breaker pattern**, and **MongoDB-based logging for status tracking**.

---

##  Features

✅ Retry with exponential backoff  
✅ Fallback to alternate providers if one fails  
✅ Circuit Breaker to avoid hammering failing providers  
✅ Rate limiting per time window  
✅ Idempotent email sends (no duplicates)  
✅ MongoDB logging with status tracking

---

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- Postman (for testing)

---

## Folder Structure

```bash
service_provider/
├── models/
├  ├── EmailLog.js
├── providers/
├  ├── providerA.js
├  └── providerB.js
├── routes/
├  └── emailRoutes.js
├── services/
├  ├── EmailService.js
├  ├── RateLimiter.js
├  ├── CircuitBreaker.js
├  └── RetryHelper.js
├── db.js
├── .env
└── server.js
```

---

##   How It Works

### Email Flow:

1️⃣ Client calls **POST /api/send** with email data (id, to, subject, body).  
2️⃣ Service checks **idempotency** (no duplicate emailId in DB).  
3️⃣ **Rate Limiter** checks if sending quota is available.  
4️⃣ Attempts to send email via **ProviderA**:
   - Retries up to 3 times with backoff
   - Circuit Breaker trips if repeated failures
5️⃣ On failure, **fallback** to **ProviderB**.  
6️⃣ Logs **status, provider used, retry count** in MongoDB.  
7️⃣ Client can query **GET /api/status/:id** to check delivery status.

---

##  Setup Instructions

1️⃣ Clone the repo:
```bash
git clone https://github.com/aman0603/email-service-provider.git
cd service_provider
```

2️⃣ Install dependencies:
```bash
npm install
```

3️⃣ Create .env file:
```bash
MONGO_URI=your_mongodb_connection_string
```

4️⃣ Start the server:
```bash
node server.js
```
