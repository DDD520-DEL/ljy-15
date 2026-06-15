import { Link, useLocation } from 'react-router-dom';
import { Droplet, Heart, Calendar, Palette, Bell, User, HelpCircle, UserPlus, History } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';

export function Navbar() {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  return (
    <nav className="sticky top-0 z-50 bg-ink-300/95 backdrop-blur-sm border-b border-white/5">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Droplet className="w-7 h-7 text-blood group-hover:text-blood-light transition-colors" />
            <span className="font-display text-xl font-semibold tracking-wider text-white">
              INK<span className="text-blood">MATCH</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm transition-colors ${
                location.pathname === '/' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              作品墙
            </Link>
            <Link
              to="/my-bookings"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/my-bookings' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              我的预约
            </Link>
            <Link
              to="/favorites"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/favorites' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              我的收藏
            </Link>
            <Link
              to="/browse-history"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/browse-history' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              浏览历史
            </Link>
            <Link
              to="/artist-dashboard"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ml-2 ${
                location.pathname === '/artist-dashboard' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              艺术家后台
            </Link>
            <Link
              to="/artist-application"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/artist-application' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              艺术家入驻
            </Link>
            <Link
              to="/profile"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/profile' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              个人中心
            </Link>
            <Link
              to="/help"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/help' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              帮助中心
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/notifications"
              className={`relative p-2 transition-colors ${
                location.pathname === '/notifications'
                  ? 'text-blood'
                  : 'text-gray-400 hover:text-blood'
              }`}
              title="消息通知"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-blood text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/my-bookings"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="我的预约"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <Link
              to="/favorites"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="我的收藏"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link
              to="/browse-history"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="浏览历史"
            >
              <History className="w-5 h-5" />
            </Link>
            <Link
              to="/artist-dashboard"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="艺术家后台"
            >
              <Palette className="w-5 h-5" />
            </Link>
            <Link
              to="/artist-application"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="艺术家入驻"
            >
              <UserPlus className="w-5 h-5" />
            </Link>
            <Link
              to="/profile"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
              title="个人中心"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/help"
              className="p-2 text-gray-400 hover:text-blood transition-colors"
              title="帮助中心"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
