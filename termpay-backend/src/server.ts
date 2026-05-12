import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { testConnection } from './config/supabase'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware'

// Import route placeholders
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import studentsRoutes from './routes/students'
import bankStatementRoutes from './routes/bankStatements'
import paymentsRoutes from './routes/payments'
import receiptsRoutes from './routes/receipts'
import parentRoutes from './routes/parent'

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: [
    env.frontendUrl,
    'http://localhost:5173',
    'https://termpay.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version: '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/students', studentsRoutes)
app.use('/api/bank-statements', bankStatementRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/receipts', receiptsRoutes)
app.use('/api/parent', parentRoutes)

// 404 handler
app.use(notFoundHandler)

// Global error handler
app.use(errorHandler)

// Start server
async function startServer() {
  // Test database connection first
  const connected = await testConnection()

  if (!connected) {
    console.error('Failed to connect to database. Exiting.')
    process.exit(1)
  }

  app.listen(env.port, () => {
    console.log(`
╔════════════════════════════════════════╗
║         TermPay Backend Server         ║
╠════════════════════════════════════════╣
║  Status:  Running                      ║
║  Port:    ${env.port}                          ║
║  Env:     ${env.nodeEnv}                 ║
║  Health:  /health                      ║
╚════════════════════════════════════════╝
    `)
  })
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer()
}

export default app
