import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, Heart, Star, MapPin, Loader2 } from 'lucide-react';
import type { Artist } from '../../shared/types';
import { useStore } from '../store/useStore';

function RecommendArtistCard({ artist }: { artist: Artist }) {
  const { toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(artist.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(artist.id);
  };

  return (
    <Link
      to={`/artist/${artist.id}`}
      className="group flex-shrink-0 w-[220px] card overflow-hidden hover:-translate-y-1 duration-300"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={artist.works[0]?.image || artist.avatar}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 ${
            fav
              ? 'bg-blood text-white'
              : 'bg-black/50 text-white/70 hover:bg-blood hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-2 left-3 right-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {artist.styles.slice(0, 2).map(s => (
              <span key={s} className="px-1.5 py-0.5 text-[10px] bg-blood/80 text-white">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={artist.avatar}
            alt={artist.name}
            className="w-9 h-9 rounded-full border border-gold/30 object-cover -mt-6 relative z-10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm group-hover:text-blood transition-colors truncate">
              {artist.name}
            </h4>
            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
              <MapPin className="w-2.5 h-2.5" />
              {artist.city}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-gold text-xs font-medium">
            ¥{artist.priceMin}
            <span className="text-gray-500 text-[10px] font-normal">/{artist.priceUnit}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-gold text-xs font-medium">{artist.avgRating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RecommendSection() {
  const {
    recommendedArtists,
    recommendedBasedOnStyles,
    recommendationsLoading,
    fetchRecommendations,
    favorites,
  } = useStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecommendations(8);
  }, [fetchRecommendations, favorites.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (recommendationsLoading) {
    return (
      <section className="container pb-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blood" />
          <h2 className="font-display text-xl md:text-2xl text-white">猜你喜欢</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blood animate-spin" />
          <span className="ml-2 text-gray-400 text-sm">正在分析你的偏好...</span>
        </div>
      </section>
    );
  }

  if (recommendedArtists.length === 0) {
    return null;
  }

  return (
    <section className="container pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blood" />
          <h2 className="font-display text-xl md:text-2xl text-white">猜你喜欢</h2>
          {recommendedBasedOnStyles.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-3">
              <span className="text-gray-500 text-xs">基于</span>
              {recommendedBasedOnStyles.map(style => (
                <span
                  key={style}
                  className="px-2 py-0.5 text-xs bg-blood/10 border border-blood/20 text-blood/80"
                >
                  {style}
                </span>
              ))}
              <span className="text-gray-500 text-xs">推荐</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendedArtists.map(artist => (
          <RecommendArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}
