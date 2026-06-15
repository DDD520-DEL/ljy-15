import type { Artist, Style, BookingRequest, Booking, Review, ApiResponse, ArtistQuery, BookingStatus, Notification, TimeSlot, ArtistAnalytics, CancellationReason } from '../../shared/types';
import { TIME_SLOTS } from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: '网络请求失败',
    };
  }
}

export async function getArtists(query?: ArtistQuery): Promise<Artist[]> {
  const params = new URLSearchParams();
  if (query?.styles) {
    query.styles.forEach(s => params.append('styles', s));
  }
  if (query?.region) params.set('region', query.region);
  if (query?.priceMin) params.set('priceMin', String(query.priceMin));
  if (query?.priceMax) params.set('priceMax', String(query.priceMax));
  if (query?.keyword) params.set('keyword', query.keyword);

  const queryStr = params.toString();
  const res = await request<Artist[]>(`/artists${queryStr ? `?${queryStr}` : ''}`);
  return res.success && res.data ? res.data : [];
}

export async function getArtist(id: string): Promise<Artist | null> {
  const res = await request<Artist>(`/artists/${id}`);
  return res.success && res.data ? res.data : null;
}

export async function getStyles(): Promise<Style[]> {
  const res = await request<Style[]>('/styles');
  return res.success && res.data ? res.data : [];
}

export async function getRegions(): Promise<string[]> {
  const res = await request<string[]>('/regions');
  return res.success && res.data ? res.data : [];
}

export async function getFavorites(): Promise<Artist[]> {
  const res = await request<Artist[]>('/favorites');
  return res.success && res.data ? res.data : [];
}

export async function addFavorite(artistId: string): Promise<boolean> {
  const res = await request(`/favorites/${artistId}`, { method: 'POST' });
  return res.success;
}

export async function removeFavorite(artistId: string): Promise<boolean> {
  const res = await request(`/favorites/${artistId}`, { method: 'DELETE' });
  return res.success;
}

export async function getAvailableSlots(artistId: string, date: string): Promise<{ occupiedSlots: TimeSlot[]; availableSlots: TimeSlot[]; allSlots: readonly TimeSlot[] }> {
  const res = await request<{ occupiedSlots: TimeSlot[]; availableSlots: TimeSlot[]; allSlots: TimeSlot[] }>(`/bookings/occupied-slots?artistId=${encodeURIComponent(artistId)}&date=${encodeURIComponent(date)}`);
  if (res.success && res.data) {
    return {
      occupiedSlots: res.data.occupiedSlots,
      availableSlots: res.data.availableSlots,
      allSlots: TIME_SLOTS,
    };
  }
  return {
    occupiedSlots: [],
    availableSlots: TIME_SLOTS as unknown as TimeSlot[],
    allSlots: TIME_SLOTS,
  };
}

export async function submitBooking(data: BookingRequest): Promise<{ success: boolean; message?: string; booking?: Booking }> {
  const res = await request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return {
    success: res.success,
    message: res.message,
    booking: res.data,
  };
}

export async function getArtistReviews(artistId: string): Promise<Review[]> {
  const res = await request<Review[]>(`/reviews/artist/${artistId}`);
  return res.success && res.data ? res.data : [];
}

export async function submitReview(data: { artistId: string; bookingId: string; rating: number; comment: string; reviewer: string }): Promise<{ success: boolean; message?: string; review?: Review }> {
  const res = await request<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return {
    success: res.success,
    message: res.message,
    review: res.data,
  };
}

export async function getBookings(contact?: string, status?: BookingStatus, artistId?: string, since?: number): Promise<{ data: Booking[]; timestamp: number }> {
  const params = new URLSearchParams();
  if (contact) params.set('contact', contact);
  if (status) params.set('status', status);
  if (artistId) params.set('artistId', artistId);
  if (since !== undefined) params.set('since', String(since));
  const queryStr = params.toString();
  const res = await request<Booking[] & { timestamp: number }>(`/bookings${queryStr ? `?${queryStr}` : ''}`);
  return {
    data: res.success && res.data ? (res.data as any).data || res.data : [],
    timestamp: (res.data as any)?.timestamp || Date.now()
  };
}

export async function getBooking(id: string): Promise<Booking | null> {
  const res = await request<Booking>(`/bookings/${id}`);
  return res.success && res.data ? res.data : null;
}

export async function listenBookingUpdates(
  since: number,
  contact?: string,
  artistId?: string
): Promise<{ data: Booking[]; timestamp: number; hasUpdates: boolean }> {
  const params = new URLSearchParams();
  params.set('since', String(since));
  if (contact) params.set('contact', contact);
  if (artistId) params.set('artistId', artistId);
  const queryStr = params.toString();
  const res = await request<any>(`/bookings/updates?${queryStr}`);
  return {
    data: res.success && res.data ? res.data.data || [] : [],
    timestamp: res.data?.timestamp || Date.now(),
    hasUpdates: res.data?.hasUpdates || false
  };
}

export async function updateBookingStatus(bookingId: string, status?: BookingStatus, reviewId?: string): Promise<{ success: boolean; message?: string; booking?: Booking }> {
  const res = await request<Booking>(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reviewId }),
  });
  return {
    success: res.success,
    message: res.message,
    booking: res.data,
  };
}

export async function getNotifications(contact?: string, artistId?: string): Promise<{ data: Notification[]; timestamp: number }> {
  const params = new URLSearchParams();
  if (contact) params.set('contact', contact);
  if (artistId) params.set('artistId', artistId);
  const queryStr = params.toString();
  const res = await request<Notification[] & { timestamp: number }>(`/notifications${queryStr ? `?${queryStr}` : ''}`);
  return {
    data: res.success && res.data ? (res.data as any).data || res.data : [],
    timestamp: (res.data as any)?.timestamp || Date.now(),
  };
}

export async function getUnreadNotificationCount(contact?: string, artistId?: string): Promise<number> {
  const params = new URLSearchParams();
  if (contact) params.set('contact', contact);
  if (artistId) params.set('artistId', artistId);
  const queryStr = params.toString();
  const res = await request<{ count: number }>(`/notifications/unread-count${queryStr ? `?${queryStr}` : ''}`);
  return res.success && res.data ? (res.data as any).count || 0 : 0;
}

export async function listenNotificationUpdates(
  since: number,
  contact?: string,
  artistId?: string
): Promise<{ data: Notification[]; timestamp: number; hasUpdates: boolean; unreadCount: number }> {
  const params = new URLSearchParams();
  params.set('since', String(since));
  if (contact) params.set('contact', contact);
  if (artistId) params.set('artistId', artistId);
  const queryStr = params.toString();
  const res = await request<any>(`/notifications/updates?${queryStr}`);
  return {
    data: res.success && res.data ? res.data.data || [] : [],
    timestamp: res.data?.timestamp || Date.now(),
    hasUpdates: res.data?.hasUpdates || false,
    unreadCount: res.data?.unreadCount || 0,
  };
}

export async function markNotificationRead(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await request(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return {
    success: res.success,
    message: res.message,
  };
}

export async function markAllNotificationsRead(contact?: string, artistId?: string): Promise<{ success: boolean; message?: string }> {
  const res = await request('/notifications/read-all', {
    method: 'PATCH',
    body: JSON.stringify({ contact, artistId }),
  });
  return {
    success: res.success,
    message: res.message,
  };
}

export async function addArtistWork(artistId: string, data: { title: string; image: string; style: string; description?: string }): Promise<{ success: boolean; message?: string; artist?: Artist }> {
  const res = await request<Artist>(`/artists/${artistId}/works`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return {
    success: res.success,
    message: res.message,
    artist: res.data,
  };
}

export async function removeArtistWork(artistId: string, workId: string): Promise<{ success: boolean; message?: string; artist?: Artist }> {
  const res = await request<Artist>(`/artists/${artistId}/works/${workId}`, {
    method: 'DELETE',
  });
  return {
    success: res.success,
    message: res.message,
    artist: res.data,
  };
}

export async function getArtistAnalytics(artistId: string): Promise<ArtistAnalytics | null> {
  const res = await request<ArtistAnalytics>(`/artists/${artistId}/analytics`);
  return res.success && res.data ? res.data : null;
}

export interface CancellationInfo {
  canCancel: boolean;
  penaltyRate: number;
  penaltyAmount: number;
  hoursUntilBooking: number;
  freeCancelHours: number;
  reasons: readonly string[];
}

export async function getCancellationInfo(bookingId: string): Promise<{ success: boolean; data?: CancellationInfo; message?: string }> {
  const res = await request<CancellationInfo>(`/bookings/${bookingId}/cancellation-info`);
  return {
    success: res.success,
    data: res.data,
    message: res.message,
  };
}

export async function cancelBooking(
  bookingId: string,
  reason: CancellationReason,
  note?: string
): Promise<{ success: boolean; message?: string; booking?: Booking; penaltyRate?: number; penaltyAmount?: number }> {
  const res = await request<any>(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason, note }),
  });
  return {
    success: res.success,
    message: res.message,
    booking: res.data?.booking,
    penaltyRate: res.data?.penaltyRate,
    penaltyAmount: res.data?.penaltyAmount,
  };
}
