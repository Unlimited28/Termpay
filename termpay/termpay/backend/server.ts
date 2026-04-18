import dotenv from 'dotenv';
dotenv.config();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'loaded' : 'missing');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'loaded' : 'missing');

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(port, () => {
  console.log(`TermPay Backend listening on port ${port}`);
});

export default app;
