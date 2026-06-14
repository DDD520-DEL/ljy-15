import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ArtistCard } from '../components/ArtistCard';
import { BookingModal } from '../components/BookingModal';
import { useStore } from '../store/useStore';
import type { Artist } from '../../shared/types';

export function Favorites() {
  const { favorites, fetchFavorites, toggleFavorite } = useStore();
  const [bookingArtist, setBookingArtist] = useState<Artist | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleQuickBook = (artist: Artist) => {
    setBookingArtist(artist);
    setBookingOpen(true);
  };

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

        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-8 h-8 text-blood fill-current" />
          <div>
            <h1 className="font-display text-3xl text-white">我的收藏</h1>
            <p className="text-gray-500 text-sm">
              共收藏 {favorites.length} 位纹身师
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-graphite/30 border border-white/5 py-20 text-center">
            <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-gray-400 text-lg mb-2">还没有收藏任何纹身师</h3>
            <p className="text-gray-600 text-sm mb-6">浏览作品墙，发现你喜欢的纹身风格</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              去探索
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
              {favorites.map(artist => (
                <div key={artist.id} className="relative group">
                  <ArtistCard artist={artist} />
                  <div className="absolute top-14 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => handleQuickBook(artist)}
                      className="p-2 bg-blood text-white hover:bg-blood-light transition-colors shadow-lg"
                      title="快速预约"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(artist.id)}
                      className="p-2 bg-graphite text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-colors shadow-lg"
                      title="取消收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BookingModal
        open={bookingOpen}
        artist={bookingArtist}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
