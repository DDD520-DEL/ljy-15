import { Link, useLocation } from 'react-router-dom';
import { Droplet, Heart, Search } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

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
              to="/favorites"
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-1.5 ${
                location.pathname === '/favorites' ? 'text-blood' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              我的收藏
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/favorites"
              className="md:hidden p-2 text-gray-400 hover:text-blood transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
