import { Router, Request, Response } from 'express';
import { styles } from '../data/mockData';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: styles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取风格标签失败'
    });
  }
});

export default router;
