import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
  User,
  Loader2,
  RefreshCw,
  Inbox,
  Palette,
} from 'lucide-react';
import type { Notification, Artist } from '../../shared/types';
import { Navbar } from '../components/Navbar';
import { useNotificationStore } from '../store/useNotificationStore';
import { getArtists } from '../lib/api';

type IdentityMode = 'none' | 'user' | 'artist';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'booking_created':
      return <Calendar className="w-5 h-5 text-amber-400" />;
    case 'booking_cancelled':
      return <CalendarX className="w-5 h-5 text-gray-400" />;
    case 'booking_status_changed':
    default:
      return <CalendarCheck className="w-5 h-5 text-blue-400" />;
  }
}

export function Notifications() {
  const navigate = useNavigate();
  const [identityMode, setIdentityMode] = useState<IdentityMode>('none');
  const [contact, setContact] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const {
    notifications,
    unreadCount,
    loading,
    contact: storedContact,
    artistId: storedArtistId,
    markAsRead,
    markAllAsRead,
    setUser,
    clearUser,
    fetchNotifications,
  } = useNotificationStore();

  useEffect(() => {
    if (storedContact) {
      setIdentityMode('user');
      setContact(storedContact);
      setSearchContact(storedContact);
    } else if (storedArtistId) {
      setIdentityMode('artist');
      fetchArtists();
    }
  }, [storedContact, storedArtistId]);

  const fetchArtists = async () => {
    const data = await getArtists();
    setArtists(data);
    if (storedArtistId) {
      const artist = data.find(a => a.id === storedArtistId);
      if (artist) setSelectedArtist(artist);
    }
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    const trimmedContact = contact.trim();
    setSearchContact(trimmedContact);
    setIdentityMode('user');
    setSelectedArtist(null);
    setUser(trimmedContact, undefined);
  };

  const handleArtistSelect = async (artist: Artist) => {
    setSelectedArtist(artist);
    setIdentityMode('artist');
    setContact('');
    setSearchContact('');
    setUser(undefined, artist.id);
  };

  const handleSwitchIdentity = () => {
    setIdentityMode('none');
    setContact('');
    setSearchContact('');
    setSelectedArtist(null);
    clearUser();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    navigate(`/my-bookings`);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-white mb-2">消息通知</h1>
              <p className="text-gray-400">查看您的预约状态变更和消息提醒</p>
            </div>
            {identityMode !== 'none' && unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                全部已读
              </button>
            )}
          </div>

          {identityMode === 'none' && (
            <div className="space-y-8">
              <div className="bg-graphite border border-white/5 p-6 md:p-8">
                <h2 className="text-white font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blood" />
                  我是用户
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  输入预约时填写的联系方式查看您的预约通知
                </p>
                <form onSubmit={handleUserSearch}>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="输入您的联系方式（手机号/微信号）"
                        className="w-full pl-12 pr-4 py-3 bg-ink-200 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blood/50 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary px-6 py-3 flex items-center gap-2"
                    >
                      <Bell className="w-5 h-5" />
                      查看通知
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-graphite border border-white/5 p-6 md:p-8">
                <h2 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blood" />
                  我是纹身师
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  选择您的身份查看预约相关通知
                </p>
                {artists.length === 0 ? (
                  <button
                    onClick={fetchArtists}
                    className="flex items-center gap-2 px-4 py-2 text-blood hover:text-blood-light text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    加载纹身师列表
                  </button>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {artists.map(artist => (
                      <button
                        key={artist.id}
                        onClick={() => handleArtistSelect(artist)}
                        className="flex items-center gap-4 p-4 bg-ink-200 border border-white/5 hover:border-blood/50 transition-all text-left group"
                      >
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gold/40"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-blood transition-colors">
                            {artist.name}
                          </h3>
                          <p className="text-gray-500 text-sm truncate">{artist.city}</p>
                        </div>
                        <Bell className="w-5 h-5 text-gray-500 group-hover:text-blood transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {identityMode !== 'none' && (
            <div>
              <div className="flex items-center justify-between mb-6 p-4 bg-graphite border border-white/5">
                <div className="flex items-center gap-3">
                  {identityMode === 'user' ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blood/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blood" />
                      </div>
                      <div>
                        <p className="text-white font-medium">用户模式</p>
                        <p className="text-gray-400 text-sm">联系方式：{searchContact}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedArtist && (
                        <>
                          <img
                            src={selectedArtist.avatar}
                            alt={selectedArtist.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gold/40"
                          />
                          <div>
                            <p className="text-white font-medium">{selectedArtist.name}</p>
                            <p className="text-gray-400 text-sm">纹身师后台模式</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifications}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    title="刷新"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleSwitchIdentity}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    切换身份
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blood animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16 bg-graphite border border-white/5">
                  <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">暂无通知消息</p>
                  <p className="text-gray-500 text-sm">
                    当您的预约状态发生变化时，会在这里收到通知
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreadNotifications.length > 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <span className="text-xs text-blood font-medium">未读消息 ({unreadCount})</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  )}

                  {unreadNotifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="relative bg-graphite border border-blood/20 p-5 cursor-pointer hover:bg-ink-200 transition-colors group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blood" />
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="text-white font-medium">{notification.title}</h3>
                            <span className="text-gray-500 text-xs flex-shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{notification.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {readNotifications.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 py-2 mt-6">
                        <span className="text-xs text-gray-500 font-medium">已读消息</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>

                      {readNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className="bg-graphite/50 border border-white/5 p-5 hover:bg-ink-200 transition-colors group"
                        >
                          <div className="flex gap-4 opacity-70">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <h3 className="text-white font-medium">{notification.title}</h3>
                                <span className="text-gray-500 text-xs flex-shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm">{notification.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
