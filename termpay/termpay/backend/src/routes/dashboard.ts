import { Router } from 'express';
import { mockStudents, mockFeeBills, mockPayments, mockClasses } from '../db/mockStore';

const router = Router();

router.get('/stats', (req: any, res: any) => {
  const totalStudents = mockStudents.length;
  const totalPaid = mockFeeBills.filter(b => b.status === 'paid').length;
  const totalPartial = mockFeeBills.filter(b => b.status === 'partial').length;
  const totalUnpaid = mockFeeBills.filter(b => b.status === 'unpaid').length;
  
  const totalExpectedRevenue = mockFeeBills.reduce((acc, b) => acc + Number(b.total_amount), 0);
  const totalCollectedRevenue = mockFeeBills.reduce((acc, b) => acc + Number(b.amount_paid), 0);
  const totalOutstandingRevenue = totalExpectedRevenue - totalCollectedRevenue;

  res.json({
    totalStudents,
    totalPaid,
    totalPartial,
    totalUnpaid,
    totalExpectedRevenue,
    totalCollectedRevenue,
    totalOutstandingRevenue,
    paymentStatusData: [
      { name: 'Fully Paid', value: totalPaid, color: '#2E7D32' },
      { name: 'Partial', value: totalPartial, color: '#E65100' },
      { name: 'Unpaid', value: totalUnpaid, color: '#B71C1C' },
    ],
    recentPayments: mockPayments.slice(0, 5).map(p => {
      const student = mockStudents.find(s => s.id === p.student_id);
      const studentClass = mockClasses.find(c => c.id === student?.class_id);
      return {
        ...p,
        student_name: student?.full_name,
        class_name: studentClass?.name
      };
    }),
    unpaidStudents: mockFeeBills.filter(b => b.status === 'unpaid').slice(0, 5).map(b => {
      const student = mockStudents.find(s => s.id === b.student_id);
      const studentClass = mockClasses.find(c => c.id === student?.class_id);
      return {
        ...b,
        student_name: student?.full_name,
        class_name: studentClass?.name
      };
    })
  });
});

export default router;
