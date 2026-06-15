import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Send,
  Image as ImageIcon,
  List,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getFeedbacks } from '../lib/api';
import type { Feedback, FeedbackStatus } from '../../shared/types';
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_CATEGORY_LABELS,
} from '../../shared/types';

const STATUS_TABS: { value: FeedbackStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'replied', label: '已回复' },
  { value: 'closed', label: '已关闭' },
];

export function MyFeedbacks() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<FeedbackStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const status = activeStatus === 'all' ? undefined : activeStatus;
      const result = await getFeedbacks('user-1', status);
      setFeedbacks(result.data);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [activeStatus]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusIcon = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-blood/20 flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-blood" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">我的反馈</h1>
            <p className="text-gray-400">
              查看您提交的所有反馈及处理进度
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/feedback')}
              className="btn-outline flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              提交新反馈
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeStatus === tab.value
                    ? 'bg-blood/20 border-blood/50 text-blood'
                    : 'bg-graphite border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 text-blood animate-spin" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-16 bg-graphite border border-white/5">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">暂无反馈记录</p>
              <p className="text-gray-500 text-sm mb-6">
                您还没有提交过反馈，有任何问题或建议欢迎告诉我们
              </p>
              <button
                onClick={() => navigate('/feedback')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                提交反馈
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map(feedback => (
                <div
                  key={feedback.id}
                  className="bg-graphite border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(feedback.id)}
                    className="w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border ${FEEDBACK_STATUS_COLORS[feedback.status]}`}
                          >
                            {getStatusIcon(feedback.status)}
                            {FEEDBACK_STATUS_LABELS[feedback.status]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {FEEDBACK_CATEGORY_LABELS[feedback.category]}
                          </span>
                        </div>
                        <h3 className="text-white font-medium truncate">
                          {feedback.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          提交时间：{formatDate(feedback.createdAt)}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-300 ${
                          expandedId === feedback.id ? 'rotate-180 text-blood' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedId === feedback.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-gray-400 text-sm mb-2">反馈描述</h4>
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {feedback.description}
                          </p>
                        </div>

                        {feedback.images.length > 0 && (
                          <div>
                            <h4 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              截图附件 ({feedback.images.length})
                            </h4>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                              {feedback.images.map(img => (
                                <div
                                  key={img.id}
                                  className="aspect-square bg-ink border border-white/10 overflow-hidden cursor-pointer hover:border-blood/50 transition-colors"
                                  onClick={() => window.open(img.url, '_blank')}
                                >
                                  <img
                                    src={img.url}
                                    alt="反馈截图"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {feedback.contact && (
                          <div>
                            <h4 className="text-gray-400 text-sm mb-1">联系方式</h4>
                            <p className="text-gray-300">{feedback.contact}</p>
                          </div>
                        )}

                        {feedback.reply && (
                          <div className="bg-ink border border-green-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium text-sm">官方回复</span>
                              <span className="text-gray-500 text-xs">
                                {feedback.repliedAt && formatDate(feedback.repliedAt)}
                              </span>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {feedback.reply}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                          <span>反馈编号：{feedback.id}</span>
                          <span>更新时间：{formatDate(feedback.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
