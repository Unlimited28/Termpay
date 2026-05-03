import { Router, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const schoolId = req.user?.schoolId;

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
