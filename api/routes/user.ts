import { Router, Request, Response } from 'express';
import type { UserProfile } from '../../shared/types';

const router = Router();

const defaultAvatar = 'https://picsum.photos/seed/user-default-avatar/200/200';

let userProfile: UserProfile = {
  id: 'user-1',
  nickname: '墨客',
  avatar: defaultAvatar,
  phone: '13800138000',
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
};

router.get('/profile', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    });
  }
});

router.put('/profile', (req: Request, res: Response) => {
  try {
    const { nickname, avatar, phone } = req.body;

    if (nickname !== undefined) {
      if (typeof nickname !== 'string' || nickname.trim().length === 0 || nickname.trim().length > 20) {
        return res.status(400).json({
          success: false,
          message: '昵称长度应为1-20个字符',
        });
      }
      userProfile.nickname = nickname.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '头像地址不能为空',
        });
      }
      userProfile.avatar = avatar.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !/^1[3-9]\d{9}$/.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          message: '请输入有效的手机号',
        });
      }
      userProfile.phone = phone.trim();
    }

    res.json({
      success: true,
      data: { ...userProfile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
    });
  }
});

export default router;
