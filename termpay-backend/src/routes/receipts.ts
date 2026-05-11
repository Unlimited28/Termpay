import { Router } from 'express'
import {
  listReceipts,
  downloadReceipt,
  generateReceipt
} from '../controllers/receiptsController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/', listReceipts)
router.get('/:id/download', downloadReceipt)
router.post(
  '/:id/generate',
  requireRole('proprietor', 'bursar', 'super_admin'),
  generateReceipt
)

export default router
