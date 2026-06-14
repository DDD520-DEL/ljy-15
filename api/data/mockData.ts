import type { Artist, Style } from '../../shared/types';

export const styles: Style[] = [
  { id: 'old-school', name: 'Old School', nameEn: 'Old School', popularity: 95 },
  { id: 'new-school', name: 'New School', nameEn: 'New School', popularity: 80 },
  { id: 'ink-wash', name: '水墨', nameEn: 'Ink Wash', popularity: 75 },
  { id: 'dotwork', name: '点刺', nameEn: 'Dotwork', popularity: 70 },
  { id: 'single-needle', name: '单针写实', nameEn: 'Single Needle', popularity: 85 },
  { id: 'japanese', name: '日式传统', nameEn: 'Japanese Traditional', popularity: 88 },
  { id: 'geometric', name: '几何', nameEn: 'Geometric', popularity: 72 },
  { id: 'lettering', name: '花体字', nameEn: 'Lettering', popularity: 65 },
  { id: 'blackwork', name: '黑灰', nameEn: 'Blackwork', popularity: 78 },
  { id: 'watercolor', name: '水彩', nameEn: 'Watercolor', popularity: 60 },
  { id: 'tribal', name: '部落', nameEn: 'Tribal', popularity: 55 },
  { id: 'realism', name: '写实', nameEn: 'Realism', popularity: 90 },
];

export const regions = [
  '北京', '上海', '广州', '深圳', '成都',
  '杭州', '重庆', '武汉', '西安', '南京'
];

const imageKeywords = [
  'tattoo', 'ink', 'black-ink', 'tattoo-art', 'body-art',
  'tattoo-design', 'skin-art', 'tattoo-studio'
];

const artistNames = [
  '墨玄', '刺青客', '雕龙', '阿May', '小刀',
  '老K', '纹人墨客', '铁针', '刺魂', '青鸟',
  '青鸾', '黑墨', '纹艺', '针艺', '刺道'
];

const bios = [
  '从业十年，擅长东方传统风格，作品讲究线条流畅与意境表达。',
  '留日归来，精通日式传统刺青，尤以浮世绘题材见长。',
  '新锐纹身师，将水墨意境与现代纹身技法融合，风格独特。',
  '专注写实纹身十余年，擅长肖像、动植物写实，细节还原度极高。',
  '点刺艺术的探索者，用数以万计的点构成一幅幅精美的图案。',
  'Old School风格忠实拥趸，色彩鲜艳线条粗犷，美式复古味十足。',
  'New School风格代表，大胆夸张的造型，梦幻般的色彩搭配。',
  '几何与线条美学的追求者，作品充满对称美感与神圣几何。',
  '花体字大师，欧美书法与纹身艺术完美结合，每一针都是艺术。',
  '黑灰纹身专家，用黑白灰演绎出丰富的层次与深邃的意境。',
  '水彩纹身艺术家，作品如流动的水彩画，色彩斑斓而不失灵动。',
  '部落图腾研究者，将古老部落文化与现代纹身相融合。',
  '单针纹身匠人，用最细的针创造出最精致的作品。',
  '全能型纹身师，多种风格自由切换，为每位客人定制专属图案。',
  '女性纹身师，细腻柔美的风格，特别擅长小清新与花卉题材。'
];

function generateWorks(artistId: string, artistStyles: string[], count: number) {
  const works = [];
  for (let i = 0; i < count; i++) {
    const style = artistStyles[i % artistStyles.length];
    const keyword = imageKeywords[Math.floor(Math.random() * imageKeywords.length)];
    const seed = `${artistId}-${i}-${Date.now()}`;
    works.push({
      id: `${artistId}-work-${i}`,
      title: `${style}作品 ${i + 1}`,
      image: `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/${400 + Math.floor(Math.random() * 400)}`,
      style,
      artistId
    });
  }
  return works;
}

function generateArtists(): Artist[] {
  const artists: Artist[] = [];
  for (let i = 0; i < 15; i++) {
    const styleCount = 1 + Math.floor(Math.random() * 3);
    const artistStyles: string[] = [];
    while (artistStyles.length < styleCount) {
      const s = styles[Math.floor(Math.random() * styles.length)];
      if (!artistStyles.includes(s.name)) {
        artistStyles.push(s.name);
      }
    }
    const region = regions[i % regions.length];
    const priceBase = 300 + Math.floor(Math.random() * 8) * 300;
    artists.push({
      id: `artist-${i + 1}`,
      name: artistNames[i],
      avatar: `https://picsum.photos/seed/artist-${i + 1}-avatar/200/200`,
      bio: bios[i],
      region,
      city: region,
      priceMin: priceBase,
      priceMax: priceBase + 500 + Math.floor(Math.random() * 1500),
      priceUnit: '小时',
      styles: artistStyles,
      works: generateWorks(`artist-${i + 1}`, artistStyles, 5 + Math.floor(Math.random() * 4)),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return artists;
}

export const artists: Artist[] = generateArtists();

export let favorites: string[] = [];
export let bookings: any[] = [];
