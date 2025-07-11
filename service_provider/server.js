import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import { EmailService } from './services/EmailService.js';
import { RateLimiter } from './services/RateLimiter.js';
import { ProviderA } from './providers/providerA.js';
import { ProviderB } from './providers/providerB.js';
import { createEmailRoutes } from './routes/emailRoutes.js';

await connectDB();

const providers = [new ProviderA(), new ProviderB()];
const rateLimiter = new RateLimiter(5, 60000);
const emailService = new EmailService(providers, rateLimiter);

const app = express();
app.use(bodyParser.json());

app.use('/api', createEmailRoutes(emailService));

app.get('/', (req, res) => {
  res.send('Email Service is Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1)); 
});

//catch uncaught exceptions
process.on('uncaughtException', (err) => {  
  console.log(`Error: ${err.message}`);
  process.exit(1);//crash the server
});