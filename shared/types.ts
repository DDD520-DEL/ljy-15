export const TIME_SLOTS = [
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const BOOKING_STATUS_FLOW: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed'];

export interface Work {
  id: string;
  title: string;
  image: string;
  style: string;
  artistId: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  region: string;
  city: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  styles: string[];
  works: Work[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Style {
  id: string;
  name: string;
  nameEn: string;
  popularity: number;
}

export interface BookingRequest {
  artistId: string;
  style: string;
  size: string;
  budgetMin: number;
  budgetMax: number;
  contact: string;
  note?: string;
  bookingDate: string;
  timeSlot: TimeSlot;
}

export interface Booking {
  id: string;
  artistId: string;
  style: string;
  size: string;
  budgetMin: number;
  budgetMax: number;
  contact: string;
  note?: string;
  status: BookingStatus;
  reviewId?: string;
  createdAt: string;
  statusUpdatedAt?: string;
  bookingDate: string;
  timeSlot: TimeSlot;
}

export interface Review {
  id: string;
  artistId: string;
  bookingId: string;
  rating: number;
  comment: string;
  reviewer: string;
  createdAt: string;
}

export interface ArtistQuery {
  styles?: string[];
  region?: string;
  priceMin?: number;
  priceMax?: number;
  keyword?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type NotificationType = 'booking_status_changed' | 'booking_cancelled' | 'booking_created';

export interface Notification {
  id: string;
  type: NotificationType;
  bookingId: string;
  artistId: string;
  contact?: string;
  oldStatus?: BookingStatus;
  newStatus?: BookingStatus;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}
