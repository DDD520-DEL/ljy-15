import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { Work } from '../../shared/types';

interface Props {
  works: Work[];
  currentIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function WorkLightbox({ works, currentIndex, onClose, onPrev, onNext }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (currentIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, handleKeyDown]);

  if (currentIndex === null) return null;

  const work = works[currentIndex];
  if (!work) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {currentIndex + 1} / {works.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 md:px-20 min-h-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="flex-shrink-0 p-3 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full mx-2 md:mx-4"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          className="flex-1 flex items-center justify-center min-h-0 max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={work.image}
            alt={work.title}
            className="max-w-full max-h-[70vh] object-contain shadow-2xl"
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="flex-shrink-0 p-3 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full mx-2 md:mx-4"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="px-6 py-5 border-t border-white/10 bg-black/40">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-block px-3 py-1 text-sm bg-blood/85 text-white">
              {work.style}
            </span>
            {work.createdAt && (
              <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(work.createdAt)}
              </span>
            )}
          </div>
          <h3 className="text-white font-display text-2xl md:text-3xl mb-3">
            {work.title}
          </h3>
          {work.description && (
            <p className="text-gray-300 leading-relaxed max-w-2xl">
              {work.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
