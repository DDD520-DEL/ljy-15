import type { Artist, Style, Review, Booking, Notification, BookingStatus, TimeSlot, ArtistApplication, ArtistApplicationRequest, ApplicationStatus, Coupon, UserCoupon, Feedback, FeedbackSubmitRequest, FeedbackStatus, FeedbackCategory, Announcement, AnnouncementPriority, PriceCalendarEntry, PriceInfo } from '../../shared/types';
import { BOOKING_STATUS_LABELS, TIME_SLOTS } from '../../shared/types';

export const styles: Style[] = [
  { id: 'old-school', name: 'Old School', nameEn: 'Old School', popularity: 95 },
  { id: 'new-school', name: 'New School', nameEn: 'New School', popularity: 80 },
  { id: 'ink-wash', name: '水墨', nameEn: 'Ink Wash', popularity: 75 },
  { id: 'dotwork', name: '点刺', nameEn: 'Dotwork', popularity: 70 },
  { id: 'single-needle', name: '单针写实', nameEn: 'Single Needle', popularity: 85 },
  { id: 'japanese', name: '日式传统', nameEn: 'Japanese Traditional', popularity: 88 },
  { id: 'geometric', name: '几何', nameEn: 'Geometric', popularity: 72 },
  { id: 'lettering', name: '花体字', nameEn: 'Lettering', popularity: 65 },
  { id: 'blackwork', name: '黑灰', nameEn: 'Blackwork', popularity: 78 },
  { id: 'watercolor', name: '水彩', nameEn: 'Watercolor', popularity: 60 },
  { id: 'tribal', name: '部落', nameEn: 'Tribal', popularity: 55 },
  { id: 'realism', name: '写实', nameEn: 'Realism', popularity: 90 },
];

export const regions = [
  '北京', '上海', '广州', '深圳', '成都',
  '杭州', '重庆', '武汉', '西安', '南京'
];

const imageKeywords = [
  'tattoo', 'ink', 'black-ink', 'tattoo-art', 'body-art',
  'tattoo-design', 'skin-art', 'tattoo-studio'
];

const artistNames = [
  '墨玄', '刺青客', '雕龙', '阿May', '小刀',
  '老K', '纹人墨客', '铁针', '刺魂', '青鸟',
  '青鸾', '黑墨', '纹艺', '针艺', '刺道'
];

const bios = [
  '从业十年，擅长东方传统风格，作品讲究线条流畅与意境表达。',
  '留日归来，精通日式传统刺青，尤以浮世绘题材见长。',
  '新锐纹身师，将水墨意境与现代纹身技法融合，风格独特。',
  '专注写实纹身十余年，擅长肖像、动植物写实，细节还原度极高。',
  '点刺艺术的探索者，用数以万计的点构成一幅幅精美的图案。',
  'Old School风格忠实拥趸，色彩鲜艳线条粗犷，美式复古味十足。',
  'New School风格代表，大胆夸张的造型，梦幻般的色彩搭配。',
  '几何与线条美学的追求者，作品充满对称美感与神圣几何。',
  '花体字大师，欧美书法与纹身艺术完美结合，每一针都是艺术。',
  '黑灰纹身专家，用黑白灰演绎出丰富的层次与深邃的意境。',
  '水彩纹身艺术家，作品如流动的水彩画，色彩斑斓而不失灵动。',
  '部落图腾研究者，将古老部落文化与现代纹身相融合。',
  '单针纹身匠人，用最细的针创造出最精致的作品。',
  '全能型纹身师，多种风格自由切换，为每位客人定制专属图案。',
  '女性纹身师，细腻柔美的风格，特别擅长小清新与花卉题材。'
];

const reviewerNames = [
  '小龙', '阿杰', '小美', '大壮', '小丽',
  '老王', '小雪', '阿强', '小慧', '大海',
  '小云', '阿飞', '小月', '大勇', '小春'
];

const reviewComments = [
  '非常满意！纹身师技术精湛，图案还原度极高，整个过程也很舒适。',
  '效果超出预期，细节处理得很好，恢复期也很顺利，强烈推荐！',
  '很专业的纹身师，沟通很顺畅，最终效果我很喜欢。',
  '服务态度很好，环境也很干净，作品质量没得说。',
  '第一次纹身，纹身师很有耐心地解答问题，作品也很满意。',
  '已经是第三次来了，每次都很满意，会继续光顾的。',
  '朋友推荐来的，确实不错，图案设计很有创意。',
  '手法很稳，线条很流畅，整体效果非常棒！',
  '预约很方便，等候时间不长，纹身过程也很快，效果很好。',
  '细节处理得很到位，上色也很均匀，非常满意这次的作品。'
];

function generateWorks(artistId: string, artistStyles: string[], count: number) {
  const works = [];
  for (let i = 0; i < count; i++) {
    const style = artistStyles[i % artistStyles.length];
    const seed = `${artistId}-${i}-${Date.now()}`;
    works.push({
      id: `${artistId}-work-${i}`,
      title: `${style}作品 ${i + 1}`,
      image: `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/${400 + Math.floor(Math.random() * 400)}`,
      style,
      artistId,
      description: `这是一件精心创作的${style}风格纹身作品，融合了传统技法与现代审美，每一针每一线都倾注了心血。`,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return works;
}

export function addArtistWork(artistId: string, work: { title: string; image: string; style: string; description?: string }): Artist | null {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) return null;
  const newWork = {
    id: `${artistId}-work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: work.title,
    image: work.image,
    style: work.style,
    artistId,
    description: work.description || '',
    createdAt: new Date().toISOString()
  };
  artist.works.unshift(newWork);
  return artist;
}

export function removeArtistWork(artistId: string, workId: string): Artist | null {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) return null;
  artist.works = artist.works.filter(w => w.id !== workId);
  return artist;
}

function generateReviews(artistId: string): Review[] {
  const reviews: Review[] = [];
  const count = 2 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const reviewId = `review-${artistId}-${i}`;
    reviews.push({
      id: reviewId,
      artistId,
      bookingId: `booking-${artistId}-${i}`,
      rating: 3 + Math.floor(Math.random() * 3),
      comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
      reviewer: reviewerNames[Math.floor(Math.random() * reviewerNames.length)],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return reviews;
}

function generateArtists(): Artist[] {
  const artists: Artist[] = [];
  for (let i = 0; i < 15; i++) {
    const styleCount = 1 + Math.floor(Math.random() * 3);
    const artistStyles: string[] = [];
    while (artistStyles.length < styleCount) {
      const s = styles[Math.floor(Math.random() * styles.length)];
      if (!artistStyles.includes(s.name)) {
        artistStyles.push(s.name);
      }
    }
    const region = regions[i % regions.length];
    const priceBase = 300 + Math.floor(Math.random() * 8) * 300;
    const artistId = `artist-${i + 1}`;
    const artistReviews = generateReviews(artistId);
    const avgRating = artistReviews.length > 0
      ? Math.round(artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length * 10) / 10
      : 0;

    artists.push({
      id: artistId,
      name: artistNames[i],
      avatar: `https://picsum.photos/seed/artist-${i + 1}-avatar/200/200`,
      bio: bios[i],
      region,
      city: region,
      priceMin: priceBase,
      priceMax: priceBase + 500 + Math.floor(Math.random() * 1500),
      priceUnit: '小时',
      styles: artistStyles,
      works: generateWorks(artistId, artistStyles, 5 + Math.floor(Math.random() * 4)),
      avgRating,
      reviewCount: artistReviews.length,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    allReviews.push(...artistReviews);
  }
  return artists;
}

export const allReviews: Review[] = [];
export const artists: Artist[] = generateArtists();
export let favorites: string[] = [];

export interface BrowseRecord {
  artistId: string;
  browsedAt: string;
}

export let browseHistory: BrowseRecord[] = [];

function generateTestBookings(): Booking[] {
  const testBookings: Booking[] = [];
  const statuses: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed'];
  const today = new Date();
  
  for (let i = 0; i < 20; i++) {
    const artistIndex = i % 5;
    const daysAhead = Math.floor(i / 4);
    const slotIndex = i % TIME_SLOTS.length;
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + daysAhead);
    
    testBookings.push({
      id: `booking-test-${i}`,
      artistId: `artist-${artistIndex + 1}`,
      style: styles[i % styles.length].name,
      size: `${10 + i * 2}x${15 + i * 2}cm`,
      budgetMin: 500 + i * 100,
      budgetMax: 1000 + i * 100,
      contact: `138${String(10000000 + i).slice(-8)}`,
      note: i % 3 === 0 ? '需要设计参考图案' : undefined,
      status: statuses[i % statuses.length],
      createdAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      statusUpdatedAt: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
      bookingDate: bookingDate.toISOString().split('T')[0],
      timeSlot: TIME_SLOTS[slotIndex] as TimeSlot,
    });
  }
  
  return testBookings;
}

export let bookings: Booking[] = generateTestBookings();
export let lastBookingUpdate = Date.now();

export function touchBookingUpdate() {
  lastBookingUpdate = Date.now();
}

export let notifications: Notification[] = [];
export let lastNotificationUpdate = Date.now();

export function touchNotificationUpdate() {
  lastNotificationUpdate = Date.now();
}

export function createNotification(
  type: Notification['type'],
  booking: Booking,
  oldStatus?: BookingStatus
): Notification {
  let title = '';
  let content = '';
  const artist = artists.find(a => a.id === booking.artistId);
  const artistName = artist ? artist.name : '纹身师';

  if (type === 'booking_created') {
    title = '新预约申请';
    content = `${booking.style} - 您有新的预约申请待处理`;
  } else if (type === 'booking_cancelled') {
    title = '预约已取消';
    content = `${booking.style} - 该预约已被取消`;
  } else if (type === 'booking_status_changed') {
    const newStatusLabel = BOOKING_STATUS_LABELS[booking.status];
    title = '预约状态更新';
    content = `${artistName} 的预约「${booking.style}」状态已变更为「${newStatusLabel}」`;
  }

  const notification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    bookingId: booking.id,
    artistId: booking.artistId,
    contact: booking.contact,
    oldStatus,
    newStatus: booking.status,
    title,
    content,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(notification);
  touchNotificationUpdate();
  return notification;
}

export function getNotificationsByContact(contact: string): Notification[] {
  return notifications.filter(n => n.contact === contact);
}

export function getNotificationsByArtistId(artistId: string): Notification[] {
  return notifications.filter(n => n.artistId === artistId);
}

export function markNotificationAsRead(id: string): boolean {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    touchNotificationUpdate();
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(contact?: string, artistId?: string): boolean {
  let hasUpdate = false;
  notifications.forEach(n => {
    if (!n.read) {
      if (contact && n.contact === contact) {
        n.read = true;
        hasUpdate = true;
      } else if (artistId && n.artistId === artistId) {
        n.read = true;
        hasUpdate = true;
      }
    }
  });
  if (hasUpdate) {
    touchNotificationUpdate();
  }
  return hasUpdate;
}

export const artistApplications: ArtistApplication[] = [];
export let lastApplicationUpdate = Date.now();

export function touchApplicationUpdate() {
  lastApplicationUpdate = Date.now();
}

export function createApplication(data: ArtistApplicationRequest): ArtistApplication {
  const application: ArtistApplication = {
    id: `application-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  artistApplications.unshift(application);
  touchApplicationUpdate();
  return application;
}

export function getApplicationById(id: string): ArtistApplication | undefined {
  return artistApplications.find(a => a.id === id);
}

export function getApplicationsByPhone(phone: string): ArtistApplication[] {
  return artistApplications.filter(a => a.phone === phone);
}

export function getAllApplications(status?: ApplicationStatus): ArtistApplication[] {
  let filtered = [...artistApplications];
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateApplicationStatus(id: string, status: ApplicationStatus, reviewNote?: string): ArtistApplication | null {
  const application = getApplicationById(id);
  if (!application) return null;
  application.status = status;
  application.reviewedAt = new Date().toISOString();
  if (reviewNote) {
    application.reviewNote = reviewNote;
  }
  touchApplicationUpdate();
  return application;
}

const now = new Date();
const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

export let coupons: Coupon[] = [
  {
    id: 'coupon-1',
    name: '新客满500减50',
    type: 'full_reduction',
    threshold: 500,
    value: 50,
    totalCount: 100,
    usedCount: 3,
    perUserLimit: 1,
    startDate: now.toISOString().split('T')[0],
    endDate: in30Days.toISOString().split('T')[0],
    enabled: true,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'coupon-2',
    name: '满1000减120',
    type: 'full_reduction',
    threshold: 1000,
    value: 120,
    totalCount: 50,
    usedCount: 0,
    perUserLimit: 2,
    startDate: now.toISOString().split('T')[0],
    endDate: in30Days.toISOString().split('T')[0],
    enabled: true,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'coupon-3',
    name: '全场9折券',
    type: 'discount',
    threshold: 0,
    value: 9,
    totalCount: 200,
    usedCount: 12,
    perUserLimit: 1,
    startDate: now.toISOString().split('T')[0],
    endDate: in60Days.toISOString().split('T')[0],
    enabled: true,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'coupon-4',
    name: '满2000减300',
    type: 'full_reduction',
    threshold: 2000,
    value: 300,
    totalCount: 30,
    usedCount: 0,
    perUserLimit: 1,
    startDate: now.toISOString().split('T')[0],
    endDate: in30Days.toISOString().split('T')[0],
    enabled: true,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'coupon-5',
    name: '全场8.5折券',
    type: 'discount',
    threshold: 500,
    value: 8.5,
    totalCount: 100,
    usedCount: 5,
    perUserLimit: 1,
    startDate: now.toISOString().split('T')[0],
    endDate: in60Days.toISOString().split('T')[0],
    enabled: true,
    createdAt: now.toISOString(),
  },
];

export let userCoupons: UserCoupon[] = [];

export function getCouponById(id: string): Coupon | undefined {
  return coupons.find(c => c.id === id);
}

export function getAvailableCoupons(): Coupon[] {
  const today = new Date().toISOString().split('T')[0];
  return coupons.filter(c =>
    c.enabled &&
    c.usedCount < c.totalCount &&
    c.startDate <= today &&
    c.endDate >= today
  );
}

export function getUserAvailableCoupons(userId: string): (UserCoupon & { coupon: Coupon })[] {
  const available = getAvailableCoupons();
  return userCoupons
    .filter(uc => uc.userId === userId && !uc.used)
    .map(uc => {
      const coupon = available.find(c => c.id === uc.couponId);
      if (!coupon) return null;
      return { ...uc, coupon };
    })
    .filter((uc): uc is UserCoupon & { coupon: Coupon } => uc !== null);
}

export function claimCoupon(couponId: string, userId: string): UserCoupon | null {
  const coupon = getCouponById(couponId);
  if (!coupon || !coupon.enabled) return null;

  const today = new Date().toISOString().split('T')[0];
  if (coupon.startDate > today || coupon.endDate < today) return null;

  const userClaimed = userCoupons.filter(
    uc => uc.couponId === couponId && uc.userId === userId
  ).length;
  if (userClaimed >= coupon.perUserLimit) return null;

  const userCoupon: UserCoupon = {
    id: `uc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    couponId,
    userId,
    used: false,
    claimedAt: new Date().toISOString(),
  };

  userCoupons.push(userCoupon);
  return userCoupon;
}

export function useUserCoupon(userCouponId: string, bookingId: string): boolean {
  const uc = userCoupons.find(u => u.id === userCouponId);
  if (!uc || uc.used) return false;
  const coupon = getCouponById(uc.couponId);
  if (!coupon || coupon.usedCount >= coupon.totalCount) return false;
  uc.used = true;
  uc.usedAt = new Date().toISOString();
  uc.bookingId = bookingId;
  coupon.usedCount += 1;
  return true;
}

export interface RedeemCouponResult {
  success: boolean;
  discountAmount: number;
  userCouponId?: string;
  coupon?: Coupon;
  error?: string;
}

export function redeemCoupon(
  couponId: string,
  userId: string,
  bookingId: string,
  amount: number
): RedeemCouponResult {
  const coupon = getCouponById(couponId);
  if (!coupon) {
    return { success: false, discountAmount: 0, error: '优惠券不存在' };
  }
  if (!coupon.enabled) {
    return { success: false, discountAmount: 0, error: '优惠券已失效' };
  }

  const today = new Date().toISOString().split('T')[0];
  if (coupon.startDate > today) {
    return { success: false, discountAmount: 0, error: '优惠券尚未生效' };
  }
  if (coupon.endDate < today) {
    return { success: false, discountAmount: 0, error: '优惠券已过期' };
  }
  if (coupon.usedCount >= coupon.totalCount) {
    return { success: false, discountAmount: 0, error: '优惠券已被领完' };
  }

  const discount = calculateCouponDiscount(coupon, amount);
  if (discount <= 0) {
    return { success: false, discountAmount: 0, error: '不满足优惠券使用门槛' };
  }

  let userCoupon = userCoupons.find(
    uc => uc.couponId === couponId && uc.userId === userId && !uc.used
  );

  if (!userCoupon) {
    const userClaimedTotal = userCoupons.filter(
      uc => uc.couponId === couponId && uc.userId === userId
    ).length;
    if (userClaimedTotal >= coupon.perUserLimit) {
      return { success: false, discountAmount: 0, error: '已达该优惠券每人使用上限' };
    }
    userCoupon = {
      id: `uc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      couponId,
      userId,
      used: false,
      claimedAt: new Date().toISOString(),
    };
    userCoupons.push(userCoupon);
  }

  userCoupon.used = true;
  userCoupon.usedAt = new Date().toISOString();
  userCoupon.bookingId = bookingId;
  coupon.usedCount += 1;

  return {
    success: true,
    discountAmount: discount,
    userCouponId: userCoupon.id,
    coupon,
  };
}

export function calculateCouponDiscount(coupon: Coupon, amount: number): number {
  if (coupon.type === 'full_reduction') {
    if (amount < coupon.threshold) return 0;
    return Math.min(coupon.value, amount);
  }
  if (coupon.type === 'discount') {
    if (amount < coupon.threshold) return 0;
    return Math.round(amount * (1 - coupon.value / 10));
  }
  return 0;
}

export function createCoupon(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon {
  const coupon: Coupon = {
    id: `coupon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  coupons.unshift(coupon);
  return coupon;
}

export function updateCoupon(id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt'>>): Coupon | null {
  const coupon = getCouponById(id);
  if (!coupon) return null;
  Object.assign(coupon, data);
  return coupon;
}

export function deleteCoupon(id: string): boolean {
  const index = coupons.findIndex(c => c.id === id);
  if (index === -1) return false;
  coupons.splice(index, 1);
  return true;
}

export const feedbacks: Feedback[] = [
  {
    id: 'feedback-1',
    userId: 'user-1',
    category: 'suggestion',
    title: '希望增加更多风格筛选',
    description: '目前的风格分类有点少，希望能增加更多细分风格，比如卡通、插画等风格的分类，这样找起来会更方便。',
    images: [],
    contact: '13800138000',
    status: 'replied',
    reply: '感谢您的建议！我们已经在规划中，预计下个版本会增加更多风格分类，敬请期待。',
    repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback-2',
    userId: 'user-1',
    category: 'bug',
    title: '预约时间选择有问题',
    description: '在选择预约时间时，有时候会出现日期选择器闪退的情况，尤其是在快速切换月份的时候更容易出现。',
    images: [
      {
        id: 'img-1',
        url: 'https://picsum.photos/seed/feedback-screenshot-1/600/400',
      },
    ],
    contact: '13800138000',
    status: 'processing',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export let lastFeedbackUpdate = Date.now();

export function touchFeedbackUpdate() {
  lastFeedbackUpdate = Date.now();
}

export function createFeedback(data: FeedbackSubmitRequest): Feedback {
  const now = new Date().toISOString();
  const feedback: Feedback = {
    id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: data.userId || 'anonymous',
    category: data.category,
    title: data.title,
    description: data.description,
    images: (data.images || []).map((img, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: img.url,
    })),
    contact: data.contact,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  feedbacks.unshift(feedback);
  touchFeedbackUpdate();
  return feedback;
}

export function getFeedbackById(id: string): Feedback | undefined {
  return feedbacks.find(f => f.id === id);
}

export function getFeedbacksByUserId(userId: string, status?: FeedbackStatus): Feedback[] {
  let filtered = feedbacks.filter(f => f.userId === userId);
  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllFeedbacks(status?: FeedbackStatus, category?: FeedbackCategory): Feedback[] {
  let filtered = [...feedbacks];
  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }
  if (category) {
    filtered = filtered.filter(f => f.category === category);
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus, reply?: string): Feedback | null {
  const feedback = getFeedbackById(id);
  if (!feedback) return null;
  feedback.status = status;
  feedback.updatedAt = new Date().toISOString();
  if (reply) {
    feedback.reply = reply;
    feedback.repliedAt = new Date().toISOString();
  }
  touchFeedbackUpdate();
  return feedback;
}

const nowDate = new Date();
const threeDaysAgo = new Date(nowDate.getTime() - 3 * 24 * 60 * 60 * 1000);
const sevenDaysLater = new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000);
const oneDayAgo = new Date(nowDate.getTime() - 1 * 24 * 60 * 60 * 1000);
const thirtyDaysLater = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000);
const tenDaysLater = new Date(nowDate.getTime() + 10 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(nowDate.getTime() - 5 * 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(nowDate.getTime() - 2 * 24 * 60 * 60 * 1000);

export let announcements: Announcement[] = [
  {
    id: 'announcement-1',
    title: '平台春节期间服务安排通知',
    content: '春节期间（1月28日-2月4日），部分纹身师可能无法及时响应预约，请提前沟通确认。平台客服将保持在线，如有问题可随时联系。',
    priority: 'high',
    startDate: threeDaysAgo.toISOString().split('T')[0],
    endDate: sevenDaysLater.toISOString().split('T')[0],
    enabled: true,
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'announcement-2',
    title: '新风格上线：暗黑哥特风',
    content: '平台现已支持暗黑哥特风格分类，多位擅长此风格的纹身师已入驻，欢迎探索体验！',
    priority: 'normal',
    startDate: oneDayAgo.toISOString().split('T')[0],
    endDate: thirtyDaysLater.toISOString().split('T')[0],
    enabled: true,
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
  {
    id: 'announcement-3',
    title: '限时优惠活动进行中',
    content: '即日起至月底，新用户首单立减100元，老用户推荐好友双方各得50元优惠券，活动详情请查看优惠券页面。',
    priority: 'normal',
    startDate: fiveDaysAgo.toISOString().split('T')[0],
    endDate: tenDaysLater.toISOString().split('T')[0],
    enabled: true,
    createdAt: fiveDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  },
];

export let lastAnnouncementUpdate = Date.now();

export function touchAnnouncementUpdate() {
  lastAnnouncementUpdate = Date.now();
}

export function getAnnouncementById(id: string): Announcement | undefined {
  return announcements.find(a => a.id === id);
}

export function getAllAnnouncements(enabled?: boolean, priority?: AnnouncementPriority): Announcement[] {
  let filtered = [...announcements];
  if (enabled !== undefined) {
    filtered = filtered.filter(a => a.enabled === enabled);
  }
  if (priority) {
    filtered = filtered.filter(a => a.priority === priority);
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getActiveAnnouncements(): Announcement[] {
  const today = new Date().toISOString().split('T')[0];
  return announcements
    .filter(a => a.enabled && a.startDate <= today && a.endDate >= today)
    .sort((a, b) => {
      const priorityOrder: Record<AnnouncementPriority, number> = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
  const now = new Date().toISOString();
  const announcement: Announcement = {
    id: `announcement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  announcements.unshift(announcement);
  touchAnnouncementUpdate();
  return announcement;
}

export function updateAnnouncement(id: string, data: Partial<Omit<Announcement, 'id' | 'createdAt'>>): Announcement | null {
  const announcement = getAnnouncementById(id);
  if (!announcement) return null;
  Object.assign(announcement, data, { updatedAt: new Date().toISOString() });
  touchAnnouncementUpdate();
  return announcement;
}

export function deleteAnnouncement(id: string): boolean {
  const index = announcements.findIndex(a => a.id === id);
  if (index === -1) return false;
  announcements.splice(index, 1);
  touchAnnouncementUpdate();
  return true;
}

export let priceCalendar: PriceCalendarEntry[] = [];
export let lastPriceCalendarUpdate = Date.now();

export function touchPriceCalendarUpdate() {
  lastPriceCalendarUpdate = Date.now();
}

export function getPriceCalendarByArtistId(artistId: string, startDate?: string, endDate?: string): PriceCalendarEntry[] {
  let filtered = priceCalendar.filter(p => p.artistId === artistId);
  if (startDate) {
    filtered = filtered.filter(p => p.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(p => p.date <= endDate);
  }
  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

export function getPriceCalendarEntry(artistId: string, date: string): PriceCalendarEntry | undefined {
  return priceCalendar.find(p => p.artistId === artistId && p.date === date);
}

export function getPriceInfo(artistId: string, date: string): PriceInfo {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) {
    return {
      date,
      priceMin: 0,
      priceMax: 0,
      isCustomPrice: false,
    };
  }

  const customPrice = getPriceCalendarEntry(artistId, date);
  if (customPrice) {
    return {
      date,
      priceMin: customPrice.priceMin,
      priceMax: customPrice.priceMax,
      isCustomPrice: true,
      note: customPrice.note,
    };
  }

  return {
    date,
    priceMin: artist.priceMin,
    priceMax: artist.priceMax,
    isCustomPrice: false,
  };
}

export function getPriceInfos(artistId: string, startDate: string, endDate: string): PriceInfo[] {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) return [];

  const customPrices = getPriceCalendarByArtistId(artistId, startDate, endDate);
  const customPriceMap = new Map(customPrices.map(p => [p.date, p]));

  const results: PriceInfo[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const customPrice = customPriceMap.get(dateStr);

    if (customPrice) {
      results.push({
        date: dateStr,
        priceMin: customPrice.priceMin,
        priceMax: customPrice.priceMax,
        isCustomPrice: true,
        note: customPrice.note,
      });
    } else {
      results.push({
        date: dateStr,
        priceMin: artist.priceMin,
        priceMax: artist.priceMax,
        isCustomPrice: false,
      });
    }
  }

  return results;
}

export function upsertPriceCalendarEntry(
  artistId: string,
  date: string,
  priceMin: number,
  priceMax: number,
  note?: string
): PriceCalendarEntry | null {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) return null;

  const existing = getPriceCalendarEntry(artistId, date);
  const now = new Date().toISOString();

  if (existing) {
    existing.priceMin = priceMin;
    existing.priceMax = priceMax;
    existing.note = note;
    existing.updatedAt = now;
    touchPriceCalendarUpdate();
    return existing;
  }

  const entry: PriceCalendarEntry = {
    id: `price-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    artistId,
    date,
    priceMin,
    priceMax,
    note,
    createdAt: now,
    updatedAt: now,
  };

  priceCalendar.push(entry);
  touchPriceCalendarUpdate();
  return entry;
}

export function batchUpsertPriceCalendar(
  artistId: string,
  startDate: string,
  endDate: string,
  priceMin: number,
  priceMax: number,
  note?: string
): PriceCalendarEntry[] | null {
  const artist = artists.find(a => a.id === artistId);
  if (!artist) return null;

  const results: PriceCalendarEntry[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const entry = upsertPriceCalendarEntry(artistId, dateStr, priceMin, priceMax, note);
    if (entry) {
      results.push(entry);
    }
  }

  return results;
}

export function deletePriceCalendarEntry(artistId: string, date: string): boolean {
  const index = priceCalendar.findIndex(p => p.artistId === artistId && p.date === date);
  if (index === -1) return false;
  priceCalendar.splice(index, 1);
  touchPriceCalendarUpdate();
  return true;
}

export function deletePriceCalendarRange(artistId: string, startDate: string, endDate: string): number {
  const initialLength = priceCalendar.length;
  priceCalendar = priceCalendar.filter(p => !(p.artistId === artistId && p.date >= startDate && p.date <= endDate));
  const deletedCount = initialLength - priceCalendar.length;
  if (deletedCount > 0) {
    touchPriceCalendarUpdate();
  }
  return deletedCount;
}
