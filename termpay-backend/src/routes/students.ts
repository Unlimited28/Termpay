import { Router } from 'express'
import {
  listStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getClasses
} from '../controllers/studentsController'
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Classes endpoint
router.get('/classes', getClasses)

// Student CRUD
router.get('/', listStudents)
router.post('/', requireRole('proprietor', 'bursar', 'super_admin'), createStudent)
router.get('/:id', getStudent)
router.put('/:id', requireRole('proprietor', 'bursar', 'super_admin'), updateStudent)
router.delete('/:id', requireRole('proprietor', 'super_admin'), deleteStudent)

export default router
