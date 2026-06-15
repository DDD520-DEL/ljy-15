import { Router, Request, Response } from 'express';
import {
  createApplication,
  getApplicationById,
  getApplicationsByPhone,
  getAllApplications,
  updateApplicationStatus,
  lastApplicationUpdate,
} from '../data/mockData';
import type { ArtistApplicationRequest, ArtistApplication, ApplicationStatus } from '../../shared/types';

const router = Router();

const ALL_STATUSES: ApplicationStatus[] = ['pending', 'approved', 'rejected'];

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as ArtistApplicationRequest;

    if (!body.name || !body.phone || !body.bio || !body.styles || !body.city) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的申请信息（姓名、手机号、个人介绍、擅长风格、所在城市）'
      });
    }

    if (!Array.isArray(body.styles)) {
      return res.status(400).json({
        success: false,
        message: '擅长风格必须为数组格式'
      });
    }

    if (body.styles.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请至少选择一种擅长风格'
      });
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(body.phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址'
      });
    }

    if (body.bio.length < 20) {
      return res.status(400).json({
        success: false,
        message: '个人介绍至少需要20个字'
      });
    }

    const application = createApplication(body);

    res.status(201).json({
      success: true,
      data: application,
      message: '入驻申请已提交，我们将在3-5个工作日内审核并与您联系'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '提交申请失败'
    });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const { phone, status } = req.query;
    let applications: ArtistApplication[];

    if (phone && typeof phone === 'string') {
      applications = getApplicationsByPhone(phone);
    } else {
      applications = getAllApplications(status as ApplicationStatus);
    }

    res.json({
      success: true,
      data: applications,
      timestamp: lastApplicationUpdate
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取申请列表失败'
    });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = getApplicationById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '获取申请详情失败'
    });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body as { status: ApplicationStatus; reviewNote?: string };

    if (!status || !ALL_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const application = updateApplicationStatus(id, status, reviewNote);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    res.json({
      success: true,
      data: application,
      message: '审核状态已更新'
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '更新审核状态失败'
    });
  }
});

export default router;
