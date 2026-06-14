import type { Artist, Style, Review, Booking, Notification, BookingStatus, TimeSlot } from '../../shared/types';
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
