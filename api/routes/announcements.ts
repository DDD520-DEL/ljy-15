import { Router, Request, Response } from 'express';
import {
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../data/mockData';
import type { AnnouncementPriority } from '../../shared/types';

const router = Router();

router.get('/active', (_req: Request, res: Response) => {
  try {
    const active = getActiveAnnouncements();
    res.json({
      success: true,
      data: active,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取有效公告失败',
    });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const { enabled, priority } = req.query;
    const enabledFilter = enabled === 'true' ? true : enabled === 'false' ? false : undefined;
    const priorityFilter = priority as AnnouncementPriority | undefined;
    const list = getAllAnnouncements(enabledFilter, priorityFilter);
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告列表失败',
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = getAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
      });
    }
    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告详情失败',
    });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, content, priority, startDate, endDate, enabled } = req.body;
    if (!title || !content || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '标题、内容、开始日期和结束日期为必填项',
      });
    }
    const announcement = createAnnouncement({
      title,
      content,
      priority: priority || 'normal',
      startDate,
      endDate,
      enabled: enabled !== undefined ? enabled : true,
    });
    res.status(201).json({
      success: true,
      data: announcement,
      message: '公告创建成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建公告失败',
    });
  }
});

router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, priority, startDate, endDate, enabled } = req.body;
    const announcement = updateAnnouncement(id, {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(priority !== undefined && { priority }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(enabled !== undefined && { enabled }),
    });
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
      });
    }
    res.json({
      success: true,
      data: announcement,
      message: '公告更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新公告失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = deleteAnnouncement(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
      });
    }
    res.json({
      success: true,
      message: '公告已删除',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除公告失败',
    });
  }
});

export default router;
