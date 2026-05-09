import { Router } from 'express'
import {
  getDashboardStats,
  getRecentPayments,
  getUnpaidStudents,
  getClassBreakdown,
  sendReminder,
  sendBulkReminders
} from '../controllers/dashboardController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'

const router = Router()

// All dashboard routes require authentication
router.use(authMiddleware)

// Available to all admin roles
router.get('/stats', getDashboardStats)
router.get('/recent-payments', getRecentPayments)
router.get('/unpaid-students', getUnpaidStudents)
router.post('/reminders/:studentId', sendReminder)
router.post('/reminders/bulk', sendBulkReminders)

// Proprietor and super admin only
router.get(
  '/class-breakdown',
  requireRole('proprietor', 'super_admin'),
  getClassBreakdown
)

export default router
