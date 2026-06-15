import { Router, Request, Response } from 'express';
import { artists, addArtistWork, removeArtistWork, bookings, allReviews } from '../data/mockData';
import type { Artist, WorkUploadForm, ArtistAnalytics, DailyBookingTrend, RatingDistribution, SortBy, SortOrder } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { styles, region, priceMin, priceMax, keyword, sortBy, sortOrder } = req.query;

    let filtered: Artist[] = [...artists];

    if (styles) {
      const styleArr = Array.isArray(styles) ? styles : [styles];
      filtered = filtered.filter(a =>
        styleArr.some(s => a.styles.includes(s as string))
      );
    }

    if (region && typeof region === 'string') {
      filtered = filtered.filter(a => a.region === region || a.city === region);
    }

    if (priceMin) {
      const min = Number(priceMin);
      filtered = filtered.filter(a => a.priceMax >= min);
    }

    if (priceMax) {
      const max = Number(priceMax);
      filtered = filtered.filter(a => a.priceMin <= max);
    }

    if (keyword && typeof keyword === 'string') {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(kw) ||
        a.bio.toLowerCase().includes(kw) ||
        a.styles.some(s => s.toLowerCase().includes(kw))
      );
    }

    const validSortBy = sortBy === 'rating' || sortBy === 'popularity' || sortBy === 'price' ? sortBy as SortBy : null;
    const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder as SortOrder : 'desc';

    if (validSortBy) {
      const artistBookingsCount: Record<string, number> = {};
      bookings.forEach(b => {
        artistBookingsCount[b.artistId] = (artistBookingsCount[b.artistId] || 0) + 1;
      });

      filtered.sort((a, b) => {
        let comparison = 0;

        if (validSortBy === 'rating') {
          if (a.avgRating !== b.avgRating) {
            comparison = a.avgRating - b.avgRating;
          } else {
            comparison = a.reviewCount - b.reviewCount;
          }
        } else if (validSortBy === 'popularity') {
          const aBookings = artistBookingsCount[a.id] || 0;
          const bBookings = artistBookingsCount[b.id] || 0;
          if (aBookings !== bBookings) {
            comparison = aBookings - bBookings;
          } else {
            comparison = a.reviewCount - b.reviewCount;
          }
        } else if (validSortBy === 'price') {
          const aPrice = (a.priceMin + a.priceMax) / 2;
          const bPrice = (b.priceMin + b.priceMax) / 2;
          comparison = aPrice - bPrice;
        }

        return validSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取纹身师列表失败'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const artist = artists.find(a => a.id === req.params.id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }
    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取纹身师详情失败'
    });
  }
});

router.post('/:id/works', (req: Request, res: Response) => {
  try {
    const { title, image, style, description } = req.body as WorkUploadForm;
    if (!title || !image || !style) {
      return res.status(400).json({
        success: false,
        message: '作品标题、图片和风格不能为空'
      });
    }
    const artist = addArtistWork(req.params.id, { title, image, style, description });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }
    res.json({
      success: true,
      data: artist,
      message: '作品上传成功'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '上传作品失败'
    });
  }
});

router.delete('/:id/works/:workId', (req: Request, res: Response) => {
  try {
    const artist = removeArtistWork(req.params.id, req.params.workId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师或作品不存在'
      });
    }
    res.json({
      success: true,
      data: artist,
      message: '作品删除成功'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '删除作品失败'
    });
  }
});

router.get('/:id/analytics', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const artist = artists.find(a => a.id === id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }

    const artistBookings = bookings.filter(b => b.artistId === id);
    const artistReviews = allReviews.filter(r => r.artistId === id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const bookingTrend: DailyBookingTrend[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const count = artistBookings.filter(b => {
        const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bookingDate === dateStr;
      }).length;
      bookingTrend.push({ date: dateStr, count });
    }

    const completedBookings = artistBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + Math.round((b.budgetMin + b.budgetMax) / 2), 0);
    const completedBookingsCount = completedBookings.length;
    const avgRevenuePerBooking = completedBookingsCount > 0 ? Math.round(totalRevenue / completedBookingsCount) : 0;

    const ratingDistribution: RatingDistribution[] = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: artistReviews.filter(r => r.rating === rating).length
    }));

    const totalReviews = artistReviews.length;
    const avgRating = totalReviews > 0
      ? Math.round(artistReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews * 10) / 10
      : 0;

    const analytics: ArtistAnalytics = {
      bookingTrend,
      totalRevenue,
      completedBookingsCount,
      avgRevenuePerBooking,
      ratingDistribution,
      avgRating,
      totalReviews
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

export default router;
