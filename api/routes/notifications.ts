import { Router, Request, Response } from 'express';
import {
  notifications,
  lastNotificationUpdate,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../data/mockData';
import type { Notification } from '../../shared/types';

const router = Router();

const LONG_POLL_TIMEOUT = 25000;
const POLL_INTERVAL = 500;

function filterNotifications(contact?: string, artistId?: string): Notification[] {
  let filtered = [...notifications];

  if (contact && typeof contact === 'string') {
    filtered = filtered.filter(n => n.contact === contact);
  }

  if (artistId && typeof artistId === 'string') {
    filtered = filtered.filter(n => n.artistId === artistId);
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return filtered;
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { contact, artistId } = req.query;
    const filtered = filterNotifications(
      contact as string | undefined,
      artistId as string | undefined
    );

    res.json({
      success: true,
      data: filtered,
      timestamp: lastNotificationUpdate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取通知列表失败',
    });
  }
});

router.get('/unread-count', (req: Request, res: Response) => {
  try {
    const { contact, artistId } = req.query;
    const filtered = filterNotifications(
      contact as string | undefined,
      artistId as string | undefined
    );
    const unreadCount = filtered.filter(n => !n.read).length;

    res.json({
      success: true,
      data: { count: unreadCount },
      timestamp: lastNotificationUpdate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取未读消息数量失败',
    });
  }
});

router.get('/updates', async (req: Request, res: Response) => {
  try {
    const { contact, artistId, since } = req.query;
    const sinceTime = since ? Number(since) : 0;
    const contactStr = contact as string | undefined;
    const artistIdStr = artistId as string | undefined;

    if (lastNotificationUpdate > sinceTime) {
      const filtered = filterNotifications(contactStr, artistIdStr);
      const unreadCount = filtered.filter(n => !n.read).length;
      return res.json({
        success: true,
        data: filtered,
        unreadCount,
        timestamp: lastNotificationUpdate,
        hasUpdates: true,
      });
    }

    let elapsed = 0;
    const checkInterval = setInterval(() => {
      elapsed += POLL_INTERVAL;

      if (lastNotificationUpdate > sinceTime) {
        clearInterval(checkInterval);
        const filtered = filterNotifications(contactStr, artistIdStr);
        const unreadCount = filtered.filter(n => !n.read).length;
        res.json({
          success: true,
          data: filtered,
          unreadCount,
          timestamp: lastNotificationUpdate,
          hasUpdates: true,
        });
        return;
      }

      if (elapsed >= LONG_POLL_TIMEOUT) {
        clearInterval(checkInterval);
        res.json({
          success: true,
          data: [],
          unreadCount: 0,
          timestamp: lastNotificationUpdate,
          hasUpdates: false,
        });
      }
    }, POLL_INTERVAL);

    req.on('close', () => {
      clearInterval(checkInterval);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '监听通知更新失败',
    });
  }
});

router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = markNotificationAsRead(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '通知不存在',
      });
    }

    res.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '标记已读失败',
    });
  }
});

router.patch('/read-all', (req: Request, res: Response) => {
  try {
    const { contact, artistId } = req.body;
    const success = markAllNotificationsAsRead(contact, artistId);

    res.json({
      success: true,
      message: success ? '已全部标记为已读' : '没有未读消息',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '标记全部已读失败',
    });
  }
});

export default router;
