import { useRef, useCallback, useState } from 'react';
import { Share2, Download, X, CheckCircle } from 'lucide-react';
import type { Booking, Artist } from '../../shared/types';
import { BOOKING_STATUS_LABELS } from '../../shared/types';

interface Props {
  open: boolean;
  booking: Booking | null;
  artist: Artist | null;
  onClose: () => void;
}

const CARD_WIDTH = 750;
const CARD_HEIGHT = 420;

function drawShareCard(
  ctx: CanvasRenderingContext2D,
  booking: Booking,
  artist: Artist,
): void {
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#0A0A0A');
  bgGrad.addColorStop(0.5, '#141414');
  bgGrad.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const topGlow = ctx.createRadialGradient(CARD_WIDTH / 2, 0, 0, CARD_WIDTH / 2, 0, 400);
  topGlow.addColorStop(0, 'rgba(185, 28, 28, 0.12)');
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, CARD_WIDTH, 300);

  const goldGlow = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT, 0, CARD_WIDTH / 2, CARD_HEIGHT, 300);
  goldGlow.addColorStop(0, 'rgba(212, 165, 116, 0.06)');
  goldGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, CARD_HEIGHT - 200, CARD_WIDTH, 200);

  ctx.strokeStyle = 'rgba(185, 28, 28, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, CARD_WIDTH - 56, CARD_HEIGHT - 56);

  const topLineGrad = ctx.createLinearGradient(40, 70, CARD_WIDTH - 40, 70);
  topLineGrad.addColorStop(0, 'transparent');
  topLineGrad.addColorStop(0.2, 'rgba(185, 28, 28, 0.6)');
  topLineGrad.addColorStop(0.5, 'rgba(212, 165, 116, 0.6)');
  topLineGrad.addColorStop(0.8, 'rgba(185, 28, 28, 0.6)');
  topLineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = topLineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 70);
  ctx.lineTo(CARD_WIDTH - 40, 70);
  ctx.stroke();

  ctx.font = '600 24px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = '#E5E5E5';
  ctx.textAlign = 'left';
  ctx.fillText('INK', 48, 55);
  ctx.fillStyle = '#B91C1C';
  ctx.fillText('MATCH', 106, 55);

  ctx.font = '300 14px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(229, 229, 229, 0.4)';
  ctx.textAlign = 'right';
  ctx.fillText('纹身师风格图谱与预约匹配平台', CARD_WIDTH - 48, 55);

  ctx.textAlign = 'left';
  ctx.font = '600 36px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(artist.name, 60, 130);

  const statusLabel = BOOKING_STATUS_LABELS[booking.status];
  const statusX = 60 + ctx.measureText(artist.name).width + 16;
  ctx.font = '500 13px "Noto Sans SC", system-ui, sans-serif';
  const badgeWidth = ctx.measureText(statusLabel).width + 24;
  const badgeY = 112;
  const badgeH = 28;

  ctx.fillStyle = 'rgba(185, 28, 28, 0.2)';
  ctx.beginPath();
  ctx.roundRect(statusX, badgeY, badgeWidth, badgeH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(185, 28, 28, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(statusX, badgeY, badgeWidth, badgeH, 4);
  ctx.stroke();

  ctx.font = '500 13px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = '#DC2626';
  ctx.textAlign = 'center';
  ctx.fillText(statusLabel, statusX + badgeWidth / 2, badgeY + 19);

  ctx.textAlign = 'left';

  const infoStartY = 180;
  const lineGap = 44;
  const labelX = 60;
  const valueX = 190;

  function drawInfoRow(y: number, label: string, value: string, valueColor = '#E5E5E5') {
    ctx.font = '400 15px "Noto Sans SC", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(229, 229, 229, 0.45)';
    ctx.fillText(label, labelX, y);

    ctx.font = '500 17px "Noto Sans SC", system-ui, sans-serif';
    ctx.fillStyle = valueColor;
    ctx.fillText(value, valueX, y);
  }

  drawInfoRow(infoStartY, '预约日期', booking.bookingDate);
  drawInfoRow(infoStartY + lineGap, '预约时段', booking.timeSlot, '#D4A574');
  drawInfoRow(infoStartY + lineGap * 2, '纹身风格', booking.style, '#DC2626');
  drawInfoRow(infoStartY + lineGap * 3, '纹身位置', booking.size);

  const bottomLineGrad = ctx.createLinearGradient(40, CARD_HEIGHT - 90, CARD_WIDTH - 40, CARD_HEIGHT - 90);
  bottomLineGrad.addColorStop(0, 'transparent');
  bottomLineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  bottomLineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = bottomLineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, CARD_HEIGHT - 90);
  ctx.lineTo(CARD_WIDTH - 40, CARD_HEIGHT - 90);
  ctx.stroke();

  ctx.font = '400 12px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(229, 229, 229, 0.25)';
  ctx.textAlign = 'left';
  ctx.fillText('预约编号：' + booking.id, 48, CARD_HEIGHT - 50);

  ctx.textAlign = 'right';
  ctx.font = '500 13px "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(212, 165, 116, 0.6)';
  ctx.fillText('INKMATCH · 发现属于你的纹身艺术', CARD_WIDTH - 48, CARD_HEIGHT - 50);
}

export function BookingShareCard({ open, booking, artist, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!booking || !artist) return;

    setGenerating(true);
    setImageDataUrl(null);
    setShared(false);

    await document.fonts.ready;

    const canvas = canvasRef.current;
    if (!canvas) {
      setGenerating(false);
      return;
    }

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setGenerating(false);
      return;
    }

    drawShareCard(ctx, booking, artist);

    const dataUrl = canvas.toDataURL('image/png');
    setImageDataUrl(dataUrl);
    setGenerating(false);
  }, [booking, artist]);

  const handleDownload = useCallback(() => {
    if (!imageDataUrl) return;

    const link = document.createElement('a');
    link.download = `INKMATCH-预约分享-${booking?.id || 'booking'}.png`;
    link.href = imageDataUrl;
    link.click();
  }, [imageDataUrl, booking]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || !booking) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current!.toBlob(resolve, 'image/png');
      });

      if (!blob) return;

      const file = new File([blob], 'INKMATCH-预约分享.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'INKMATCH 预约分享',
          text: `我预约了纹身师${artist?.name || ''}，${booking.bookingDate} ${booking.timeSlot}`,
          files: [file],
        });
        setShared(true);
      } else {
        handleDownload();
        setShared(true);
      }
    } catch {
      handleDownload();
      setShared(true);
    }
  }, [booking, artist, handleDownload]);

  const handleClose = () => {
    setImageDataUrl(null);
    setShared(false);
    onClose();
  };

  if (!open || !booking || !artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg bg-ink-200 border border-white/10 animate-slide-up overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blood via-gold to-blood" />

        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-display text-xl text-white">分享预约</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              生成分享卡片，分享给好友
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!imageDataUrl ? (
            <div className="text-center py-8">
              <div className="bg-graphite border border-white/5 p-6 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full border border-white/10"
                  />
                  <div>
                    <h3 className="text-white font-medium">{artist.name}</h3>
                    <p className="text-gray-500 text-sm">{artist.styles.join(' · ')}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">预约日期</span>
                    <span className="text-white">{booking.bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">预约时段</span>
                    <span className="text-gold">{booking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">纹身风格</span>
                    <span className="text-blood">{booking.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">纹身位置</span>
                    <span className="text-white">{booking.size}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary px-8 py-3 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {generating ? (
                  <>生成中...</>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    生成分享卡片
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-graphite border border-white/5 p-3 mb-5 overflow-hidden">
                <img
                  src={imageDataUrl}
                  alt="分享卡片"
                  className="w-full h-auto"
                />
              </div>

              {shared && (
                <div className="mb-4 flex items-center justify-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>分享成功</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-outline flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  保存图片
                </button>
                <button
                  onClick={handleShare}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  分享
                </button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
