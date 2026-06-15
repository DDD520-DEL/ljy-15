import { Router, Request, Response } from 'express';
import {
  artists,
  getPriceCalendarByArtistId,
  getPriceCalendarEntry,
  getPriceInfo,
  getPriceInfos,
  upsertPriceCalendarEntry,
  batchUpsertPriceCalendar,
  deletePriceCalendarEntry,
  deletePriceCalendarRange,
  lastPriceCalendarUpdate,
} from '../data/mockData';
import type { PriceCalendarUpsertRequest } from '../../shared/types';

const router = Router();

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateStr;
}

router.get('/artists/:artistId', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const { startDate, endDate } = req.query;

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const startDateStr = startDate as string | undefined;
    const endDateStr = endDate as string | undefined;

    if (startDateStr && !isValidDate(startDateStr)) {
      return res.status(400).json({
        success: false,
        message: '开始日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    if (endDateStr && !isValidDate(endDateStr)) {
      return res.status(400).json({
        success: false,
        message: '结束日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    const entries = getPriceCalendarByArtistId(artistId, startDateStr, endDateStr);

    res.json({
      success: true,
      data: entries,
      timestamp: lastPriceCalendarUpdate,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取价格日历失败',
    });
  }
});

router.get('/artists/:artistId/price-info', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const { date, startDate, endDate } = req.query;

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    if (date) {
      const dateStr = date as string;
      if (!isValidDate(dateStr)) {
        return res.status(400).json({
          success: false,
          message: '日期格式无效，请使用 YYYY-MM-DD 格式',
        });
      }

      const priceInfo = getPriceInfo(artistId, dateStr);
      return res.json({
        success: true,
        data: priceInfo,
        timestamp: lastPriceCalendarUpdate,
      });
    }

    if (startDate && endDate) {
      const startDateStr = startDate as string;
      const endDateStr = endDate as string;

      if (!isValidDate(startDateStr)) {
        return res.status(400).json({
          success: false,
          message: '开始日期格式无效，请使用 YYYY-MM-DD 格式',
        });
      }

      if (!isValidDate(endDateStr)) {
        return res.status(400).json({
          success: false,
          message: '结束日期格式无效，请使用 YYYY-MM-DD 格式',
        });
      }

      if (startDateStr > endDateStr) {
        return res.status(400).json({
          success: false,
          message: '开始日期不能晚于结束日期',
        });
      }

      const priceInfos = getPriceInfos(artistId, startDateStr, endDateStr);
      return res.json({
        success: true,
        data: priceInfos,
        timestamp: lastPriceCalendarUpdate,
      });
    }

    return res.status(400).json({
      success: false,
      message: '请提供 date 参数查询单日价格，或提供 startDate 和 endDate 参数查询日期范围价格',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取价格信息失败',
    });
  }
});

router.get('/artists/:artistId/:date', (req: Request, res: Response) => {
  try {
    const { artistId, date } = req.params;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: '日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const entry = getPriceCalendarEntry(artistId, date);

    res.json({
      success: true,
      data: entry || null,
      timestamp: lastPriceCalendarUpdate,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取价格日历条目失败',
    });
  }
});

router.put('/artists/:artistId/:date', (req: Request, res: Response) => {
  try {
    const { artistId, date } = req.params;
    const body = req.body as Partial<PriceCalendarUpsertRequest>;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: '日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const priceMin = body.priceMin;
    const priceMax = body.priceMax;

    if (priceMin === undefined || priceMax === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供 priceMin 和 priceMax',
      });
    }

    if (typeof priceMin !== 'number' || priceMin < 0) {
      return res.status(400).json({
        success: false,
        message: 'priceMin 必须为非负数',
      });
    }

    if (typeof priceMax !== 'number' || priceMax < priceMin) {
      return res.status(400).json({
        success: false,
        message: 'priceMax 必须大于或等于 priceMin',
      });
    }

    const entry = upsertPriceCalendarEntry(artistId, date, priceMin, priceMax, body.note);

    if (!entry) {
      return res.status(500).json({
        success: false,
        message: '保存价格日历失败',
      });
    }

    res.json({
      success: true,
      data: entry,
      message: '价格设置成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '保存价格日历失败',
    });
  }
});

router.put('/artists/:artistId/batch', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const body = req.body as {
      startDate: string;
      endDate: string;
      priceMin: number;
      priceMax: number;
      note?: string;
    };

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const { startDate, endDate, priceMin, priceMax, note } = body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请提供 startDate 和 endDate',
      });
    }

    if (!isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: '开始日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    if (!isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: '结束日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: '开始日期不能晚于结束日期',
      });
    }

    if (priceMin === undefined || priceMax === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供 priceMin 和 priceMax',
      });
    }

    if (typeof priceMin !== 'number' || priceMin < 0) {
      return res.status(400).json({
        success: false,
        message: 'priceMin 必须为非负数',
      });
    }

    if (typeof priceMax !== 'number' || priceMax < priceMin) {
      return res.status(400).json({
        success: false,
        message: 'priceMax 必须大于或等于 priceMin',
      });
    }

    const entries = batchUpsertPriceCalendar(artistId, startDate, endDate, priceMin, priceMax, note);

    if (!entries) {
      return res.status(500).json({
        success: false,
        message: '批量设置价格日历失败',
      });
    }

    res.json({
      success: true,
      data: entries,
      message: `已成功为 ${entries.length} 天设置价格`,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '批量设置价格日历失败',
    });
  }
});

router.delete('/artists/:artistId/:date', (req: Request, res: Response) => {
  try {
    const { artistId, date } = req.params;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: '日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const deleted = deletePriceCalendarEntry(artistId, date);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '该日期无自定义价格设置',
      });
    }

    res.json({
      success: true,
      message: '价格设置已删除，将恢复默认价格',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '删除价格日历失败',
    });
  }
});

router.delete('/artists/:artistId/batch', (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;
    const { startDate, endDate } = req.query;

    const artist = artists.find(a => a.id === artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '纹身师不存在',
      });
    }

    const startDateStr = startDate as string | undefined;
    const endDateStr = endDate as string | undefined;

    if (!startDateStr || !endDateStr) {
      return res.status(400).json({
        success: false,
        message: '请提供 startDate 和 endDate',
      });
    }

    if (!isValidDate(startDateStr)) {
      return res.status(400).json({
        success: false,
        message: '开始日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    if (!isValidDate(endDateStr)) {
      return res.status(400).json({
        success: false,
        message: '结束日期格式无效，请使用 YYYY-MM-DD 格式',
      });
    }

    if (startDateStr > endDateStr) {
      return res.status(400).json({
        success: false,
        message: '开始日期不能晚于结束日期',
      });
    }

    const deletedCount = deletePriceCalendarRange(artistId, startDateStr, endDateStr);

    res.json({
      success: true,
      message: `已删除 ${deletedCount} 条价格设置`,
      data: { deletedCount },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '批量删除价格日历失败',
    });
  }
});

export default router;
