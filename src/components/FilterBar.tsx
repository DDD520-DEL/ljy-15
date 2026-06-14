import { useEffect, useState } from 'react';
import { MapPin, DollarSign, RotateCcw, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

export function FilterBar() {
  const { regions, fetchRegions, filters, setFilters, resetFilters } = useStore();
  const [keyword, setKeyword] = useState(filters.keyword || '');

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ region: e.target.value || undefined });
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setFilters({ priceMin: val });
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setFilters({ priceMax: val });
  };

  const handleSearch = () => {
    setFilters({ keyword: keyword.trim() || undefined });
  };

  const handleReset = () => {
    setKeyword('');
    resetFilters();
  };

  const priceOptions = [
    { label: '不限', value: '' },
    { label: '300', value: '300' },
    { label: '500', value: '500' },
    { label: '800', value: '800' },
    { label: '1000', value: '1000' },
    { label: '1500', value: '1500' },
    { label: '2000', value: '2000' },
    { label: '3000', value: '3000' },
  ];

  return (
    <div className="bg-graphite/50 border border-white/5 p-4 md:p-5">
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索纹身师、风格关键词..."
            className="w-full bg-ink-100 border border-white/10 focus:border-blood pl-10 pr-24 py-2.5 text-sm text-white outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blood hover:bg-blood-light text-white text-xs transition-colors"
          >
            搜索
          </button>
        </div>

        <div className="flex flex-wrap gap-3 md:gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <select
              value={filters.region || ''}
              onChange={handleRegionChange}
              className="bg-ink-100 border border-white/10 focus:border-blood px-3 py-2 text-sm text-white outline-none transition-colors cursor-pointer"
            >
              <option value="">全部地区</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <select
              value={filters.priceMin || ''}
              onChange={handlePriceMinChange}
              className="bg-ink-100 border border-white/10 focus:border-blood px-2 py-2 text-sm text-white outline-none transition-colors cursor-pointer w-20"
            >
              {priceOptions.map((p) => (
                <option key={`min-${p.value}`} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">-</span>
            <select
              value={filters.priceMax || ''}
              onChange={handlePriceMaxChange}
              className="bg-ink-100 border border-white/10 focus:border-blood px-2 py-2 text-sm text-white outline-none transition-colors cursor-pointer w-20"
            >
              {priceOptions.map((p) => (
                <option key={`max-${p.value}`} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="text-gray-500 text-xs">元/时</span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
