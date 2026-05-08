import { Router } from 'express'
const router = Router()

router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Receipts routes not yet implemented',
    code: 'NOT_IMPLEMENTED'
  })
})

export default router
