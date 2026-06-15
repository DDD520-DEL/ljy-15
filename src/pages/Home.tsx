import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Navbar } from '../components/Navbar';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { StyleTagCloud } from '../components/StyleTagCloud';
import { FilterBar } from '../components/FilterBar';
import { Waterfall } from '../components/Waterfall';
import { RecommendSection } from '../components/RecommendSection';
import { Sparkles } from 'lucide-react';

export function Home() {
  const { artists, loading, filters, fetchArtists, fetchStyles, fetchFavorites } = useStore();

  useEffect(() => {
    fetchStyles();
    fetchFavorites();
  }, [fetchStyles, fetchFavorites]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists, filters.styles, filters.region, filters.priceMin, filters.priceMax, filters.keyword, filters.sortBy, filters.sortOrder]);

  return (
    <div className="min-h-screen">
      <AnnouncementBanner />
      <Navbar />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blood/30 bg-blood/5 text-blood text-xs mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>发现属于你的纹身艺术</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
              INK <span className="text-blood">MATCH</span>
              <br />
              <span className="text-2xl md:text-3xl font-normal text-gray-400 tracking-widest">
                纹身风格图谱 · 预约匹配平台
              </span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed">
              汇聚全国顶尖纹身师，按风格、地区、价位精准匹配。
              <br className="hidden md:block" />
              探索 Old School、水墨、写实、点刺等多种风格，找到最懂你的那一位艺术家。
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-10">
        <div className="text-center mb-8">
          <h2 className="font-display text-xl md:text-2xl text-white mb-3">探索风格</h2>
          <div className="divider max-w-xs mx-auto" />
        </div>
        <StyleTagCloud />
      </section>

      <section className="container pb-8">
        <FilterBar />
      </section>

      <RecommendSection />

      <section className="container pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl text-white">
            作品墙
            <span className="text-gray-500 text-sm font-normal ml-3">
              {artists.reduce((sum, a) => sum + a.works.length, 0)} 件作品
            </span>
          </h2>
        </div>
        <Waterfall artists={artists} loading={loading} />
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="container text-center">
          <div className="font-display text-lg text-gray-500 mb-2">
            INK<span className="text-blood/70">MATCH</span>
          </div>
          <p className="text-gray-600 text-xs">
            © 2026 InkMatch. 发现你的专属纹身艺术。
          </p>
        </div>
      </footer>
    </div>
  );
}
