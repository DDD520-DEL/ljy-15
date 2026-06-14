import { Router, Request, Response } from 'express';
import { regions } from '../data/mockData';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取地区列表失败'
    });
  }
});

export default router;
