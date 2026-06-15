import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Link2,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getStyles, submitArtistApplication } from '../lib/api';
import type { Style, ArtistApplicationRequest, ArtistApplication } from '../../shared/types';

type FormState = 'form' | 'submitting' | 'success';

export function ArtistApplication() {
  const [formState, setFormState] = useState<FormState>('form');
  const [styles, setStyles] = useState<Style[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [error, setError] = useState('');
  const [submittedApp, setSubmittedApp] = useState<ArtistApplication | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wechat, setWechat] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const data = await getStyles();
        setStyles(data);
      } catch (e) {
        console.error('Failed to load styles:', e);
      } finally {
        setLoadingStyles(false);
      }
    };
    fetchStyles();
  }, []);

  const toggleStyle = (styleName: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleName)
        ? prev.filter((s) => s !== styleName)
        : [...prev, styleName]
    );
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('请输入您的姓名');
      return false;
    }
    if (name.trim().length < 2) {
      setError('姓名至少需要2个字符');
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setError('请输入有效的手机号码');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (!city.trim()) {
      setError('请输入所在城市');
      return false;
    }
    if (!bio.trim()) {
      setError('请填写个人介绍');
      return false;
    }
    if (bio.trim().length < 20) {
      setError('个人介绍至少需要20个字');
      return false;
    }
    if (selectedStyles.length === 0) {
      setError('请至少选择一种擅长风格');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setFormState('submitting');

    const request: ArtistApplicationRequest = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      wechat: wechat.trim() || undefined,
      city: city.trim(),
      bio: bio.trim(),
      styles: selectedStyles,
      portfolioLinks: portfolioLinks.trim() || undefined,
      note: note.trim() || undefined,
    };

    try {
      const result = await submitArtistApplication(request);
      if (result.success) {
        setSubmittedApp(result.application);
        setFormState('success');
      } else {
        setError(result.message || '提交失败，请重试');
        setFormState('form');
      }
    } catch {
      setError('提交失败，请检查网络连接后重试');
      setFormState('form');
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setWechat('');
    setCity('');
    setBio('');
    setSelectedStyles([]);
    setPortfolioLinks('');
    setNote('');
    setError('');
    setFormState('form');
    setSubmittedApp(null);
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

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-blood/20 flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-blood" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">艺术家入驻申请</h1>
            <p className="text-gray-400">
              加入我们，展示您的纹身艺术，连接更多热爱纹身的客户
            </p>
          </div>

          {formState === 'success' ? (
            <div className="bg-graphite border border-white/5 p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-white mb-2">申请提交成功！</h2>
              <p className="text-gray-400 mb-6">
                感谢您的申请，我们将在3-5个工作日内审核并与您联系。
              </p>
              {submittedApp && (
                <div className="bg-ink-200/50 border border-white/5 p-4 mb-6 text-left">
                  <p className="text-gray-500 text-sm mb-2">申请编号</p>
                  <p className="text-white font-mono">{submittedApp.id}</p>
                  <p className="text-gray-500 text-sm mt-3 mb-2">联系电话</p>
                  <p className="text-white">{submittedApp.phone}</p>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <Link
                  to="/"
                  className="btn-outline flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回首页
                </Link>
                <button
                  onClick={handleReset}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  提交新申请
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-graphite border border-white/5 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blood" />
                    基本信息
                  </h2>
                  <div className="divider mb-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        姓名 <span className="text-blood">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={20}
                        placeholder="请输入您的真实姓名"
                        className="input-field"
                        disabled={formState === 'submitting'}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        手机号码 <span className="text-blood">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={11}
                        placeholder="请输入您的手机号码"
                        className="input-field"
                        disabled={formState === 'submitting'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={50}
                        placeholder="请输入您的邮箱（选填）"
                        className="input-field"
                        disabled={formState === 'submitting'}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        微信号
                      </label>
                      <input
                        type="text"
                        value={wechat}
                        onChange={(e) => setWechat(e.target.value)}
                        maxLength={30}
                        placeholder="请输入您的微信号（选填）"
                        className="input-field"
                        disabled={formState === 'submitting'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      所在城市 <span className="text-blood">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      maxLength={20}
                      placeholder="例如：北京、上海、深圳"
                      className="input-field"
                      disabled={formState === 'submitting'}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blood" />
                    个人介绍 <span className="text-blood">*</span>
                  </h2>
                  <div className="divider mb-6" />

                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={1000}
                      rows={5}
                      placeholder="请介绍您的从业经历、擅长领域、艺术理念等，让客户更好地了解您..."
                      className="input-field resize-none"
                      disabled={formState === 'submitting'}
                    />
                    <p className="text-gray-600 text-xs mt-1 text-right">
                      {bio.length}/1000 （至少20字）
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blood" />
                    擅长风格 <span className="text-blood">*</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">（可多选）</span>
                  </h2>
                  <div className="divider mb-6" />

                  {loadingStyles ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-blood animate-spin" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {styles.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => toggleStyle(style.name)}
                          disabled={formState === 'submitting'}
                          className={`px-4 py-2 text-sm border transition-all disabled:opacity-50 ${
                            selectedStyles.includes(style.name)
                              ? 'bg-blood/20 border-blood/50 text-blood'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedStyles.length > 0 && (
                    <p className="text-gray-500 text-sm mt-3">
                      已选择 {selectedStyles.length} 种风格
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blood" />
                    作品链接
                  </h2>
                  <div className="divider mb-6" />

                  <div>
                    <textarea
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="请提供您的作品集链接，例如：Instagram、微博、小红书等个人主页链接（选填）"
                      className="input-field resize-none"
                      disabled={formState === 'submitting'}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      多个链接请用逗号或换行分隔
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blood" />
                    备注
                  </h2>
                  <div className="divider mb-6" />

                  <div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={300}
                      rows={3}
                      placeholder="其他需要说明的信息（选填）"
                      className="input-field resize-none"
                      disabled={formState === 'submitting'}
                    />
                    <p className="text-gray-600 text-xs mt-1 text-right">
                      {note.length}/300
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-blood/10 border border-blood/30 text-blood text-sm mb-6">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={formState === 'submitting'}
                    className="btn-outline disabled:opacity-50"
                  >
                    重置表单
                  </button>
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        提交申请
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-8 p-6 bg-ink-200/30 border border-white/5">
            <h3 className="text-white font-medium mb-3">入驻须知</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blood mt-0.5">•</span>
                <span>平台审核通常需要3-5个工作日，审核结果将通过短信通知您</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood mt-0.5">•</span>
                <span>入驻成功后，您需要上传至少5个代表作品才能开始接单</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood mt-0.5">•</span>
                <span>平台不收取入驻费用，仅在订单完成后收取一定比例的服务费</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood mt-0.5">•</span>
                <span>如有疑问，请联系客服：400-888-8888</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
