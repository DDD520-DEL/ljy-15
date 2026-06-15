import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Camera,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useUserStore } from '../store/useUserStore';

type EditMode = 'view' | 'edit';

function maskPhone(phone: string): string {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }
  return phone;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function UserProfile() {
  const { profile, loading, saving, fetchProfile, updateProfile } = useUserStore();
  const [mode, setMode] = useState<EditMode>('view');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setAvatar(profile.avatar);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleEdit = () => {
    if (profile) {
      setNickname(profile.nickname);
      setAvatar(profile.avatar);
      setPhone(profile.phone);
    }
    setError('');
    setMode('edit');
  };

  const handleCancel = () => {
    if (profile) {
      setNickname(profile.nickname);
      setAvatar(profile.avatar);
      setPhone(profile.phone);
    }
    setError('');
    setMode('view');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');

    if (!nickname.trim()) {
      setError('昵称不能为空');
      return;
    }
    if (nickname.trim().length > 20) {
      setError('昵称长度不能超过20个字符');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setError('请输入有效的手机号');
      return;
    }

    const result = await updateProfile({
      nickname: nickname.trim(),
      avatar,
      phone: phone.trim(),
    });

    if (result.success) {
      setMode('view');
    } else {
      setError(result.message || '保存失败，请重试');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-white mb-2">个人中心</h1>
              <p className="text-gray-400">查看和管理您的个人信息</p>
            </div>
            {mode === 'view' && profile && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                编辑资料
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blood animate-spin" />
            </div>
          ) : profile ? (
            <div className="bg-graphite border border-white/5 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-b from-blood/10 to-transparent">
                <div className="absolute -bottom-12 left-8">
                  <div className="relative group">
                    <img
                      src={mode === 'edit' ? avatar : profile.avatar}
                      alt={profile.nickname}
                      className="w-24 h-24 rounded-full object-cover border-4 border-graphite"
                    />
                    {mode === 'edit' && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-16 px-8 pb-8">
                {mode === 'view' ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-2xl text-white">{profile.nickname}</h2>
                      <p className="text-gray-500 text-sm mt-1">
                        注册于 {formatDate(profile.createdAt)}
                      </p>
                    </div>

                    <div className="divider" />

                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blood" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs mb-0.5">昵称</p>
                          <p className="text-white">{profile.nickname}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-blood" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs mb-0.5">手机号</p>
                          <p className="text-white">{maskPhone(profile.phone)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                          <label className="block text-gray-500 text-xs mb-2">昵称</label>
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                            placeholder="输入昵称"
                            className="input-field"
                          />
                          <p className="text-gray-600 text-xs mt-1 text-right">
                            {nickname.length}/20
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                          <label className="block text-gray-500 text-xs mb-2">手机号</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            maxLength={11}
                            placeholder="输入手机号"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 py-3 bg-blood/10 border border-blood/30 text-blood text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        保存修改
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="btn-outline flex items-center gap-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-graphite border border-white/5">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">无法加载用户信息</p>
              <button
                onClick={() => fetchProfile()}
                className="text-blood hover:text-blood-light text-sm transition-colors"
              >
                点击重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
