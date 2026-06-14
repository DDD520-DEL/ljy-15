import { Router, Request, Response } from 'express';
import { artists, addArtistWork, removeArtistWork } from '../data/mockData';
import type { Artist, WorkUploadForm } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { styles, region, priceMin, priceMax, keyword } = req.query;

    let filtered: Artist[] = [...artists];

    if (styles) {
      const styleArr = Array.isArray(styles) ? styles : [styles];
      filtered = filtered.filter(a =>
        styleArr.some(s => a.styles.includes(s as string))
      );
    }

    if (region && typeof region === 'string') {
      filtered = filtered.filter(a => a.region === region || a.city === region);
    }

    if (priceMin) {
      const min = Number(priceMin);
      filtered = filtered.filter(a => a.priceMax >= min);
    }

    if (priceMax) {
      const max = Number(priceMax);
      filtered = filtered.filter(a => a.priceMin <= max);
    }

    if (keyword && typeof keyword === 'string') {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(kw) ||
        a.bio.toLowerCase().includes(kw) ||
        a.styles.some(s => s.toLowerCase().includes(kw))
      );
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取纹身师列表失败'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const artist = artists.find(a => a.id === req.params.id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }
    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取纹身师详情失败'
    });
  }
});

router.post('/:id/works', (req: Request, res: Response) => {
  try {
    const { title, image, style, description } = req.body as WorkUploadForm;
    if (!title || !image || !style) {
      return res.status(400).json({
        success: false,
        message: '作品标题、图片和风格不能为空'
      });
    }
    const artist = addArtistWork(req.params.id, { title, image, style, description });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在'
      });
    }
    res.json({
      success: true,
      data: artist,
      message: '作品上传成功'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '上传作品失败'
    });
  }
});

router.delete('/:id/works/:workId', (req: Request, res: Response) => {
  try {
    const artist = removeArtistWork(req.params.id, req.params.workId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师或作品不存在'
      });
    }
    res.json({
      success: true,
      data: artist,
      message: '作品删除成功'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '删除作品失败'
    });
  }
});

export default router;
