import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Calendar, Trash2, CheckSquare, Square, BarChart3, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ArtistCard } from '../components/ArtistCard';
import { BookingModal } from '../components/BookingModal';
import { ArtistComparisonPanel } from '../components/ArtistComparisonPanel';
import { useStore } from '../store/useStore';
import type { Artist } from '../../shared/types';

const MAX_COMPARE = 3;

export function Favorites() {
  const { favorites, fetchFavorites, toggleFavorite } = useStore();
  const [bookingArtist, setBookingArtist] = useState<Artist | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleQuickBook = (artist: Artist) => {
    setBookingArtist(artist);
    setBookingOpen(true);
  };

  const toggleSelect = (artistId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(artistId)) {
        return prev.filter(id => id !== artistId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, artistId];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const selectedArtists = favorites.filter(a => selectedIds.includes(a.id));

  const handleOpenComparison = () => {
    if (selectedArtists.length > 0) {
      setComparisonOpen(true);
    }
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

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-blood fill-current" />
            <div>
              <h1 className="font-display text-3xl text-white">我的收藏</h1>
              <p className="text-gray-500 text-sm">
                共收藏 {favorites.length} 位纹身师
              </p>
            </div>
          </div>

          {favorites.length >= 2 && (
            <div className="text-gray-500 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              勾选卡片最多对比 {MAX_COMPARE} 位艺术家
            </div>
          )}
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
              {favorites.map(artist => {
                const isSelected = selectedIds.includes(artist.id);
                const isDisabled = !isSelected && selectedIds.length >= MAX_COMPARE;
                return (
                  <div key={artist.id} className="relative group">
                    <div className={`absolute top-3 left-3 z-20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSelect(artist.id);
                        }}
                        disabled={isDisabled}
                        className={`p-1.5 rounded transition-colors ${
                          isSelected
                            ? 'bg-blood text-white'
                            : isDisabled
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-black/50 text-white/70 hover:bg-blood hover:text-white'
                        }`}
                        title={isDisabled ? '最多只能选择3位' : isSelected ? '取消选择' : '加入对比'}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className={`transition-all duration-300 ${isSelected ? 'ring-2 ring-blood ring-offset-2 ring-offset-ink-200 rounded-lg' : ''}`}>
                      <ArtistCard artist={artist} />
                    </div>

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
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-ink-200 border-t border-white/10 shadow-2xl z-40 animate-slide-up">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {selectedArtists.map(artist => (
                  <img
                    key={artist.id}
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full border-2 border-ink-200 object-cover"
                    title={artist.name}
                  />
                ))}
              </div>
              <div>
                <p className="text-white font-medium">
                  已选择 {selectedIds.length} 位艺术家
                </p>
                <p className="text-gray-500 text-sm">
                  还可选择 {MAX_COMPARE - selectedIds.length} 位
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearSelection}
                className="btn-outline flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                清除选择
              </button>
              <button
                onClick={handleOpenComparison}
                className="btn-primary flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                开始对比
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        open={bookingOpen}
        artist={bookingArtist}
        onClose={() => setBookingOpen(false)}
      />

      <ArtistComparisonPanel
        open={comparisonOpen}
        artists={selectedArtists}
        onClose={() => setComparisonOpen(false)}
      />
    </div>
  );
}
