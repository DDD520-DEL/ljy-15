import { useEffect, useMemo } from 'react';
import { WorkCard } from './WorkCard';
import type { Artist, Work } from '../../shared/types';
import { Loader2 } from 'lucide-react';

interface Props {
  artists: Artist[];
  loading?: boolean;
}

export function Waterfall({ artists, loading }: Props) {
  const allWorks: (Work & { artist: Artist })[] = useMemo(() => {
    const works: (Work & { artist: Artist })[] = [];
    artists.forEach(artist => {
      artist.works.forEach(work => {
        works.push({ ...work, artist });
      });
    });
    return works.sort(() => Math.random() - 0.5);
  }, [artists]);

  const columns = useMemo(() => {
    const cols: (Work & { artist: Artist })[][] = [[], [], []];
    allWorks.forEach((work, i) => {
      cols[i % 3].push(work);
    });
    return cols;
  }, [allWorks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blood animate-spin" />
        <span className="ml-3 text-gray-400">加载中...</span>
      </div>
    );
  }

  if (allWorks.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-gray-500 text-lg mb-2">没有找到匹配的作品</div>
        <div className="text-gray-600 text-sm">试试调整筛选条件</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {columns.map((column, ci) => (
        <div key={ci} className="flex flex-col gap-4 md:gap-5">
          {column.map(work => (
            <WorkCard key={work.id} work={work} artist={work.artist} />
          ))}
        </div>
      ))}
    </div>
  );
}
