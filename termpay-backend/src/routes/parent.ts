import { Router } from 'express'
import {
  getParentStatus,
  downloadParentReceipt
} from '../controllers/parentController'
import { parentAuthMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.use(parentAuthMiddleware)

router.get('/status', getParentStatus)
router.get('/receipts/:paymentId/download', downloadParentReceipt)

export default router
