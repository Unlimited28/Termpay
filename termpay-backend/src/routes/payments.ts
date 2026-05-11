import { Router } from 'express'
import {
  listPayments,
  recordManualPayment,
  resendNotification,
  getPayment
} from '../controllers/paymentsController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/', listPayments)
router.post(
  '/manual',
  requireRole('proprietor', 'bursar', 'super_admin'),
  recordManualPayment
)
router.get('/:id', getPayment)
router.post(
  '/:id/resend',
  requireRole('proprietor', 'bursar', 'super_admin'),
  resendNotification
)

export default router
