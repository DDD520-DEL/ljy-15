import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type BookingStatus } from '../../shared/types';
import { cn } from '../lib/utils';

interface Props {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export function BookingStatusBadge({ status, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 border rounded-full font-medium',
        BOOKING_STATUS_COLORS[status],
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
