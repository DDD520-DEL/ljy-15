import { Router, Request, Response } from 'express';
import { favorites, artists } from '../data/mockData';
import type { Artist } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const favoriteArtists: Artist[] = artists.filter(a => favorites.includes(a.id));
    res.json({
      success: true,
      data: favoriteArtists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败'
    });
  }
});

router.post('/:artistId', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }
    if (favorites.includes(artistId)) {
      return res.json({
        success: true,
        data: { alreadyFavorited: true }
      });
    }
    favorites.push(artistId);
    res.json({
      success: true,
      data: { favorited: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '收藏失败'
    });
  }
});

router.delete('/:artistId', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const idx = favorites.indexOf(artistId);
    if (idx > -1) {
      favorites.splice(idx, 1);
    }
    res.json({
      success: true,
      data: { unfavorited: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消收藏失败'
    });
  }
});

export default router;
