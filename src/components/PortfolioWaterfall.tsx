import { useState, useEffect, useMemo } from 'react';
import { Trash2, ZoomIn, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Work, Artist } from '../../shared/types';
import { removeArtistWork } from '../lib/api';

interface Props {
  works: Work[];
  artist: Artist;
  isOwner?: boolean;
  onWorkClick: (index: number) => void;
  onWorksUpdated?: (artist: Artist) => void;
}

interface ImageSize {
  width: number;
  height: number;
}

function getAspectRatioFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/(\d+)$/);
  if (match) {
    const w = parseInt(match[1]);
    const h = parseInt(match[2]);
    if (w > 0 && h > 0) return h / w;
  }
  return null;
}

function loadImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

export function PortfolioWaterfall({ works, artist, isOwner, onWorkClick, onWorksUpdated }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imageSizes, setImageSizes] = useState<Record<string, ImageSize>>({});
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (works.length === 0) {
      setAllLoaded(true);
      return;
    }

    setAllLoaded(false);
    const sizesMap: Record<string, ImageSize> = {};
    const preloaded: Record<string, number> = {};

    works.forEach(work => {
      const urlRatio = getAspectRatioFromUrl(work.image);
      if (urlRatio !== null) {
        preloaded[work.id] = urlRatio;
      }
    });

    const needLoad = works.filter(w => preloaded[w.id] === undefined);
    let cancelled = false;

    if (needLoad.length === 0) {
      works.forEach(w => {
        if (preloaded[w.id] !== undefined) {
          const ratio = preloaded[w.id];
          sizesMap[w.id] = { width: 300, height: Math.round(300 * ratio) };
        }
      });
      setImageSizes(sizesMap);
      setAllLoaded(true);
      return;
    }

    const promises = needLoad.map(work =>
      loadImageSize(work.image)
        .then(size => {
          if (!cancelled) sizesMap[work.id] = size;
        })
        .catch(() => {
          if (!cancelled) sizesMap[work.id] = { width: 300, height: 225 };
        })
    );

    works.forEach(w => {
      if (preloaded[w.id] !== undefined) {
        const ratio = preloaded[w.id];
        sizesMap[w.id] = { width: 300, height: Math.round(300 * ratio) };
      }
    });

    setImageSizes({ ...sizesMap });

    Promise.all(promises).then(() => {
      if (!cancelled) {
        setImageSizes({ ...sizesMap });
        setAllLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [works]);

  const columns = useMemo(() => {
    const cols: [Work[], Work[], Work[]] = [[], [], []];
    const heights = [0, 0, 0];
    works.forEach(work => {
      const shortestCol = heights.indexOf(Math.min(...heights));
      cols[shortestCol].push(work);

      let aspectRatio = 0.75;
      const size = imageSizes[work.id];
      if (size && size.width > 0) {
        aspectRatio = size.height / size.width;
      }

      heights[shortestCol] += 300 * aspectRatio + 20;
    });
    return cols;
  }, [works, imageSizes]);

  const handleDelete = async (e: React.MouseEvent, workId: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这件作品吗？此操作无法撤销。')) return;

    setDeletingId(workId);
    try {
      const result = await removeArtistWork(artist.id, workId);
      if (result.success && result.artist && onWorksUpdated) {
        onWorksUpdated(result.artist);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (works.length === 0) {
    return (
      <div className="text-center py-16 bg-graphite border border-white/5">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <ZoomIn className="w-10 h-10 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-2">暂无作品</p>
        {isOwner && (
          <p className="text-gray-500 text-sm">点击上方「上传作品」按钮添加您的第一件作品</p>
        )}
      </div>
    );
  }

  const getPaddingTop = (workId: string): string => {
    const size = imageSizes[workId];
    if (size && size.width > 0) {
      return `${(size.height / size.width) * 100}%`;
    }
    return '75%';
  };

  return (
    <div className="relative">
      {!allLoaded && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="w-5 h-5 text-blood animate-spin mr-2" />
          <span className="text-gray-400 text-sm">正在排列作品...</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column, ci) => (
          <div key={ci} className="flex flex-col gap-4">
            {column.map(work => {
              const globalIndex = works.findIndex(w => w.id === work.id);
              const isDeleting = deletingId === work.id;
              const isHovered = hoveredId === work.id;
              const paddingTop = getPaddingTop(work.id);
              const hasSize = !!imageSizes[work.id];

              return (
                <div
                  key={work.id}
                  className={`group relative overflow-hidden bg-graphite border border-white/5 hover:border-blood/40 transition-all duration-300 cursor-pointer ${!hasSize ? 'animate-pulse' : ''}`}
                  onClick={() => onWorkClick(globalIndex)}
                  onMouseEnter={() => setHoveredId(work.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative overflow-hidden" style={{ paddingTop }}>
                    {!hasSize && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-700" />
                      </div>
                    )}
                    <img
                      src={work.image}
                      alt={work.title}
                      loading="lazy"
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${hasSize ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        img.style.opacity = '1';
                        if (!imageSizes[work.id]) {
                          setImageSizes(prev => ({
                            ...prev,
                            [work.id]: { width: img.naturalWidth, height: img.naturalHeight }
                          }));
                        }
                      }}
                    />

                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    <div className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                      {isOwner && (
                        <button
                          onClick={(e) => handleDelete(e, work.id)}
                          disabled={isDeleting}
                          className="p-2 bg-black/60 text-white/80 hover:bg-blood hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onWorkClick(globalIndex);
                        }}
                        className="p-2 bg-black/60 text-white/80 hover:bg-blood hover:text-white transition-colors"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2.5 py-0.5 text-xs bg-blood/85 text-white">
                          {work.style}
                        </span>
                      </div>
                      <h3 className="text-white font-medium text-base mb-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-gray-300/90 text-sm line-clamp-2 leading-relaxed">
                          {work.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
