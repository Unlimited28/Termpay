import { Router } from 'express'
import {
  login,
  logout,
  forgotPassword,
  requestParentOTP,
  verifyParentOTP,
  getCurrentUser
} from '../controllers/authController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Public routes
router.post('/login', login)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/parent/request-otp', requestParentOTP)
router.post('/parent/verify-otp', verifyParentOTP)

// Protected routes
router.get('/me', authMiddleware, getCurrentUser)

export default router
