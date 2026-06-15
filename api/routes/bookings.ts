import { Router, Request, Response } from 'express';
import { bookings, artists, lastBookingUpdate, touchBookingUpdate, createNotification, redeemCoupon } from '../data/mockData';
import type { BookingRequest, Booking, BookingStatus, TimeSlot, CancellationReason, BookingCancellation } from '../../shared/types';
import { BOOKING_STATUS_FLOW, TIME_SLOTS, CANCELLATION_POLICY, CANCELLATION_REASONS } from '../../shared/types';

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

function calculatePenalty(booking: Booking): { rate: number; amount: number; hoursUntilBooking: number } {
  const bookingDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot.split('-')[0]}:00`);
  const now = new Date();
  const diffMs = bookingDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const avgBudget = (booking.budgetMin + booking.budgetMax) / 2;

  if (diffHours >= CANCELLATION_POLICY.FREE_CANCEL_HOURS) {
    return { rate: 0, amount: 0, hoursUntilBooking: diffHours };
  } else if (diffHours >= 6) {
    const rate = CANCELLATION_POLICY.PENALTY_RATE_BEFORE_24H;
    return { rate, amount: Math.round(avgBudget * rate), hoursUntilBooking: diffHours };
  } else if (diffHours > 0) {
    const rate = CANCELLATION_POLICY.PENALTY_RATE_BEFORE_6H;
    return { rate, amount: Math.round(avgBudget * rate), hoursUntilBooking: diffHours };
  } else {
    const rate = CANCELLATION_POLICY.PENALTY_RATE_LESS_6H;
    return { rate, amount: Math.round(avgBudget * rate), hoursUntilBooking: diffHours };
  }
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

router.get('/occupied-slots', (req: Request, res: Response) => {
  try {
    const { artistId, date } = req.query;

    if (!artistId || !date) {
      return res.status(400).json({
        success: false,
        message: '请提供艺术家ID和日期'
      });
    }

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }

    const dateStr = date as string;
    const occupiedSlots = bookings
      .filter(b => 
        b.artistId === artistId && 
        b.bookingDate === dateStr && 
        b.status !== 'cancelled'
      )
      .map(b => b.timeSlot);

    const availableSlots = TIME_SLOTS.filter(slot => 
      !occupiedSlots.includes(slot as TimeSlot)
    );

    res.json({
      success: true,
      data: {
        occupiedSlots,
        availableSlots,
        allSlots: TIME_SLOTS,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '查询可用时段失败'
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
  } catch {
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
  } catch {
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

router.get('/:id/cancellation-info', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '该预约已被取消'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '已完成的预约无法取消'
      });
    }

    if (booking.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '进行中的预约无法取消，请联系纹身师协商'
      });
    }

    const penalty = calculatePenalty(booking);

    res.json({
      success: true,
      data: {
        canCancel: true,
        penaltyRate: penalty.rate,
        penaltyAmount: penalty.amount,
        hoursUntilBooking: penalty.hoursUntilBooking,
        freeCancelHours: CANCELLATION_POLICY.FREE_CANCEL_HOURS,
        reasons: CANCELLATION_REASONS,
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取取消信息失败'
    });
  }
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body as { reason: CancellationReason; note?: string };

    if (!reason || !CANCELLATION_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: '请选择有效的取消原因'
      });
    }

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '该预约已被取消'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '已完成的预约无法取消'
      });
    }

    if (booking.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: '进行中的预约无法取消，请联系纹身师协商'
      });
    }

    const penalty = calculatePenalty(booking);
    const oldStatus = booking.status;

    const cancellation: BookingCancellation = {
      reason,
      note,
      cancelledAt: new Date().toISOString(),
      penaltyRate: penalty.rate,
      penaltyAmount: penalty.amount,
    };

    booking.status = 'cancelled';
    booking.statusUpdatedAt = new Date().toISOString();
    booking.cancellation = cancellation;
    touchBookingUpdate();

    createNotification('booking_cancelled', booking, oldStatus);

    res.json({
      success: true,
      data: {
        booking,
        penaltyRate: penalty.rate,
        penaltyAmount: penalty.amount,
      },
      message: penalty.amount > 0
        ? `预约已取消，需支付违约金 ¥${penalty.amount}`
        : '预约已取消，无需支付违约金'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '取消预约失败'
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as BookingRequest;

    if (!body.artistId || !body.style || !body.size || !body.contact || !body.bookingDate || !body.timeSlot) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的预约信息，包括日期和时间段'
      });
    }

    if (!TIME_SLOTS.includes(body.timeSlot as TimeSlot)) {
      return res.status(400).json({
        success: false,
        message: '无效的时间段'
      });
    }

    const artist = artists.find(a => a.id === body.artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }

    const existingBooking = bookings.find(b => 
      b.artistId === body.artistId && 
      b.bookingDate === body.bookingDate && 
      b.timeSlot === body.timeSlot &&
      b.status !== 'cancelled'
    );

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: '该时段已被预约，请选择其他时段'
      });
    }

    const bookingId = `booking-${Date.now()}`;
    let discountAmount = 0;
    if (body.couponId) {
      const avgBudget = (body.budgetMin + body.budgetMax) / 2;
      const coupon = redeemCoupon(body.couponId, body.contact, bookingId, avgBudget);
      if (!coupon.success) {
        return res.status(400).json({
          success: false,
          message: coupon.error || '优惠券使用失败'
        });
      }
      discountAmount = coupon.discountAmount;
    }

    const booking: Booking = {
      id: bookingId,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString(),
      couponId: body.couponId || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
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
