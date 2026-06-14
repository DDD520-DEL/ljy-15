import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import type { Work, Artist } from '../../shared/types';
import { useStore } from '../store/useStore';

interface Props {
  work: Work;
  artist?: Artist;
}

export function WorkCard({ work, artist }: Props) {
  const { toggleFavorite, isFavorite } = useStore();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (artist) {
      toggleFavorite(artist.id);
    }
  };

  const fav = artist ? isFavorite(artist.id) : false;

  return (
    <Link
      to={artist ? `/artist/${artist.id}` : '#'}
      className="group block relative overflow-hidden bg-graphite border border-white/5 hover:border-blood/50 transition-all duration-500"
    >
      <div className="relative overflow-hidden aspect-auto">
        <img
          src={work.image}
          alt={work.title}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {artist && (
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
              fav
                ? 'bg-blood text-white'
                : 'bg-black/50 text-white/70 hover:bg-blood hover:text-white opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          {artist && (
            <div className="flex items-center gap-3 mb-3">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-9 h-9 rounded-full border-2 border-gold/50 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{artist.name}</div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  {artist.city}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-2 py-0.5 text-xs bg-blood/80 text-white">
              {work.style}
            </span>
            {artist && (
              <span className="text-gold text-xs font-medium">
                ¥{artist.priceMin}-{artist.priceMax}/{artist.priceUnit}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
