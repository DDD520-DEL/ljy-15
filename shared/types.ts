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

export const CANCELLATION_REASONS = [
  '计划有变，暂时不需要',
  '找到了更合适的纹身师',
  '预算调整',
  '纹身师无法按时服务',
  '身体原因',
  '其他原因',
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number];

export const CANCELLATION_POLICY = {
  FREE_CANCEL_HOURS: 24,
  PENALTY_RATE_BEFORE_24H: 0.3,
  PENALTY_RATE_BEFORE_6H: 0.5,
  PENALTY_RATE_LESS_6H: 0.8,
} as const;

export interface CancellationResult {
  success: boolean;
  penaltyRate: number;
  penaltyAmount: number;
  message?: string;
}

export interface BookingCancellation {
  reason: CancellationReason;
  note?: string;
  cancelledAt: string;
  penaltyRate: number;
  penaltyAmount: number;
}

export interface Work {
  id: string;
  title: string;
  image: string;
  style: string;
  artistId: string;
  description?: string;
  createdAt?: string;
}

export interface WorkUploadForm {
  title: string;
  description: string;
  style: string;
  image: string;
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
  couponId?: string;
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
  cancellation?: BookingCancellation;
  couponId?: string;
  discountAmount?: number;
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

export type SortBy = 'rating' | 'popularity' | 'price';
export type SortOrder = 'asc' | 'desc';

export interface ArtistQuery {
  styles?: string[];
  region?: string;
  priceMin?: number;
  priceMax?: number;
  keyword?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
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

export interface DailyBookingTrend {
  date: string;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  createdAt: string;
}

export interface ArtistAnalytics {
  bookingTrend: DailyBookingTrend[];
  totalRevenue: number;
  completedBookingsCount: number;
  avgRevenuePerBooking: number;
  ratingDistribution: RatingDistribution[];
  avgRating: number;
  totalReviews: number;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export type CouponType = 'full_reduction' | 'discount';

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  full_reduction: '满减券',
  discount: '折扣券',
};

export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  threshold: number;
  value: number;
  totalCount: number;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  couponId: string;
  userId: string;
  used: boolean;
  usedAt?: string;
  bookingId?: string;
  claimedAt: string;
}

export interface ArtistApplicationRequest {
  name: string;
  phone: string;
  email?: string;
  bio: string;
  styles: string[];
  city: string;
  wechat?: string;
  portfolioLinks?: string;
  note?: string;
}

export interface ArtistApplication {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bio: string;
  styles: string[];
  city: string;
  wechat?: string;
  portfolioLinks?: string;
  note?: string;
  status: ApplicationStatus;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface BrowseHistoryItem {
  artist: Artist;
  browsedAt: string;
}

export type FeedbackStatus = 'pending' | 'processing' | 'replied' | 'closed';

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  replied: '已回复',
  closed: '已关闭',
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  replied: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export type FeedbackCategory = 'bug' | 'feature' | 'suggestion' | 'complaint' | 'other';

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: '问题反馈',
  feature: '功能需求',
  suggestion: '优化建议',
  complaint: '投诉建议',
  other: '其他',
};

export interface FeedbackImage {
  id: string;
  url: string;
}

export interface Feedback {
  id: string;
  userId: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  images: FeedbackImage[];
  contact?: string;
  status: FeedbackStatus;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSubmitRequest {
  category: FeedbackCategory;
  title: string;
  description: string;
  images?: { url: string }[];
  contact?: string;
  userId?: string;
}

export type AnnouncementPriority = 'low' | 'normal' | 'high';

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  low: '低',
  normal: '普通',
  high: '紧急',
};

export const ANNOUNCEMENT_PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  startDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCalendarEntry {
  id: string;
  artistId: string;
  date: string;
  priceMin: number;
  priceMax: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCalendarUpsertRequest {
  date: string;
  priceMin: number;
  priceMax: number;
  note?: string;
}

export interface PriceCalendarBatchUpsertRequest {
  entries: Omit<PriceCalendarUpsertRequest, 'date'> & { startDate: string; endDate: string }[];
}

export interface PriceInfo {
  date: string;
  priceMin: number;
  priceMax: number;
  isCustomPrice: boolean;
  note?: string;
}
