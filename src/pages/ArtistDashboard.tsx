import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Loader2, RefreshCw, Bell, CheckCircle2, BarChart3, Settings, Trash2, Sparkles, Save } from 'lucide-react';
import type { Artist, BookingStatus, PriceInfo } from '../../shared/types';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_FLOW } from '../../shared/types';
import { updateBookingStatus, getArtists, getPriceInfos, upsertPriceCalendarEntry, batchUpsertPriceCalendar, deletePriceCalendarEntry, deletePriceCalendarRange } from '../lib/api';
import { useRealtimeBookings } from '../hooks/useRealtimeBookings';
import { Navbar } from '../components/Navbar';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { BookingStatusTimeline } from '../components/BookingStatusTimeline';
import { useNotificationStore } from '../store/useNotificationStore';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function getNextStatus(current: BookingStatus): BookingStatus | null {
  const index = BOOKING_STATUS_FLOW.indexOf(current);
  if (index === -1 || index === BOOKING_STATUS_FLOW.length - 1) {
    return null;
  }
  return BOOKING_STATUS_FLOW[index + 1];
}

function canCancel(status: BookingStatus): boolean {
  return status !== 'completed' && status !== 'cancelled';
}

type TabType = 'bookings' | 'price-calendar';

function getCalendarMonthRange(): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 59);
  return {
    start: today.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function ArtistDashboard() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setUser: setNotificationUser, clearUser: clearNotificationUser } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [priceInfos, setPriceInfos] = useState<PriceInfo[]>([]);
  const [loadingPriceCalendar, setLoadingPriceCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceNote, setPriceNote] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { bookings, loading, hasUpdates, lastUpdated, refresh, dismissUpdates } = useRealtimeBookings({
    artistId: selectedArtist?.id,
    status: filterStatus === 'all' ? undefined : filterStatus,
    enabled: !!selectedArtist,
    pollInterval: 2000,
  });

  useEffect(() => {
    if (selectedArtist) {
      setNotificationUser(undefined, selectedArtist.id);
    }
    return () => {
      if (selectedArtist) {
        clearNotificationUser();
      }
    };
  }, [selectedArtist?.id]);

  const fetchArtists = async () => {
    const data = await getArtists();
    setArtists(data);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchPriceCalendar = async (artistId: string) => {
    setLoadingPriceCalendar(true);
    try {
      const range = getCalendarMonthRange();
      const data = await getPriceInfos(artistId, range.start, range.end);
      setPriceInfos(data);
    } catch {
      setPriceInfos([]);
    } finally {
      setLoadingPriceCalendar(false);
    }
  };

  useEffect(() => {
    if (selectedArtist && activeTab === 'price-calendar') {
      fetchPriceCalendar(selectedArtist.id);
    }
  }, [selectedArtist, activeTab, currentMonth]);

  const toggleDateSelection = (date: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(date)) {
      newSelected.delete(date);
    } else {
      newSelected.add(date);
    }
    setSelectedDates(newSelected);

    if (newSelected.size === 1) {
      const priceInfo = priceInfos.find(p => p.date === date);
      if (priceInfo && priceInfo.isCustomPrice) {
        setPriceMin(String(priceInfo.priceMin));
        setPriceMax(String(priceInfo.priceMax));
        setPriceNote(priceInfo.note || '');
      }
    }
  };

  const handleSavePrices = async () => {
    if (!selectedArtist || selectedDates.size === 0) return;

    const min = Number(priceMin);
    const max = Number(priceMax);

    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      alert('请输入有效的价格范围');
      return;
    }

    setSavingPrice(true);
    try {
      const datesArray = Array.from(selectedDates).sort();
      if (datesArray.length === 1) {
        await upsertPriceCalendarEntry(selectedArtist.id, datesArray[0], min, max, priceNote || undefined);
      } else {
        await batchUpsertPriceCalendar(
          selectedArtist.id,
          datesArray[0],
          datesArray[datesArray.length - 1],
          min,
          max,
          priceNote || undefined
        );
      }
      setSelectedDates(new Set());
      setPriceMin('');
      setPriceMax('');
      setPriceNote('');
      await fetchPriceCalendar(selectedArtist.id);
    } catch {
      alert('保存失败，请稍后重试');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleDeletePrices = async () => {
    if (!selectedArtist || selectedDates.size === 0) return;

    if (!confirm(`确定要删除选中的 ${selectedDates.size} 天的价格设置吗？将恢复为默认价格。`)) {
      return;
    }

    setSavingPrice(true);
    try {
      const datesArray = Array.from(selectedDates).sort();
      if (datesArray.length === 1) {
        await deletePriceCalendarEntry(selectedArtist.id, datesArray[0]);
      } else {
        await deletePriceCalendarRange(selectedArtist.id, datesArray[0], datesArray[datesArray.length - 1]);
      }
      setSelectedDates(new Set());
      setPriceMin('');
      setPriceMax('');
      setPriceNote('');
      await fetchPriceCalendar(selectedArtist.id);
    } catch {
      alert('删除失败，请稍后重试');
    } finally {
      setSavingPrice(false);
    }
  };

  useEffect(() => {
    if (hasUpdates && bookings.length > 0) {
      const updatedBookingIds = bookings
        .filter(b => b.statusUpdatedAt)
        .sort((a, b) => {
          const aTime = new Date(b.statusUpdatedAt || b.createdAt).getTime();
          const bTime = new Date(a.statusUpdatedAt || a.createdAt).getTime();
          return aTime - bTime;
        });

      if (updatedBookingIds.length > 0) {
        const latestId = updatedBookingIds[0].id;
        setHighlightedBookingId(latestId);

        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedBookingId(null);
          dismissUpdates();
        }, 3000);
      }
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [hasUpdates, bookings, dismissUpdates]);

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      refresh();
    }
    setUpdatingId(null);
  };

  const filteredBookings = bookings;
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const calendarDays = useMemo(() => {
    if (!selectedArtist) return [];

    const priceInfoMap = new Map(priceInfos.map(p => [p.date, p]));
    const days: { date: string; day: number; isCurrentMonth: boolean; priceInfo?: PriceInfo; isSelected: boolean; isToday: boolean }[] = [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date().toISOString().split('T')[0];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: false,
        priceInfo: priceInfoMap.get(dateStr),
        isSelected: selectedDates.has(dateStr),
        isToday: dateStr === today,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        priceInfo: priceInfoMap.get(dateStr),
        isSelected: selectedDates.has(dateStr),
        isToday: dateStr === today,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        priceInfo: priceInfoMap.get(dateStr),
        isSelected: selectedDates.has(dateStr),
        isToday: dateStr === today,
      });
    }

    return days;
  }, [currentMonth, priceInfos, selectedDates, selectedArtist]);

  const monthLabel = useMemo(() => {
    return `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
  }, [currentMonth]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  if (!selectedArtist) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => navigate('/artist-analytics')}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                数据看板
              </button>
            </div>
            <h1 className="font-display text-3xl text-white mb-2">艺术家后台</h1>
            <p className="text-gray-400 mb-8">选择您的身份进入后台管理预约</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artists.map(artist => (
                <button
                  key={artist.id}
                  onClick={() => setSelectedArtist(artist)}
                  className="flex items-center gap-4 p-4 bg-graphite border border-white/5 hover:border-blood/50 transition-all text-left group"
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gold/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium group-hover:text-blood transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-gray-500 text-sm truncate">{artist.city}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artist.styles.slice(0, 2).map(s => (
                        <span
                          key={s}
                          className="text-xs text-blood/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-500 group-hover:text-blood transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedArtist(null)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-2xl text-white">预约管理后台</h1>
              <p className="text-gray-400 text-sm">
                {selectedArtist.name} 的预约订单
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm justify-end">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-400">实时更新中</span>
              </div>
              <p className="text-gray-600 text-xs mt-1">
                最后更新：{formatTime(lastUpdated)}
              </p>
            </div>
            <button
              onClick={() => navigate('/artist-analytics')}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              数据看板
            </button>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {hasUpdates && (
          <div className="mb-6 p-4 bg-blood/20 border border-blood/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blood animate-bounce" />
              <span className="text-white">有新的预约或状态更新</span>
            </div>
            <button
              onClick={dismissUpdates}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              知道了
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-graphite border border-white/5 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-500 text-sm">全部预约</div>
          </div>
          <div className="bg-graphite border border-amber-500/30 p-4">
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-gray-500 text-sm">待确认</div>
          </div>
          <div className="bg-graphite border border-blue-500/30 p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.confirmed}</div>
            <div className="text-gray-500 text-sm">已确认</div>
          </div>
          <div className="bg-graphite border border-purple-500/30 p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.inProgress}</div>
            <div className="text-gray-500 text-sm">进行中</div>
          </div>
          <div className="bg-graphite border border-green-500/30 p-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-gray-500 text-sm">已完成</div>
          </div>
          <div className="bg-graphite border border-gray-500/30 p-4">
            <div className="text-2xl font-bold text-gray-400">{stats.cancelled}</div>
            <div className="text-gray-500 text-sm">已取消</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-sm border transition-colors flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-blood border-blood text-white'
                : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            预约管理
          </button>
          <button
            onClick={() => setActiveTab('price-calendar')}
            className={`px-4 py-2 text-sm border transition-colors flex items-center gap-2 ${
              activeTab === 'price-calendar'
                ? 'bg-gold/20 border-gold/50 text-gold'
                : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            价格日历
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  filterStatus === status
                    ? 'bg-blood border-blood text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {status === 'all' ? '全部' : BOOKING_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blood animate-spin" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-graphite border border-white/5">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">暂无预约订单</p>
                <button
                  onClick={refresh}
                  className="mt-4 px-4 py-2 text-blood hover:text-blood-light text-sm flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => {
                  const nextStatus = getNextStatus(booking.status);
                  const canCancelBooking = canCancel(booking.status);
                  const isUpdating = updatingId === booking.id;
                  const isHighlighted = highlightedBookingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className={`bg-graphite border p-5 md:p-6 transition-all duration-500 ${
                        isHighlighted
                          ? 'border-blood/50 shadow-lg shadow-blood/20'
                          : 'border-white/5'
                      }`}
                    >
                      {isHighlighted && (
                        <div className="flex items-center gap-2 mb-3 text-blood text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>状态已更新</span>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{booking.style}</h3>
                            <BookingStatusBadge status={booking.status} size="sm" />
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            尺寸/位置：{booking.size}
                          </p>
                          <p className="text-gray-500 text-sm">
                            预算：¥{booking.budgetMin} - ¥{booking.budgetMax}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">
                            联系方式
                          </p>
                          <p className="text-white font-mono">{booking.contact}</p>
                        </div>
                      </div>

                      {booking.note && (
                        <div className="mb-4 p-3 bg-ink-200 border border-white/5">
                          <p className="text-gray-400 text-sm">
                            <span className="text-gray-500">备注：</span>
                            {booking.note}
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <BookingStatusTimeline currentStatus={booking.status} />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
                        <div className="text-gray-500 text-xs">
                          提交时间：{formatDate(booking.createdAt)}
                          {booking.statusUpdatedAt && (
                            <>
                              <span className="mx-2">|</span>
                              状态更新：{formatDate(booking.statusUpdatedAt)}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {nextStatus && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, nextStatus)}
                              disabled={isUpdating}
                              className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {BOOKING_STATUS_LABELS[nextStatus]}
                            </button>
                          )}
                          {canCancelBooking && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              disabled={isUpdating}
                              className="btn-outline text-sm px-4 py-2 flex items-center gap-2 text-gray-400 hover:text-blood hover:border-blood disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              取消预约
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'price-calendar' && selectedArtist && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-graphite border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                      ←
                    </button>
                    <h3 className="font-display text-xl text-white">{monthLabel}</h3>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={() => selectedArtist && fetchPriceCalendar(selectedArtist.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPriceCalendar ? 'animate-spin' : ''}`} />
                    刷新
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gold/30 border border-gold/50"></span>
                    <span className="text-gray-400">特殊定价</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white/5"></span>
                    <span className="text-gray-400">默认价格</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blood/50 border border-blood"></span>
                    <span className="text-gray-400">已选中</span>
                  </div>
                </div>

                {loadingPriceCalendar ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map(day => (
                        <div key={day} className="text-center text-gray-500 text-xs py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleDateSelection(day.date)}
                          className={`
                            relative p-2 min-h-[80px] text-left border transition-all
                            ${day.isSelected ? 'border-blood bg-blood/20' : 'border-white/5 hover:border-white/20'}
                            ${!day.isCurrentMonth ? 'opacity-40' : ''}
                            ${day.isToday ? 'ring-2 ring-gold/50' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${day.isToday ? 'text-gold font-bold' : day.isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                              {day.day}
                            </span>
                            {day.priceInfo?.isCustomPrice && (
                              <Sparkles className="w-3 h-3 text-gold" />
                            )}
                          </div>
                          {day.priceInfo && (
                            <div className="text-xs">
                              <p className={day.priceInfo.isCustomPrice ? 'text-gold' : 'text-gray-500'}>
                                ¥{day.priceInfo.priceMin}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-graphite border border-white/5 p-6 sticky top-8">
                <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold" />
                  价格设置
                </h3>

                <div className="mb-4 p-3 bg-ink-300/50 border border-white/5 rounded">
                  <p className="text-gray-400 text-xs mb-1">默认价格</p>
                  <p className="text-white font-medium">
                    ¥{selectedArtist.priceMin} - ¥{selectedArtist.priceMax} / {selectedArtist.priceUnit}
                  </p>
                </div>

                {selectedDates.size > 0 && (
                  <div className="mb-4 p-3 bg-blood/10 border border-blood/30 rounded">
                    <p className="text-blood text-sm">
                      已选择 {selectedDates.size} 天
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {Array.from(selectedDates).sort().slice(0, 3).join('、')}
                      {selectedDates.size > 3 && ` 等 ${selectedDates.size} 天`}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1.5">
                      价格下限（元）
                    </label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="输入最低价格"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1.5">
                      价格上限（元）
                    </label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="输入最高价格"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1.5">
                      备注（选填）
                    </label>
                    <textarea
                      value={priceNote}
                      onChange={(e) => setPriceNote(e.target.value)}
                      placeholder="例如：节假日加价、周末特惠等"
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSavePrices}
                      disabled={selectedDates.size === 0 || !priceMin || !priceMax || savingPrice}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingPrice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存价格
                    </button>
                    <button
                      onClick={handleDeletePrices}
                      disabled={selectedDates.size === 0 || savingPrice}
                      className="btn-outline flex items-center justify-center gap-2 text-gray-400 hover:text-blood hover:border-blood disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-gray-500 text-xs">
                    提示：点击日历中的日期可以多选，选中后设置价格将应用到所有选中日期。删除价格将恢复为默认价格。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
