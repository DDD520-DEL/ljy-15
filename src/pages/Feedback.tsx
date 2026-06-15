import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  ImagePlus,
  Trash2,
  Loader2,
  Send,
  CheckCircle,
  List,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { submitFeedback, getFeedbackCategories } from '../lib/api';
import type { FeedbackCategory, Feedback } from '../../shared/types';
import { FEEDBACK_CATEGORY_LABELS } from '../../shared/types';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

export function Feedback() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<Feedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const remainingSlots = 9 - pendingImages.length;
    if (remainingSlots <= 0) {
      setError('最多只能上传9张图片');
      return;
    }

    const newImages: PendingImage[] = [];
    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      newImages.push({
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setPendingImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setPendingImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!category) {
      setError('请选择反馈类型');
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      setError('请输入反馈标题（至少5个字）');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('请输入详细的反馈描述（至少10个字）');
      return;
    }

    if (contact && !/^1[3-9]\d{9}$/.test(contact)) {
      setError('请输入有效的手机号码');
      return;
    }

    setSubmitting(true);

    try {
      const images = [];
      for (const img of pendingImages) {
        const base64 = await fileToBase64(img.file);
        images.push({ url: base64 });
      }

      const result = await submitFeedback({
        category,
        title: title.trim(),
        description: description.trim(),
        images,
        contact: contact.trim() || undefined,
        userId: 'user-1',
      });

      if (!result.success || !result.feedback) {
        throw new Error(result.message || '提交失败');
      }

      setSubmittedFeedback(result.feedback);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContact('');
    setCategory('suggestion');
    setPendingImages([]);
    setError(null);
    setSuccess(false);
    setSubmittedFeedback(null);
  };

  useEffect(() => {
    return () => {
      pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

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
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-blood/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blood" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">意见反馈</h1>
            <p className="text-gray-400">
              您的每一条建议都是我们进步的动力
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={resetForm}
              className="btn-outline flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              提交反馈
            </button>
            <button
              onClick={() => navigate('/my-feedbacks')}
              className="btn-primary flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              我的反馈
            </button>
          </div>

          {success ? (
            <div className="bg-graphite border border-white/5 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">反馈提交成功</h2>
              <p className="text-gray-400 mb-6">
                感谢您的反馈，我们会尽快处理并给您回复
              </p>
              <div className="bg-ink border border-white/5 p-4 text-left mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">反馈编号：</span>
                    <span className="text-white">{submittedFeedback?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">提交时间：</span>
                    <span className="text-white">
                      {submittedFeedback && new Date(submittedFeedback.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">反馈类型：</span>
                    <span className="text-white">
                      {submittedFeedback && FEEDBACK_CATEGORY_LABELS[submittedFeedback.category]}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">当前状态：</span>
                    <span className="text-amber-400">待处理</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={resetForm} className="btn-outline">
                  继续提交
                </button>
                <button
                  onClick={() => navigate('/my-feedbacks')}
                  className="btn-primary"
                >
                  查看我的反馈
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-graphite border border-white/5 p-6 md:p-8">
              {error && (
                <div className="mb-6 p-4 bg-blood/10 border border-blood/30 text-blood text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    反馈类型 <span className="text-blood">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2.5 text-sm border transition-colors ${
                          category === cat
                            ? 'bg-blood/20 border-blood/50 text-blood'
                            : 'bg-ink border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {FEEDBACK_CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    反馈标题 <span className="text-blood">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="请简要概括您的反馈内容"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-ink border border-white/10 text-white placeholder-gray-600 focus:border-blood/50 focus:outline-none transition-colors"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {title.length}/100
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    详细描述 <span className="text-blood">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="请详细描述您遇到的问题或建议，以便我们更好地为您解决..."
                    rows={6}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-ink border border-white/10 text-white placeholder-gray-600 focus:border-blood/50 focus:outline-none transition-colors resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {description.length}/2000
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    上传截图
                    <span className="text-gray-500 font-normal">（可选，最多9张）</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {pendingImages.map(img => (
                      <div
                        key={img.id}
                        className="relative aspect-square bg-ink border border-white/10 overflow-hidden"
                      >
                        <img
                          src={img.preview}
                          alt="截图预览"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 p-1.5 bg-black/60 text-white/80 hover:bg-blood hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {pendingImages.length < 9 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-ink border-2 border-dashed border-white/15 hover:border-blood/50 flex flex-col items-center justify-center text-gray-500 hover:text-blood transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 mb-1" />
                        <span className="text-xs">添加图片</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFilesSelected(e.target.files)}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    联系方式
                    <span className="text-gray-500 font-normal">（选填，方便我们联系您）</span>
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="请输入您的手机号码"
                    maxLength={11}
                    className="w-full px-4 py-3 bg-ink border border-white/10 text-white placeholder-gray-600 focus:border-blood/50 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      提交反馈
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
