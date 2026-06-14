import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import type { Booking } from '../../shared/types';
import { submitReview } from '../lib/api';

interface Props {
  open: boolean;
  booking: Booking;
  artistId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewModal({ open, booking, artistId, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('请选择评分');
      return;
    }
    if (!comment.trim()) {
      setError('请填写评价内容');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await submitReview({
        artistId,
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
        reviewer: reviewer.trim() || '匿名用户',
      });

      if (result.success) {
        onSubmitted();
        setRating(0);
        setComment('');
        setReviewer('');
        onClose();
      } else {
        setError(result.message || '提交评价失败');
      }
    } catch {
      setError('提交评价失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setReviewer('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={handleClose}>
      <div
        className="bg-graphite border border-white/10 w-full max-w-md p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-display text-xl">评价服务</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-1">预约风格：{booking.style}</p>
          <p className="text-gray-500 text-xs">尺寸：{booking.size}</p>
        </div>

        <div className="mb-6">
          <label className="text-gray-300 text-sm mb-3 block">评分</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-gold fill-gold'
                      : 'text-gray-600 hover:text-gold/50'
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-gold text-sm ml-2 font-medium">{rating}.0 分</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-300 text-sm mb-2 block">您的称呼</label>
          <input
            type="text"
            value={reviewer}
            onChange={e => setReviewer(e.target.value)}
            placeholder="选填"
            className="input-field"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-300 text-sm mb-2 block">评价内容</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="分享您的纹身体验..."
            rows={4}
            className="w-full bg-transparent border border-white/20 focus:border-blood text-white px-3 py-2 outline-none transition-colors duration-300 placeholder:text-gray-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-blood text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="btn-outline flex-1"
            disabled={submitting}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                提交中
              </>
            ) : (
              '提交评价'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
