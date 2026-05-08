import { Router } from 'express'
const router = Router()

router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Students routes not yet implemented',
    code: 'NOT_IMPLEMENTED'
  })
})

export default router
