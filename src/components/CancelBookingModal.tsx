import { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, Loader2, Info } from 'lucide-react';
import type { Booking, CancellationReason } from '../../shared/types';
import { CANCELLATION_REASONS, CANCELLATION_POLICY } from '../../shared/types';
import { getCancellationInfo, cancelBooking, type CancellationInfo } from '../lib/api';

interface Props {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCancelled?: () => void;
}

export function CancelBookingModal({ open, booking, onClose, onCancelled }: Props) {
  const [step, setStep] = useState<'confirm' | 'reason' | 'processing' | 'success'>('confirm');
  const [selectedReason, setSelectedReason] = useState<CancellationReason | ''>('');
  const [note, setNote] = useState('');
  const [cancellationInfo, setCancellationInfo] = useState<CancellationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [penaltyRate, setPenaltyRate] = useState(0);

  const resetState = () => {
    setStep('confirm');
    setSelectedReason('');
    setNote('');
    setCancellationInfo(null);
    setLoading(false);
    setErrorMsg('');
    setResultMessage('');
    setPenaltyAmount(0);
    setPenaltyRate(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    async function fetchInfo() {
      if (!open || !booking) return;
      setLoading(true);
      setErrorMsg('');
      try {
        const result = await getCancellationInfo(booking.id);
        if (result.success && result.data) {
          setCancellationInfo(result.data);
          setPenaltyAmount(result.data.penaltyAmount);
          setPenaltyRate(result.data.penaltyRate);
        } else {
          setErrorMsg(result.message || '获取取消信息失败');
        }
      } catch {
        setErrorMsg('获取取消信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    fetchInfo();
  }, [open, booking]);

  const handleNext = () => {
    setStep('reason');
  };

  const handleBack = () => {
    setStep('confirm');
  };

  const handleCancelBooking = async () => {
    if (!booking || !selectedReason) return;

    setLoading(true);
    setErrorMsg('');
    setStep('processing');

    try {
      const result = await cancelBooking(booking.id, selectedReason, note || undefined);
      if (result.success) {
        setPenaltyAmount(result.penaltyAmount || 0);
        setPenaltyRate(result.penaltyRate || 0);
        setResultMessage(result.message || '预约已取消');
        setStep('success');
        onCancelled?.();
      } else {
        setErrorMsg(result.message || '取消失败，请稍后重试');
        setStep('reason');
      }
    } catch {
      setErrorMsg('取消失败，请稍后重试');
      setStep('reason');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !booking) return null;

  const formatHours = (hours: number) => {
    if (hours < 0) return '已过期';
    if (hours < 1) return `${Math.round(hours * 60)} 分钟`;
    if (hours < 24) return `${Math.round(hours)} 小时`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days} 天 ${remainingHours} 小时` : `${days} 天`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-ink-200 border border-white/10 animate-slide-up overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blood via-gold to-blood" />

        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-display text-xl text-white">取消预约</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {booking.style}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            disabled={loading && step === 'processing'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && step === 'confirm' ? (
          <div className="p-10 text-center">
            <Loader2 className="w-8 h-8 text-blood animate-spin mx-auto mb-4" />
            <p className="text-gray-400">正在加载取消信息...</p>
          </div>
        ) : errorMsg && step === 'confirm' ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-blood mx-auto mb-4" />
            <p className="text-white mb-2">无法取消预约</p>
            <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
            <button onClick={handleClose} className="btn-primary px-6 py-2">
              我知道了
            </button>
          </div>
        ) : step === 'confirm' && cancellationInfo ? (
          <div className="p-5 space-y-5">
            <div className="bg-ink-300/50 border border-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Clock className="w-5 h-5 text-blood flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">预约信息</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {booking.bookingDate} {booking.timeSlot}
                  </p>
                </div>
              </div>
              <div className="pl-8">
                <p className="text-gray-400 text-xs">
                  距离预约开始还有：
                  <span className="text-white ml-1">
                    {formatHours(cancellationInfo.hoursUntilBooking)}
                  </span>
                </p>
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${
              cancellationInfo.penaltyAmount > 0
                ? 'bg-blood/10 border-blood/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {cancellationInfo.penaltyAmount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-blood flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    cancellationInfo.penaltyAmount > 0 ? 'text-blood' : 'text-green-400'
                  }`}>
                    {cancellationInfo.penaltyAmount > 0 ? '需支付违约金' : '免费取消'}
                  </p>
                  {cancellationInfo.penaltyAmount > 0 ? (
                    <>
                      <p className="text-white text-lg font-bold mt-1">
                        ¥{cancellationInfo.penaltyAmount}
                        <span className="text-gray-400 text-sm font-normal ml-2">
                          （{Math.round(cancellationInfo.penaltyRate * 100)}% 预算）
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">
                      距预约超过 {cancellationInfo.freeCancelHours} 小时，可免费取消
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-ink-300/30 border border-white/5 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-xs">取消政策说明</p>
              </div>
              <ul className="text-gray-500 text-xs space-y-1.5 pl-6">
                <li>• 提前 {CANCELLATION_POLICY.FREE_CANCEL_HOURS} 小时以上：免费取消</li>
                <li>• 提前 6-{CANCELLATION_POLICY.FREE_CANCEL_HOURS} 小时：收取 {Math.round(CANCELLATION_POLICY.PENALTY_RATE_BEFORE_24H * 100)}% 违约金</li>
                <li>• 提前不足 6 小时：收取 {Math.round(CANCELLATION_POLICY.PENALTY_RATE_BEFORE_6H * 100)}% 违约金</li>
                <li>• 预约已过期：收取 {Math.round(CANCELLATION_POLICY.PENALTY_RATE_LESS_6H * 100)}% 违约金</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="text-blood text-sm bg-blood/10 px-3 py-2 border border-blood/30">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline flex-1"
              >
                再想想
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex-1"
              >
                继续取消
              </button>
            </div>
          </div>
        ) : step === 'reason' ? (
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-gray-300 text-sm mb-3">
                请选择取消原因 <span className="text-blood">*</span>
              </label>
              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-3 border transition-all duration-200 ${
                      selectedReason === reason
                        ? 'bg-blood/20 border-blood text-white'
                        : 'bg-ink-300/30 border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {selectedReason === '其他原因' && (
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">
                  补充说明
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="请详细描述取消原因..."
                  rows={3}
                  className="w-full bg-ink-300/30 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-blood/50 transition-colors resize-none placeholder:text-gray-500"
                />
              </div>
            )}

            {cancellationInfo && cancellationInfo.penaltyAmount > 0 && (
              <div className="bg-blood/10 border border-blood/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">违约金</span>
                  <span className="text-blood text-lg font-bold">¥{cancellationInfo.penaltyAmount}</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="text-blood text-sm bg-blood/10 px-3 py-2 border border-blood/30">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline flex-1"
              >
                返回
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={!selectedReason || loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认取消
              </button>
            </div>
          </div>
        ) : step === 'processing' ? (
          <div className="p-10 text-center">
            <Loader2 className="w-10 h-10 text-blood animate-spin mx-auto mb-4" />
            <p className="text-white">正在取消预约...</p>
            <p className="text-gray-500 text-sm mt-1">请稍候</p>
          </div>
        ) : step === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">预约已取消</h3>
            <p className="text-gray-400 text-sm mb-2">{resultMessage}</p>
            {penaltyAmount > 0 && (
              <p className="text-blood text-sm mb-4">
                违约金金额：<span className="font-bold text-lg">¥{penaltyAmount}</span>
              </p>
            )}
            <p className="text-gray-500 text-xs mb-6">
              该时段已释放，其他用户可重新预约
            </p>
            <button onClick={handleClose} className="btn-primary px-8 py-2.5">
              完成
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
