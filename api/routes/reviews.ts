import { Router, Request, Response } from 'express';
import { allReviews, artists, bookings } from '../data/mockData';
import type { Review } from '../../shared/types';

const router = Router();

router.get('/artist/:artistId', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const reviews = allReviews.filter(r => r.artistId === artistId);
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取评价列表失败'
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { artistId, bookingId, rating, comment, reviewer } = req.body;

    if (!artistId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的评价信息'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }

    const existingReview = allReviews.find(r => r.bookingId === bookingId);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '该预约已评价'
      });
    }

    const review: Review = {
      id: `review-${Date.now()}`,
      artistId,
      bookingId,
      rating,
      comment,
      reviewer: reviewer || '匿名用户',
      createdAt: new Date().toISOString()
    };

    allReviews.push(review);

    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.reviewId = review.id;
      booking.status = 'completed';
    }

    const artistReviews = allReviews.filter(r => r.artistId === artistId);
    artist.avgRating = Math.round(
      artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length * 10
    ) / 10;
    artist.reviewCount = artistReviews.length;

    res.status(201).json({
      success: true,
      data: review,
      message: '评价提交成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '提交评价失败'
    });
  }
});

export default router;
