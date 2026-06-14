import { BOOKING_STATUS_LABELS, BOOKING_STATUS_FLOW, type BookingStatus } from '../../shared/types';
import { Check, Clock } from 'lucide-react';

interface Props {
  currentStatus: BookingStatus;
}

export function BookingStatusTimeline({ currentStatus }: Props) {
  const currentIndex = BOOKING_STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500 transition-all duration-500 -z-10"
          style={{
            width: isCancelled
              ? '0%'
              : `${currentIndex >= 0 ? (currentIndex / (BOOKING_STATUS_FLOW.length - 1)) * 100 : 0}%`,
          }}
        />

        {BOOKING_STATUS_FLOW.map((status, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isCancelledState = isCancelled;

          return (
            <div key={status} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive && !isCancelledState
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                    : 'bg-ink-200 border-white/20 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center whitespace-nowrap ${
                  isActive && !isCancelledState
                    ? 'text-white font-medium'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {BOOKING_STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>该预约已取消</span>
        </div>
      )}
    </div>
  );
}
