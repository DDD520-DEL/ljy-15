import { Router, Request, Response } from 'express';
import {
  coupons,
  userCoupons,
  getAvailableCoupons,
  getUserAvailableCoupons,
  claimCoupon,
  getCouponById,
  calculateCouponDiscount,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../data/mockData';
import type { CouponType } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const { enabled, type } = _req.query;
    let result = [...coupons];

    if (enabled === 'true') {
      result = result.filter(c => c.enabled);
    }
    if (type && (type === 'full_reduction' || type === 'discount')) {
      result = result.filter(c => c.type === type);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: result,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取优惠券列表失败',
    });
  }
});

router.get('/available', (req: Request, res: Response) => {
  try {
    const result = getAvailableCoupons();
    res.json({
      success: true,
      data: result,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取可用优惠券失败',
    });
  }
});

router.get('/user/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = getUserAvailableCoupons(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取用户优惠券失败',
    });
  }
});

router.post('/claim', (req: Request, res: Response) => {
  try {
    const { couponId, userId } = req.body as { couponId: string; userId: string };

    if (!couponId || !userId) {
      return res.status(400).json({
        success: false,
        message: '请提供优惠券ID和用户ID',
      });
    }

    const result = claimCoupon(couponId, userId);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: '领取失败，优惠券不可用或已达领取上限',
      });
    }

    res.json({
      success: true,
      data: result,
      message: '领取成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '领取优惠券失败',
    });
  }
});

router.post('/calculate', (req: Request, res: Response) => {
  try {
    const { couponId, amount } = req.body as { couponId: string; amount: number };

    if (!couponId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供优惠券ID和金额',
      });
    }

    const coupon = getCouponById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在',
      });
    }

    const discount = calculateCouponDiscount(coupon, amount);
    const finalAmount = Math.max(0, amount - discount);

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        discount,
        finalAmount,
        coupon: {
          id: coupon.id,
          name: coupon.name,
          type: coupon.type,
          threshold: coupon.threshold,
          value: coupon.value,
        },
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '计算优惠失败',
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, threshold, value, totalCount, perUserLimit, startDate, endDate, enabled } = req.body;

    if (!name || !type || value === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的优惠券信息',
      });
    }

    if (type !== 'full_reduction' && type !== 'discount') {
      return res.status(400).json({
        success: false,
        message: '无效的优惠券类型',
      });
    }

    if (type === 'discount' && (value <= 0 || value >= 10)) {
      return res.status(400).json({
        success: false,
        message: '折扣值需在0-10之间',
      });
    }

    const coupon = createCoupon({
      name,
      type: type as CouponType,
      threshold: threshold || 0,
      value,
      totalCount: totalCount || 100,
      perUserLimit: perUserLimit || 1,
      startDate,
      endDate,
      enabled: enabled !== undefined ? enabled : true,
    });

    res.status(201).json({
      success: true,
      data: coupon,
      message: '优惠券创建成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '创建优惠券失败',
    });
  }
});

router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const coupon = updateCoupon(id, data);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在',
      });
    }

    res.json({
      success: true,
      data: coupon,
      message: '更新成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '更新优惠券失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = deleteCoupon(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在',
      });
    }

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '删除优惠券失败',
    });
  }
});

export default router;
