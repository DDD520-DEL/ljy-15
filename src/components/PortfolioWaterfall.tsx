import { useMemo, useState } from 'react';
import { Trash2, ZoomIn } from 'lucide-react';
import type { Work, Artist } from '../../shared/types';
import { removeArtistWork } from '../lib/api';
import { Loader2 } from 'lucide-react';

interface Props {
  works: Work[];
  artist: Artist;
  isOwner?: boolean;
  onWorkClick: (index: number) => void;
  onWorksUpdated?: (artist: Artist) => void;
}

export function PortfolioWaterfall({ works, artist, isOwner, onWorkClick, onWorksUpdated }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const cols: [Work[], Work[], Work[]] = [[], [], []];
    const heights = [0, 0, 0];
    works.forEach(work => {
      const shortestCol = heights.indexOf(Math.min(...heights));
      cols[shortestCol].push(work);
      const aspectRatio = work.image.includes('/600/')
        ? parseInt(work.image.split('/').pop() || '400') / 600
        : 0.75;
      heights[shortestCol] += 300 * aspectRatio + 20;
    });
    return cols;
  }, [works]);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {columns.map((column, ci) => (
        <div key={ci} className="flex flex-col gap-4">
          {column.map(work => {
            const globalIndex = works.findIndex(w => w.id === work.id);
            const isDeleting = deletingId === work.id;
            const isHovered = hoveredId === work.id;

            return (
              <div
                key={work.id}
                className="group relative overflow-hidden bg-graphite border border-white/5 hover:border-blood/40 transition-all duration-300 cursor-pointer"
                onClick={() => onWorkClick(globalIndex)}
                onMouseEnter={() => setHoveredId(work.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
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
  );
}
