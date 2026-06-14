import { Link } from 'react-router-dom';
import { Heart, MapPin, DollarSign } from 'lucide-react';
import type { Artist } from '../../shared/types';
import { useStore } from '../store/useStore';

interface Props {
  artist: Artist;
}

export function ArtistCard({ artist }: Props) {
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
      className="group block card overflow-hidden hover:-translate-y-1 duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={artist.works[0]?.image || artist.avatar}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            fav
              ? 'bg-blood text-white'
              : 'bg-black/50 text-white/70 hover:bg-blood hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 flex-wrap">
            {artist.styles.slice(0, 2).map(s => (
              <span key={s} className="px-2 py-0.5 text-xs bg-blood/80 text-white">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={artist.avatar}
            alt={artist.name}
            className="w-12 h-12 rounded-full border-2 border-gold/30 object-cover -mt-8 relative z-10"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base group-hover:text-blood transition-colors">
              {artist.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
              {artist.city}
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {artist.bio}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-gold text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            ¥{artist.priceMin}-{artist.priceMax}
            <span className="text-gray-500 text-xs font-normal">/{artist.priceUnit}</span>
          </div>
          <span className="text-gray-500 text-xs">{artist.works.length} 件作品</span>
        </div>
      </div>
    </Link>
  );
}
