import dotenv from 'dotenv';
dotenv.config();

console.log('Server started');
console.log('Environment:', process.env.NODE_ENV);
console.log('Supabase URL exists:', !!process.env.SUPABASE_URL);
console.log('Service role exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import express from 'express';
import cors from 'cors';
import apiRoutes from './src/routes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Global Debug Route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TermPay backend is running',
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    server: 'running',
    uptime: process.uptime()
  });
});

// Route Visibility Check
app.get('/debug/routes', (req, res) => {
  res.json({
    message: 'Routes debug active'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Handle Unknown Routes
app.use((req: any, res: any) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`TermPay Backend listening on port ${port}`);
  });
}

export default app;
