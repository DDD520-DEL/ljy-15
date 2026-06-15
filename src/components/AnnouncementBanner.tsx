import { useEffect, useState, useCallback } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveAnnouncements } from '../lib/api';
import type { Announcement } from '../../shared/types';

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % announcements.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handlePrev = () => {
    if (announcements.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    if (announcements.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
      setIsTransitioning(false);
    }, 300);
  };

  if (announcements.length === 0 || dismissed) return null;

  const current = announcements[currentIndex];
  const priorityBg = current.priority === 'high'
    ? 'bg-red-900/60 border-b border-red-500/30'
    : current.priority === 'normal'
      ? 'bg-blood/20 border-b border-blood/30'
      : 'bg-gray-800/60 border-b border-gray-600/30';

  return (
    <div className={`sticky top-0 z-50 ${priorityBg} backdrop-blur-sm transition-all duration-300`}>
      <div className="container">
        <div className="flex items-center h-10 gap-3">
          <Megaphone className={`w-4 h-4 shrink-0 ${
            current.priority === 'high' ? 'text-red-400' : 'text-blood-light'
          }`} />

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
              <span className="text-sm text-white/90 truncate block">
                <span className={`font-medium mr-2 ${
                  current.priority === 'high' ? 'text-red-300' : 'text-blood-light'
                }`}>
                  [{current.title}]
                </span>
                {current.content}
              </span>
            </div>
          </div>

          {announcements.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrev}
                className="p-0.5 text-white/40 hover:text-white/80 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-white/40 tabular-nums min-w-[2rem] text-center">
                {currentIndex + 1}/{announcements.length}
              </span>
              <button
                onClick={handleNext}
                className="p-0.5 text-white/40 hover:text-white/80 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 text-white/30 hover:text-white/70 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
