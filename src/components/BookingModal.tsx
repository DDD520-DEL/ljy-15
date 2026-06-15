import { useState, useEffect, useMemo } from 'react';
import { X, Send, CheckCircle, Calendar, Clock, Loader2, Ticket } from 'lucide-react';
import type { Artist, TimeSlot, Coupon } from '../../shared/types';
import { submitBooking, getAvailableSlots, getAvailableCoupons } from '../lib/api';

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

function formatCouponLabel(coupon: Coupon): string {
  if (coupon.type === 'full_reduction') {
    return `满${coupon.threshold}减${coupon.value}`;
  }
  return `${coupon.value}折${coupon.threshold > 0 ? `（满${coupon.threshold}）` : ''}`;
}

function calcDiscount(coupon: Coupon, amount: number): number {
  if (coupon.type === 'full_reduction') {
    if (amount < coupon.threshold) return 0;
    return Math.min(coupon.value, amount);
  }
  if (coupon.type === 'discount') {
    if (amount < coupon.threshold) return 0;
    return Math.round(amount * (1 - coupon.value / 10));
  }
  return 0;
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);

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
    setCoupons([]);
    setSelectedCouponId('');
    setShowCouponList(false);
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

  useEffect(() => {
    if (!open) return;
    async function fetchCoupons() {
      setLoadingCoupons(true);
      try {
        const result = await getAvailableCoupons();
        setCoupons(result);
      } catch {
        setCoupons([]);
      } finally {
        setLoadingCoupons(false);
      }
    }
    fetchCoupons();
  }, [open]);

  const avgBudget = useMemo(() => {
    const min = budgetMin ? Number(budgetMin) : 0;
    const max = budgetMax ? Number(budgetMax) : 0;
    if (min && max) return (min + max) / 2;
    return min || max || 0;
  }, [budgetMin, budgetMax]);

  const selectedCoupon = useMemo(() => {
    if (!selectedCouponId) return null;
    return coupons.find(c => c.id === selectedCouponId) || null;
  }, [selectedCouponId, coupons]);

  const discountAmount = useMemo(() => {
    if (!selectedCoupon || avgBudget <= 0) return 0;
    return calcDiscount(selectedCoupon, avgBudget);
  }, [selectedCoupon, avgBudget]);

  const finalAmount = useMemo(() => {
    return Math.max(0, avgBudget - discountAmount);
  }, [avgBudget, discountAmount]);

  const eligibleCoupons = useMemo(() => {
    return coupons.filter(c => {
      if (avgBudget <= 0) return true;
      return avgBudget >= c.threshold;
    });
  }, [coupons, avgBudget]);

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

    if (selectedCoupon && avgBudget > 0 && avgBudget < selectedCoupon.threshold) {
      setErrorMsg(`所选优惠券需满${selectedCoupon.threshold}元才可使用`);
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
      couponId: selectedCouponId || undefined,
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
              <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-gold" />
                优惠券
              </label>
              <button
                type="button"
                onClick={() => setShowCouponList(!showCouponList)}
                className="input-field w-full text-left flex items-center justify-between"
              >
                <span className={selectedCoupon ? 'text-gold' : 'text-gray-500'}>
                  {selectedCoupon
                    ? `已选：${selectedCoupon.name}（${formatCouponLabel(selectedCoupon)}）`
                    : loadingCoupons
                      ? '加载优惠券...'
                      : coupons.length > 0
                        ? `有 ${eligibleCoupons.length} 张可用优惠券（点击选择）`
                        : '暂无可用优惠券'
                  }
                </span>
                <span className={`text-gray-500 transition-transform ${showCouponList ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {showCouponList && coupons.length > 0 && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setSelectedCouponId(''); setShowCouponList(false); }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      !selectedCouponId
                        ? 'border-gold/50 bg-gold/10'
                        : 'border-white/5 bg-ink-300/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-gray-400 text-sm">不使用优惠券</span>
                  </button>
                  {coupons.map(coupon => {
                    const eligible = avgBudget <= 0 || avgBudget >= coupon.threshold;
                    const discount = avgBudget > 0 ? calcDiscount(coupon, avgBudget) : 0;
                    return (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => {
                          if (eligible) {
                            setSelectedCouponId(selectedCouponId === coupon.id ? '' : coupon.id);
                            setShowCouponList(false);
                          }
                        }}
                        disabled={!eligible}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedCouponId === coupon.id
                            ? 'border-gold/50 bg-gold/10'
                            : eligible
                              ? 'border-white/5 bg-ink-300/50 hover:border-white/20'
                              : 'border-white/5 bg-ink-300/30 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm font-medium ${selectedCouponId === coupon.id ? 'text-gold' : 'text-white'}`}>
                              {coupon.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {coupon.type === 'full_reduction' ? '满减' : '折扣'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${selectedCouponId === coupon.id ? 'text-gold' : eligible ? 'text-blood' : 'text-gray-600'}`}>
                              {formatCouponLabel(coupon)}
                            </span>
                            {avgBudget > 0 && discount > 0 && (
                              <p className="text-xs text-green-400">可优惠 ¥{discount}</p>
                            )}
                          </div>
                        </div>
                        {!eligible && avgBudget > 0 && (
                          <p className="text-xs text-gray-600 mt-1">需满 ¥{coupon.threshold} 可用</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {avgBudget > 0 && (
              <div className="bg-ink-300/50 border border-white/5 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">预算金额</span>
                  <span className="text-white">¥{avgBudget.toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">优惠券减免</span>
                    <span className="text-green-400">-¥{discountAmount}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm pt-1.5 border-t border-white/10">
                    <span className="text-gray-300 font-medium">优惠后金额</span>
                    <span className="text-gold font-bold">¥{finalAmount.toFixed(0)}</span>
                  </div>
                )}
              </div>
            )}

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
