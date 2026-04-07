import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { mockAdmins, mockOTPs, mockStudents } from '../db/mockStore';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'termpay-secret-key';

// Admin Login (Mock)
router.post('/login', (req: any, res: any) => {
  const { email, password } = req.body;

  if (password === 'Admin1234!') {
    const admin = mockAdmins.find(a => {
      if (email === 'admin@termpay.ng') return a.id === 'admin-1';
      if (email === 'proprietor@yomfield.sch.ng') return a.id === 'proprietor-1';
      if (email === 'bursar@yomfield.sch.ng') return a.id === 'bursar-1';
      return false;
    });

    if (admin) {
      const token = jwt.sign(
        { id: admin.id, schoolId: admin.school_id, role: admin.role, type: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token, user: admin });
    }
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// Parent OTP Request
router.post('/parent/request-otp', (req: any, res: any) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Phone number required' });

  const code = '123456';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  mockOTPs.push({
    id: Math.random().toString(36).substr(2, 9),
    phone,
    code,
    expires_at: expiresAt,
    used: false,
    created_at: new Date().toISOString()
  });

  console.log(`========= SMS NOTIFICATION (MOCK) =========`);
  console.log(`To: ${phone}`);
  console.log(`Message: Your TermPay login code is ${code}. Valid for 10 minutes.`);
  console.log(`===========================================`);

  return res.json({ success: true, message: 'OTP sent successfully' });
});

// Parent OTP Verify
router.post('/parent/verify-otp', (req: any, res: any) => {
  const { phone, code } = req.body;
  
  const otpIndex = mockOTPs.findIndex(o => o.phone === phone && o.code === code && !o.used && new Date(o.expires_at) > new Date());
  
  if (otpIndex === -1) {
    return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
  }

  mockOTPs[otpIndex].used = true;

  const parentStudents = mockStudents.filter(s => s.parent_phone === phone);
  if (parentStudents.length === 0) {
    return res.status(404).json({ success: false, error: 'No student found with this phone number' });
  }

  const token = jwt.sign(
    { 
      parentPhone: phone, 
      schoolId: parentStudents[0].school_id, 
      studentIds: parentStudents.map(s => s.id),
      type: 'parent' 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ success: true, token, user: { phone, type: 'parent' } });
});

export default router;
