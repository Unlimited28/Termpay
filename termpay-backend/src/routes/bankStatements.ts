import { Router } from 'express'
import {
  uploadStatement,
  listUploads,
  getUploadTransactions,
  dismissTransaction,
  overrideMatch,
  runMatching,
  confirmMatch,
  confirmAllHigh
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

router.post(
  '/:id/match',
  requireRole('proprietor', 'bursar', 'super_admin'),
  runMatching
)

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

router.put(
  '/:id/transactions/:txId/confirm',
  requireRole('proprietor', 'bursar', 'super_admin'),
  confirmMatch
)

router.post(
  '/:id/confirm-all-high',
  requireRole('proprietor', 'bursar', 'super_admin'),
  confirmAllHigh
)

export default router
