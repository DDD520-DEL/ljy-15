import { Router, Request, Response } from 'express';
import { bookings, artists, lastBookingUpdate, touchBookingUpdate, createNotification } from '../data/mockData';
import type { BookingRequest, Booking, BookingStatus } from '../../shared/types';
import { BOOKING_STATUS_FLOW } from '../../shared/types';

const router = Router();

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const LONG_POLL_TIMEOUT = 25000;
const POLL_INTERVAL = 500;

function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (to === 'cancelled' && from !== 'completed' && from !== 'cancelled') {
    return true;
  }
  const fromIndex = BOOKING_STATUS_FLOW.indexOf(from);
  const toIndex = BOOKING_STATUS_FLOW.indexOf(to);
  return fromIndex !== -1 && toIndex !== -1 && toIndex === fromIndex + 1;
}

function getNextStatus(current: BookingStatus): BookingStatus | null {
  const index = BOOKING_STATUS_FLOW.indexOf(current);
  if (index === -1 || index === BOOKING_STATUS_FLOW.length - 1) {
    return null;
  }
  return BOOKING_STATUS_FLOW[index + 1];
}

function filterBookings(
  contact?: string,
  status?: BookingStatus,
  artistId?: string,
  since?: number
): Booking[] {
  let filtered = [...bookings];

  if (contact && typeof contact === 'string') {
    filtered = filtered.filter(b => b.contact === contact);
  }

  if (status && typeof status === 'string') {
    filtered = filtered.filter(b => b.status === status);
  }

  if (artistId && typeof artistId === 'string') {
    filtered = filtered.filter(b => b.artistId === artistId);
  }

  if (since && typeof since === 'number') {
    filtered = filtered.filter(b => {
      const updatedAt = b.statusUpdatedAt ? new Date(b.statusUpdatedAt).getTime() : new Date(b.createdAt).getTime();
      return updatedAt > since;
    });
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return filtered;
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { contact, status, artistId, since } = req.query;
    const filtered = filterBookings(
      contact as string,
      status as BookingStatus,
      artistId as string,
      since ? Number(since) : undefined
    );

    res.json({
      success: true,
      data: filtered,
      timestamp: lastBookingUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    });
  }
});

router.get('/updates', async (req: Request, res: Response) => {
  try {
    const { contact, artistId, since } = req.query;
    const sinceTime = since ? Number(since) : 0;
    const contactStr = contact as string | undefined;
    const artistIdStr = artistId as string | undefined;

    if (lastBookingUpdate > sinceTime) {
      const filtered = filterBookings(contactStr, undefined, artistIdStr, sinceTime);
      return res.json({
        success: true,
        data: filtered,
        timestamp: lastBookingUpdate,
        hasUpdates: filtered.length > 0
      });
    }

    let elapsed = 0;
    const checkInterval = setInterval(() => {
      elapsed += POLL_INTERVAL;

      if (lastBookingUpdate > sinceTime) {
        clearInterval(checkInterval);
        const filtered = filterBookings(contactStr, undefined, artistIdStr, sinceTime);
        res.json({
          success: true,
          data: filtered,
          timestamp: lastBookingUpdate,
          hasUpdates: filtered.length > 0
        });
        return;
      }

      if (elapsed >= LONG_POLL_TIMEOUT) {
        clearInterval(checkInterval);
        res.json({
          success: true,
          data: [],
          timestamp: lastBookingUpdate,
          hasUpdates: false
        });
      }
    }, POLL_INTERVAL);

    req.on('close', () => {
      clearInterval(checkInterval);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '监听更新失败'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约详情失败'
    });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewId } = req.body;

    if (status && !ALL_STATUSES.includes(status as BookingStatus)) {
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

    if (status && status !== booking.status) {
      if (!canTransition(booking.status, status as BookingStatus)) {
        return res.status(400).json({
          success: false,
          message: `无法从「${booking.status}」状态变更为「${status}」状态`
        });
      }
      const oldStatus = booking.status;
      booking.status = status as BookingStatus;
      booking.statusUpdatedAt = new Date().toISOString();
      touchBookingUpdate();

      if (status === 'cancelled') {
        createNotification('booking_cancelled', booking, oldStatus);
      } else {
        createNotification('booking_status_changed', booking, oldStatus);
      }
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
      createdAt: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString()
    };

    bookings.push(booking);
    touchBookingUpdate();
    createNotification('booking_created', booking);

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
