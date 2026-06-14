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
  status: 'pending' | 'completed' | 'cancelled';
  reviewId?: string;
  createdAt: string;
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
