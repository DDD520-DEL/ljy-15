import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, Calendar, Clock, Loader2 } from 'lucide-react';
import type { Artist, TimeSlot } from '../../shared/types';
import { submitBooking, getAvailableSlots } from '../lib/api';

interface Props {
  open: boolean;
  artist: Artist | null;
  onClose: () => void;
}

function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getMaxDate(): string {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split('T')[0];
}

export function BookingModal({ open, artist, onClose }: Props) {
  const [style, setStyle] = useState('');
  const [size, setSize] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const resetForm = () => {
    setStyle('');
    setSize('');
    setBudgetMin('');
    setBudgetMax('');
    setContact('');
    setNote('');
    setBookingDate('');
    setTimeSlot('');
    setSubmitting(false);
    setSubmitted(false);
    setErrorMsg('');
    setOccupiedSlots([]);
    setAvailableSlots([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    async function fetchAvailableSlots() {
      if (!artist || !bookingDate) {
        setAvailableSlots([]);
        setOccupiedSlots([]);
        setTimeSlot('');
        return;
      }

      setLoadingSlots(true);
      try {
        const result = await getAvailableSlots(artist.id, bookingDate);
        setOccupiedSlots(result.occupiedSlots);
        setAvailableSlots(result.availableSlots);
        if (timeSlot && !result.availableSlots.includes(timeSlot)) {
          setTimeSlot('');
        }
      } catch {
        setOccupiedSlots([]);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchAvailableSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, bookingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    if (!style || !size || !contact || !bookingDate || !timeSlot) {
      setErrorMsg('请填写必填项，包括日期和时间段');
      return;
    }

    if (occupiedSlots.includes(timeSlot)) {
      setErrorMsg('该时段已被预约，请选择其他时段');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const result = await submitBooking({
      artistId: artist.id,
      style,
      size,
      budgetMin: budgetMin ? Number(budgetMin) : 0,
      budgetMax: budgetMax ? Number(budgetMax) : 0,
      contact,
      note: note || undefined,
      bookingDate,
      timeSlot,
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } else {
      setErrorMsg(result.message || '提交失败，请稍后重试');
    }
  };

  if (!open || !artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg bg-ink-200 border border-white/10 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blood via-gold to-blood" />

        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="font-display text-xl text-white">预约咨询</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              向 <span className="text-blood">{artist.name}</span> 发起预约意向
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center flex-shrink-0">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">预约意向已提交</h3>
            <p className="text-gray-400 text-sm">
              纹身师将尽快通过您提供的联系方式与您取得联系
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blood" />
                  预约日期 <span className="text-blood">*</span>
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blood" />
                  时间段 <span className="text-blood">*</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                  className="input-field"
                  disabled={!bookingDate || loadingSlots}
                >
                  <option value="">
                    {!bookingDate ? '请先选择日期' : loadingSlots ? '加载中...' : '请选择时段'}
                  </option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {bookingDate && (
              <div className="bg-ink-300/50 border border-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-2">
                  {loadingSlots ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      正在查询可用时段...
                    </span>
                  ) : availableSlots.length > 0 ? (
                    <span className="text-green-400">
                      当日还有 {availableSlots.length} 个时段可预约
                    </span>
                  ) : (
                    <span className="text-blood">
                      当日所有时段均已约满，请选择其他日期
                    </span>
                  )}
                </p>
                {!loadingSlots && occupiedSlots.length > 0 && (
                  <p className="text-gray-500 text-xs">
                    已占用时段：{occupiedSlots.join('、')}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm mb-1.5">
                意向风格 <span className="text-blood">*</span>
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="input-field"
              >
                <option value="">请选择风格</option>
                {artist.styles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="其他">其他风格</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1.5">
                纹身尺寸/位置描述 <span className="text-blood">*</span>
              </label>
              <textarea
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="例如：小臂内侧，约10x15cm..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">预算下限（元）</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="最低预算"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">预算上限（元）</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="最高预算"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1.5">
                联系方式 <span className="text-blood">*</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="微信号/手机号"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1.5">补充说明（选填）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="其他需求或参考图链接..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {errorMsg && (
              <div className="text-blood text-sm bg-blood/10 px-3 py-2 border border-blood/30">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>提交中...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    提交预约
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
