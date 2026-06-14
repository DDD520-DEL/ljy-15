import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Star, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import type { Artist, ArtistAnalytics as ArtistAnalyticsType } from '../../shared/types';
import { getArtists, getArtistAnalytics } from '../lib/api';
import { Navbar } from '../components/Navbar';

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { rating: number } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-graphite border border-white/10 p-3 rounded">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-white font-medium">
          {payload[0].name}: <span className="text-blood">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const RatingTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-graphite border border-white/10 p-3 rounded">
        <p className="text-white font-medium">
          {payload[0].payload.rating} 星评价: <span className="text-blood">{payload[0].value} 条</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ArtistAnalytics() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [analytics, setAnalytics] = useState<ArtistAnalyticsType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchArtists = async () => {
    const data = await getArtists();
    setArtists(data);
  };

  const fetchAnalytics = async (artistId: string) => {
    setLoading(true);
    const data = await getArtistAnalytics(artistId);
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      fetchAnalytics(selectedArtist.id);
    }
  }, [selectedArtist]);

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
            <h1 className="font-display text-3xl text-white mb-2">数据看板</h1>
            <p className="text-gray-400 mb-8">选择您的身份查看经营数据</p>

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
                  <BarChart3 className="w-5 h-5 text-gray-500 group-hover:text-blood transition-colors" />
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
              <h1 className="font-display text-2xl text-white">数据看板</h1>
              <p className="text-gray-400 text-sm">
                {selectedArtist.name} 的经营数据分析
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/artist-dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              预约管理
            </button>
            <button
              onClick={() => selectedArtist && fetchAnalytics(selectedArtist.id)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blood animate-spin" />
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-graphite border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(analytics.totalRevenue)}
                </div>
                <div className="text-gray-500 text-sm">累计总收入</div>
              </div>

              <div className="bg-graphite border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {analytics.completedBookingsCount}
                </div>
                <div className="text-gray-500 text-sm">已完成预约</div>
              </div>

              <div className="bg-graphite border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(analytics.avgRevenuePerBooking)}
                </div>
                <div className="text-gray-500 text-sm">平均客单价</div>
              </div>

              <div className="bg-graphite border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {analytics.avgRating} <span className="text-lg text-gray-500">/ 5.0</span>
                </div>
                <div className="text-gray-500 text-sm">平均评分 ({analytics.totalReviews} 条)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-graphite border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white font-medium text-lg">近30天预约量趋势</h2>
                    <p className="text-gray-500 text-sm mt-1">每日新增预约数量变化</p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.bookingTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: '#ffffff20' }}
                        axisLine={{ stroke: '#ffffff20' }}
                        tickFormatter={(value) => formatDateShort(value)}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: '#ffffff20' }}
                        axisLine={{ stroke: '#ffffff20' }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="预约量"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#dc2626', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-graphite border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white font-medium text-lg">用户评分分布</h2>
                    <p className="text-gray-500 text-sm mt-1">各星级评价数量统计</p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.ratingDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="rating"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: '#ffffff20' }}
                        axisLine={{ stroke: '#ffffff20' }}
                        tickFormatter={(value) => `${value} 星`}
                      />
                      <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: '#ffffff20' }}
                        axisLine={{ stroke: '#ffffff20' }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<RatingTooltip />} />
                      <Bar dataKey="count" name="评价数" radius={[4, 4, 0, 0]}>
                        {analytics.ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RATING_COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const item = analytics.ratingDistribution.find(r => r.rating === rating);
                    const count = item?.count || 0;
                    const total = analytics.totalReviews || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <Star className={`w-3.5 h-3.5 ${rating <= 4 ? 'text-gray-600' : 'text-amber-400'} ${rating <= 3 ? '' : rating === 5 ? 'fill-amber-400' : ''}`} />
                          <span className="text-gray-400 text-sm">{rating}星</span>
                        </div>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percent}%`, backgroundColor: RATING_COLORS[rating - 1] }}
                          />
                        </div>
                        <span className="text-gray-500 text-sm w-12 text-right">{count}条</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-graphite border border-white/5">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">暂无统计数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
