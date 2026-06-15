import { Router, Request, Response } from 'express';
import {
  createFeedback,
  getFeedbackById,
  getFeedbacksByUserId,
  getAllFeedbacks,
  updateFeedbackStatus,
  lastFeedbackUpdate,
} from '../data/mockData';
import type { FeedbackSubmitRequest, Feedback, FeedbackStatus, FeedbackCategory } from '../../shared/types';
import { FEEDBACK_CATEGORY_LABELS } from '../../shared/types';

const router = Router();

const ALL_STATUSES: FeedbackStatus[] = ['pending', 'processing', 'replied', 'closed'];
const ALL_CATEGORIES: FeedbackCategory[] = ['bug', 'feature', 'suggestion', 'complaint', 'other'];

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as FeedbackSubmitRequest;

    if (!body.category || !ALL_CATEGORIES.includes(body.category)) {
      return res.status(400).json({
        success: false,
        message: '请选择有效的反馈类型'
      });
    }

    if (!body.title || body.title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: '请输入反馈标题（至少5个字）'
      });
    }

    if (!body.description || body.description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '请输入详细的反馈描述（至少10个字）'
      });
    }

    if (body.title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: '标题不能超过100个字'
      });
    }

    if (body.description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: '描述不能超过2000个字'
      });
    }

    if (body.contact && !/^1[3-9]\d{9}$/.test(body.contact)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    if (body.images && !Array.isArray(body.images)) {
      return res.status(400).json({
        success: false,
        message: '图片数据格式不正确'
      });
    }

    if (body.images && body.images.length > 9) {
      return res.status(400).json({
        success: false,
        message: '最多只能上传9张图片'
      });
    }

    const feedback = createFeedback(body);

    res.status(201).json({
      success: true,
      data: feedback,
      message: '反馈提交成功，我们会尽快处理'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '提交反馈失败'
    });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const { userId, status, category } = req.query;
    let feedbacks: Feedback[];

    if (userId && typeof userId === 'string') {
      feedbacks = getFeedbacksByUserId(userId, status as FeedbackStatus);
    } else {
      feedbacks = getAllFeedbacks(status as FeedbackStatus, category as FeedbackCategory);
    }

    res.json({
      success: true,
      data: feedbacks,
      timestamp: lastFeedbackUpdate
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取反馈列表失败'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取反馈详情失败'
    });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body as { status: FeedbackStatus; reply?: string };

    if (!status || !ALL_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const feedback = updateFeedbackStatus(id, status, reply);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }

    res.json({
      success: true,
      data: feedback,
      message: '反馈状态已更新'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '更新反馈状态失败'
    });
  }
});

router.get('/categories/list', (req: Request, res: Response) => {
  try {
    const categories = ALL_CATEGORIES.map(cat => ({
      value: cat,
      label: FEEDBACK_CATEGORY_LABELS[cat],
    }));

    res.json({
      success: true,
      data: categories,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取反馈分类失败'
    });
  }
});

export default router;
