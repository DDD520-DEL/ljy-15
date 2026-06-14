import type { Artist, Style, BookingRequest, Booking, ApiResponse, ArtistQuery } from '../../shared/types';

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
