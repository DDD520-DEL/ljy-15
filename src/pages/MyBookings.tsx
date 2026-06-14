import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Clock, Loader2, User } from 'lucide-react';
import type { Booking, Artist, BookingStatus } from '../../shared/types';
import { BOOKING_STATUS_LABELS } from '../../shared/types';
import { getBookings, getArtist } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { BookingStatusTimeline } from '../components/BookingStatusTimeline';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function MyBookings() {
  const [contact, setContact] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artists, setArtists] = useState<Record<string, Artist | null>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setSearchContact(contact.trim());
    setLoading(true);
    setSearched(true);

    const data = await getBookings(contact.trim());
    setBookings(data);

    const artistMap: Record<string, Artist | null> = {};
    for (const booking of data) {
      if (!artistMap[booking.artistId]) {
        const artist = await getArtist(booking.artistId);
        artistMap[booking.artistId] = artist;
      }
    }
    setArtists(artistMap);

    setLoading(false);
  };

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

        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl text-white mb-2">我的预约</h1>
          <p className="text-gray-400 mb-8">查询您的纹身预约订单状态</p>

          <form onSubmit={handleSearch} className="mb-10">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="输入您的联系方式（手机号/微信号）"
                  className="w-full pl-12 pr-4 py-3 bg-graphite border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blood/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                查询
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              提示：输入预约时填写的联系方式即可查询所有相关预约
            </p>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blood animate-spin" />
            </div>
          ) : searched && bookings.length === 0 ? (
            <div className="text-center py-16 bg-graphite border border-white/5">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">暂无预约记录</p>
              <p className="text-gray-500 text-sm">
                未找到联系方式「{searchContact}」相关的预约
              </p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-medium">
                  共 {bookings.length} 条预约记录
                </h2>
              </div>

              {bookings.map(booking => {
                const artist = artists[booking.artistId];

                return (
                  <div
                    key={booking.id}
                    className="bg-graphite border border-white/5 p-5 md:p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4 mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-white font-medium">
                            {booking.style}
                          </h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          {artist && (
                            <span className="flex items-center gap-1">
                              <img
                                src={artist.avatar}
                                alt={artist.name}
                                className="w-5 h-5 rounded-full"
                              />
                              {artist.name}
                            </span>
                          )}
                          <span>·</span>
                          <span>预算 ¥{booking.budgetMin} - ¥{booking.budgetMax}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">预约编号</p>
                        <p className="text-gray-400 font-mono text-sm">{booking.id}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-gray-400 text-sm mb-1">
                        <span className="text-gray-500">尺寸/位置：</span>
                        {booking.size}
                      </p>
                      {booking.note && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500">备注：</span>
                          {booking.note}
                        </p>
                      )}
                    </div>

                    <div className="mb-5">
                      <p className="text-gray-500 text-sm mb-3">预约进度</p>
                      <BookingStatusTimeline currentStatus={booking.status} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-white/5">
                      <div className="text-gray-500 text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        提交时间：{formatDate(booking.createdAt)}
                      </div>
                      {booking.statusUpdatedAt && (
                        <div className="text-gray-500 text-xs">
                          状态更新：{formatDate(booking.statusUpdatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
