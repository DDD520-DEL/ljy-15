import { Router, Request, Response } from 'express';
import { bookings, artists } from '../data/mockData';
import type { BookingRequest, Booking } from '../../shared/types';

const router = Router();

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
