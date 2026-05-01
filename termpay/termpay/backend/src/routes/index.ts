import express from 'express';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import studentRoutes from './students';
import { supabase } from '../db/supabaseClient';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);

// Test DB route
router.get('/test-db', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*');

    res.json({
      success: true,
      data,
      error
    });
  } catch (err: any) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

export default router;
