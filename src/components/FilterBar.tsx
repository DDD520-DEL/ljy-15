import { useEffect, useState } from 'react';
import { MapPin, DollarSign, RotateCcw, Search, ArrowUpDown, Star, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { SortBy, SortOrder } from '../../shared/types';

interface SortOption {
  value: SortBy;
  label: string;
  icon: typeof Star;
}

const sortOptions: SortOption[] = [
  { value: 'rating', label: '评分', icon: Star },
  { value: 'popularity', label: '热度', icon: Flame },
  { value: 'price', label: '价格', icon: DollarSign },
];

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

  const handleSortChange = (sortBy: SortBy) => {
    if (filters.sortBy === sortBy) {
      const nextOrder: SortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
      setFilters({ sortOrder: nextOrder });
    } else {
      setFilters({ sortBy, sortOrder: 'desc' });
    }
  };

  const handleClearSort = () => {
    setFilters({ sortBy: undefined, sortOrder: undefined });
  };

  const currentSort = filters.sortBy;
  const currentOrder = filters.sortOrder || 'desc';

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
    <div className="bg-graphite/50 border border-white/5 p-4 md:p-5 space-y-4">
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

      <div className="flex items-center gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>排序</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentSort === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${
                  isActive
                    ? 'border-blood bg-blood/10 text-blood'
                    : 'border-white/10 bg-ink-100 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{option.label}</span>
                {isActive && (
                  currentOrder === 'desc' ? (
                    <ArrowDown className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ArrowUp className="w-3 h-3 ml-0.5" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {currentSort && (
          <button
            onClick={handleClearSort}
            className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            清除排序
          </button>
        )}
      </div>
    </div>
  );
}
