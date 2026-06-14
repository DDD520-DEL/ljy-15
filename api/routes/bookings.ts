import { Router, Request, Response } from 'express';
import { bookings, artists } from '../data/mockData';
import type { BookingRequest, Booking } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { contact, status } = req.query;
    let filtered = [...bookings];

    if (contact && typeof contact === 'string') {
      filtered = filtered.filter(b => b.contact === contact);
    }

    if (status && typeof status === 'string') {
      filtered = filtered.filter(b => b.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewId } = req.body;

    if (status && !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (status) {
      booking.status = status;
    }
    if (reviewId !== undefined) {
      booking.reviewId = reviewId || undefined;
    }

    res.json({
      success: true,
      data: booking,
      message: '更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as BookingRequest;

    if (!body.artistId || !body.style || !body.size || !body.contact) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的预约信息'
      });
    }

    const artist = artists.find(a => a.id === body.artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);

    res.status(201).json({
      success: true,
      data: booking,
      message: '预约意向已提交，纹身师将尽快与您联系'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '提交预约失败'
    });
  }
});

export default router;
