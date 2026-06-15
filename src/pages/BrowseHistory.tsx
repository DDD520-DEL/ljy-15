import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowLeft, Trash2, MapPin, DollarSign, Star, Clock, AlertTriangle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useStore } from '../store/useStore';
import type { BrowseHistoryItem } from '../../shared/types';

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
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

function formatBrowseTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}月${day}日 ${hour}:${minute}`;
  }
  return `${date.getFullYear()}年${month}月${day}日`;
}

export function BrowseHistory() {
  const { browseHistory, browseHistoryLoading, fetchBrowseHistory, removeBrowseHistoryItem, clearAllBrowseHistory } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchBrowseHistory();
  }, [fetchBrowseHistory]);

  const handleRemove = (artistId: string) => {
    removeBrowseHistoryItem(artistId);
  };

  const handleClearAll = () => {
    clearAllBrowseHistory();
    setShowClearConfirm(false);
  };

  const groupedByDate = browseHistory.reduce((groups: Record<string, BrowseHistoryItem[]>, item) => {
    const date = new Date(item.browsedAt);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {});

  const formatDateLabel = (dateKey: string): string => {
    const date = new Date(dateKey);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-blood" />
            <div>
              <h1 className="font-display text-3xl text-white">浏览历史</h1>
              <p className="text-gray-500 text-sm">
                共 {browseHistory.length} 条浏览记录
              </p>
            </div>
          </div>

          {browseHistory.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              清空全部
            </button>
          )}
        </div>

        {browseHistoryLoading ? (
          <div className="bg-graphite/30 border border-white/5 py-20 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blood border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : browseHistory.length === 0 ? (
          <div className="bg-graphite/30 border border-white/5 py-20 text-center">
            <History className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-gray-400 text-lg mb-2">暂无浏览记录</h3>
            <p className="text-gray-600 text-sm mb-6">浏览作品墙，发现你喜欢的纹身师</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              去探索
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(dateKey => (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400 text-sm font-medium">
                    {formatDateLabel(dateKey)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    ({groupedByDate[dateKey].length} 位)
                  </span>
                </div>

                <div className="space-y-3">
                  {groupedByDate[dateKey].map(item => (
                    <div
                      key={item.artist.id}
                      className="card p-4 flex items-center gap-4 group hover:border-blood/30 transition-colors"
                    >
                      <Link
                        to={`/artist/${item.artist.id}`}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        <img
                          src={item.artist.avatar}
                          alt={item.artist.name}
                          className="w-16 h-16 rounded-full border-2 border-gold/30 object-cover flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold group-hover:text-blood transition-colors truncate">
                              {item.artist.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-gray-400 text-sm mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.artist.city}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-gold" />
                              <span className="text-gold">
                                ¥{item.artist.priceMin}-{item.artist.priceMax}
                              </span>
                              <span className="text-gray-500 text-xs">/{item.artist.priceUnit}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <StarRating rating={item.artist.avgRating} size={12} />
                              <span className="text-gold text-xs font-medium">{item.artist.avgRating}</span>
                              <span className="text-gray-500 text-xs">({item.artist.reviewCount}条评价)</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.artist.styles.slice(0, 3).map(style => (
                                <span
                                  key={style}
                                  className="px-2 py-0.5 text-xs bg-blood/20 text-blood-light rounded"
                                >
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-gray-500 text-sm">
                          {formatBrowseTime(item.browsedAt)}
                        </span>
                        <button
                          onClick={() => handleRemove(item.artist.id)}
                          className="p-2 text-gray-500 hover:text-blood hover:bg-blood/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-ink-200 border border-white/10 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white text-lg font-semibold">确认清空浏览历史？</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              此操作将删除所有浏览记录，且无法恢复。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-outline text-sm"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="btn-primary bg-blood hover:bg-blood-light text-sm"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
