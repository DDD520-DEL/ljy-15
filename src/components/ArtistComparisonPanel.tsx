import { X, Star, MapPin, DollarSign, Tag } from 'lucide-react';
import type { Artist } from '../../shared/types';

interface Props {
  open: boolean;
  artists: Artist[];
  onClose: () => void;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
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

export function ArtistComparisonPanel({ open, artists, onClose }: Props) {
  if (!open || artists.length === 0) return null;

  const comparisonFields = [
    {
      label: '风格标签',
      icon: Tag,
      render: (artist: Artist) => (
        <div className="flex flex-wrap gap-1.5">
          {artist.styles.map(style => (
            <span
              key={style}
              className="px-2 py-1 text-xs bg-blood/20 text-blood border border-blood/30"
            >
              {style}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: '价格区间',
      icon: DollarSign,
      render: (artist: Artist) => (
        <div className="flex items-center gap-1 text-gold font-medium">
          <DollarSign className="w-4 h-4" />
          ¥{artist.priceMin} - ¥{artist.priceMax}
          <span className="text-gray-500 text-sm font-normal ml-1">
            /{artist.priceUnit}
          </span>
        </div>
      ),
    },
    {
      label: '评分',
      icon: Star,
      render: (artist: Artist) => (
        <div className="flex items-center gap-2">
          <StarRating rating={artist.avgRating} size={14} />
          <span className="text-gold font-medium">{artist.avgRating}</span>
          <span className="text-gray-500 text-sm">({artist.reviewCount}条评价)</span>
        </div>
      ),
    },
    {
      label: '所在城市',
      icon: MapPin,
      render: (artist: Artist) => (
        <div className="flex items-center gap-1.5 text-gray-300">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{artist.city}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-ink-200 border border-white/10 animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blood via-gold to-blood" />

        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-ink-200 z-10">
          <div>
            <h2 className="font-display text-xl text-white">艺术家对比</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              对比 {artists.length} 位纹身师的详细信息
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `120px repeat(${artists.length}, 1fr)` }}>
            <div className="sticky left-0 bg-ink-200 z-10" />

            {artists.map(artist => (
              <div key={artist.id} className="flex flex-col items-center text-center">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full border-2 border-gold/30 object-cover mb-3"
                />
                <h3 className="text-white font-semibold">{artist.name}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mt-1 max-w-[180px]">
                  {artist.bio}
                </p>
              </div>
            ))}

            {comparisonFields.map((field, fieldIndex) => (
              <>
                <div
                  key={`label-${fieldIndex}`}
                  className="flex items-center gap-2 text-gray-400 text-sm font-medium py-4 border-t border-white/5 sticky left-0 bg-ink-200 z-10"
                >
                  <field.icon className="w-4 h-4" />
                  <span>{field.label}</span>
                </div>

                {artists.map((artist, artistIndex) => (
                  <div
                    key={`value-${fieldIndex}-${artistIndex}`}
                    className={`py-4 border-t border-white/5 flex items-center ${
                      artistIndex < artists.length - 1 ? 'border-r border-white/5 pr-4' : ''
                    }`}
                  >
                    {field.render(artist)}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-white/5 sticky bottom-0 bg-ink-200">
          <button
            onClick={onClose}
            className="btn-outline px-8"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
