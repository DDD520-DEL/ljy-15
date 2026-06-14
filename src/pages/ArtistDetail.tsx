import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, DollarSign, Calendar, Loader2, X, Star } from 'lucide-react';
import type { Artist, Review, Booking } from '../../shared/types';
import { getArtist, getArtistReviews, getBookings } from '../lib/api';
import { useStore } from '../store/useStore';
import { Navbar } from '../components/Navbar';
import { BookingModal } from '../components/BookingModal';
import { ReviewModal } from '../components/ReviewModal';

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  if (total === 0) return null;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: Math.round((reviews.filter(r => r.rating === star).length / total) * 100),
  }));

  return (
    <div className="space-y-1.5">
      {distribution.map(({ star, count, percent }) => (
        <div key={star} className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 w-6 text-right">{star}星</span>
          <div className="flex-1 h-2 bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gold/70 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-gray-500 w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { toggleFavorite, isFavorite, fetchFavorites } = useStore();
  const fav = artist ? isFavorite(artist.id) : false;

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    const [a, r] = await Promise.all([
      getArtist(id),
      getArtistReviews(id),
    ]);
    setArtist(a);
    setReviews(r);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!artist) return;
    getBookings(undefined, 'completed').then(bookings => {
      const unreviewed = bookings.filter(
        b => b.artistId === artist.id && !b.reviewId
      );
      setCompletedBookings(unreviewed);
    });
  }, [artist, reviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blood animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-gray-400 mb-4">纹身师不存在</p>
          <Link to="/" className="text-blood hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回作品墙
        </Link>

        <div className="bg-graphite border border-white/5 p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gold/40"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
                    {artist.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {artist.city}
                    </span>
                    <span className="flex items-center gap-1 text-gold">
                      <DollarSign className="w-4 h-4" />
                      ¥{artist.priceMin} - ¥{artist.priceMax}/{artist.priceUnit}
                    </span>
                    {artist.avgRating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <StarRating rating={artist.avgRating} size={14} />
                        <span className="text-gold font-medium">{artist.avgRating}</span>
                        <span className="text-gray-500">({artist.reviewCount}条评价)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleFavorite(artist.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 border transition-all duration-300 ${
                      fav
                        ? 'bg-blood border-blood text-white'
                        : 'border-white/20 text-gray-300 hover:border-blood hover:text-blood'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    {fav ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    预约咨询
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {artist.styles.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blood/15 border border-blood/30 text-blood"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed">
                {artist.bio}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="font-display text-2xl text-white mb-6">代表作品</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.works.map((work, idx) => (
              <button
                key={work.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square overflow-hidden bg-ink-100 border border-white/5 hover:border-blood/50 transition-all"
              >
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {work.style}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-white">用户评价</h2>
            {completedBookings.length > 0 && (
              <button
                onClick={() => setReviewBooking(completedBookings[0])}
                className="btn-outline text-sm px-4 py-2"
              >
                写评价
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <>
              <div className="bg-graphite border border-white/5 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gold mb-2">{artist.avgRating}</div>
                    <StarRating rating={artist.avgRating} size={20} />
                    <div className="text-gray-400 text-sm mt-2">{artist.reviewCount} 条评价</div>
                  </div>
                  <div className="flex-1 w-full">
                    <RatingDistribution reviews={reviews} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-graphite border border-white/5 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blood/20 flex items-center justify-center text-blood text-sm font-medium">
                          {review.reviewer.charAt(0)}
                        </div>
                        <div>
                          <span className="text-white text-sm font-medium">{review.reviewer}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarRating rating={review.rating} size={12} />
                            <span className="text-gold text-xs">{review.rating}.0</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-graphite border border-white/5">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">暂无评价</p>
              <p className="text-gray-500 text-sm">成为第一个评价该纹身师的人</p>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && artist.works[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(i => i !== null ? (i - 1 + artist.works.length) % artist.works.length : null);
            }}
          >
            <ArrowLeft className="w-8 h-8 rotate-180" />
          </button>
          <img
            src={artist.works[lightboxIndex].image}
            alt={artist.works[lightboxIndex].title}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(i => i !== null ? (i + 1) % artist.works.length : null);
            }}
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <div className="text-white font-medium">{artist.works[lightboxIndex].title}</div>
            <div className="text-gray-400 text-sm mt-1">
              {lightboxIndex + 1} / {artist.works.length}
            </div>
          </div>
        </div>
      )}

      <BookingModal
        open={bookingOpen}
        artist={artist}
        onClose={() => setBookingOpen(false)}
      />

      {reviewBooking && (
        <ReviewModal
          open={!!reviewBooking}
          booking={reviewBooking}
          artistId={artist.id}
          onClose={() => setReviewBooking(null)}
          onSubmitted={fetchData}
        />
      )}
    </div>
  );
}
