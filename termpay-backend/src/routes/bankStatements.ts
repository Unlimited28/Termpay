import { Router } from 'express'
import {
  uploadStatement,
  listUploads,
  getUploadTransactions,
  dismissTransaction,
  overrideMatch
} from '../controllers/bankStatementsController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'
import { uploadMiddleware } from '../middleware/uploadMiddleware'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Upload and list
router.post(
  '/upload',
  requireRole('proprietor', 'bursar', 'super_admin'),
  uploadMiddleware.single('file'),
  uploadStatement
)
router.get('/', listUploads)

// Transaction management
router.get('/:id/transactions', getUploadTransactions)
router.put(
  '/:id/transactions/:txId/dismiss',
  requireRole('proprietor', 'bursar', 'super_admin'),
  dismissTransaction
)
router.put(
  '/:id/transactions/:txId/override',
  requireRole('proprietor', 'bursar', 'super_admin'),
  overrideMatch
)

export default router
