import { Router, Request, Response } from 'express';
import { artists, favorites, browseHistory } from '../data/mockData';
import type { Artist } from '../../shared/types';

const router = Router();

const MAX_BROWSE_HISTORY = 50;

router.post('/browse', (req: Request, res: Response) => {
  try {
    const { artistId } = req.body;
    if (!artistId || typeof artistId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '缺少artistId参数',
      });
    }
    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }
    const idx = browseHistory.findIndex(r => r.artistId === artistId);
    if (idx > -1) {
      browseHistory.splice(idx, 1);
    }
    browseHistory.unshift({
      artistId,
      browsedAt: new Date().toISOString(),
    });
    if (browseHistory.length > MAX_BROWSE_HISTORY) {
      browseHistory.length = MAX_BROWSE_HISTORY;
    }
    res.json({ success: true, data: { recorded: true } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '记录浏览历史失败',
    });
  }
});

router.get('/history', (_req: Request, res: Response) => {
  try {
    const result = browseHistory
      .map(record => {
        const artist = artists.find(a => a.id === record.artistId);
        return artist ? { artist, browsedAt: record.browsedAt } : null;
      })
      .filter(Boolean);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取浏览历史失败',
    });
  }
});

router.delete('/history/:artistId', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const idx = browseHistory.findIndex(r => r.artistId === artistId);
    if (idx > -1) {
      browseHistory.splice(idx, 1);
    }
    res.json({
      success: true,
      data: { removed: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除浏览记录失败',
    });
  }
});

router.delete('/history', (_req: Request, res: Response) => {
  try {
    browseHistory.length = 0;
    res.json({
      success: true,
      data: { cleared: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '清空浏览历史失败',
    });
  }
});

router.get('/guess', (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

    const styleScore: Record<string, number> = {};

    for (const record of browseHistory) {
      const artist = artists.find(a => a.id === record.artistId);
      if (!artist) continue;
      const hoursSince = (Date.now() - new Date(record.browsedAt).getTime()) / (1000 * 60 * 60);
      const decay = Math.max(0.1, 1 - hoursSince / (24 * 7));
      for (const style of artist.styles) {
        styleScore[style] = (styleScore[style] || 0) + decay * 1.0;
      }
    }

    for (const favId of favorites) {
      const artist = artists.find(a => a.id === favId);
      if (!artist) continue;
      for (const style of artist.styles) {
        styleScore[style] = (styleScore[style] || 0) + 2.0;
      }
    }

    const browsedIds = new Set(browseHistory.map(r => r.artistId));
    const favoritedIds = new Set(favorites);

    const candidates = artists.filter(a => !browsedIds.has(a.id) && !favoritedIds.has(a.id));

    const scored = candidates.map(artist => {
      let score = 0;
      for (const style of artist.styles) {
        score += styleScore[style] || 0;
      }
      score += artist.avgRating * 0.3;
      score += Math.min(artist.reviewCount, 20) * 0.1;
      return { artist, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const recommended: Artist[] = scored.slice(0, limit).map(s => s.artist);

    const topStyles = Object.entries(styleScore)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([style]) => style);

    res.json({
      success: true,
      data: {
        artists: recommended,
        basedOnStyles: topStyles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取推荐失败',
    });
  }
});

export default router;
