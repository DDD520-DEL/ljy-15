import { useEffect } from 'react';
import { useStore } from '../store/useStore';

interface Props {
  onSelect?: (style: string) => void;
}

export function StyleTagCloud({ onSelect }: Props) {
  const { styles, fetchStyles, filters, setFilters } = useStore();

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const selectedStyles = filters.styles || [];

  const handleToggle = (styleName: string) => {
    const current = filters.styles || [];
    const next = current.includes(styleName)
      ? current.filter(s => s !== styleName)
      : [...current, styleName];
    setFilters({ styles: next.length > 0 ? next : undefined });
    onSelect?.(styleName);
  };

  const getSize = (popularity: number) => {
    if (popularity >= 90) return 'text-lg px-4 py-2';
    if (popularity >= 75) return 'text-base px-3.5 py-1.5';
    if (popularity >= 60) return 'text-sm px-3 py-1.5';
    return 'text-xs px-2.5 py-1';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
        {styles.map((style) => {
          const isActive = selectedStyles.includes(style.name);
          return (
            <button
              key={style.id}
              onClick={() => handleToggle(style.name)}
              className={`tag-chip ${getSize(style.popularity)} ${
                isActive ? 'tag-chip-active shadow-[0_0_15px_rgba(185,28,28,0.4)]' : ''
              }`}
            >
              <span className="font-medium">{style.name}</span>
              <span className="ml-1.5 text-gray-500 text-[10px] hidden sm:inline">
                {style.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
