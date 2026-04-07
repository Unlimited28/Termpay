import { Router } from 'express';
import { mockStudents, mockClasses, mockFeeBills } from '../db/mockStore';

const router = Router();

router.get('/', (req: any, res: any) => {
  const studentsWithDetails = mockStudents.map(s => {
    const studentClass = mockClasses.find(c => c.id === s.class_id);
    const bill = mockFeeBills.find(b => b.student_id === s.id && b.term_id === 'term-1');
    return {
      ...s,
      class_name: studentClass?.name,
      status: bill?.status || 'unpaid',
      amount_paid: bill?.amount_paid || 0,
      total_amount: bill?.total_amount || 85000,
      balance: bill?.balance || 85000
    };
  });
  res.json(studentsWithDetails);
});

export default router;
