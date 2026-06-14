import { useState, useEffect, useRef, useCallback } from 'react';
import type { Booking, BookingStatus } from '../../shared/types';
import { getBookings, listenBookingUpdates } from '../lib/api';

interface UseRealtimeBookingsOptions {
  contact?: string;
  artistId?: string;
  status?: BookingStatus;
  enabled?: boolean;
  pollInterval?: number;
}

interface UseRealtimeBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  hasUpdates: boolean;
  lastUpdated: number;
  refresh: () => Promise<void>;
  dismissUpdates: () => void;
}

export function useRealtimeBookings({
  contact,
  artistId,
  status,
  enabled = true,
  pollInterval = 2000,
}: UseRealtimeBookingsOptions = {}): UseRealtimeBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const lastTimestampRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  const mergeBookings = useCallback((existing: Booking[], updates: Booking[]): Booking[] => {
    const map = new Map(existing.map(b => [b.id, b]));
    updates.forEach(b => map.set(b.id, b));
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, []);

  const filterByStatus = useCallback((all: Booking[], filterStatus?: BookingStatus): Booking[] => {
    if (!filterStatus) return all;
    return all.filter(b => b.status === filterStatus);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getBookings(contact, status, artistId);
      setBookings(result.data);
      lastTimestampRef.current = result.timestamp;
      setLastUpdated(result.timestamp);
      setHasUpdates(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
      initialFetchDoneRef.current = true;
    }
  }, [contact, artistId, status, enabled]);

  const dismissUpdates = useCallback(() => {
    setHasUpdates(false);
  }, []);

  const listenLoop = useCallback(async () => {
    if (!enabled || pollingRef.current) return;

    pollingRef.current = true;

    while (pollingRef.current && enabled) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      try {
        const result = await listenBookingUpdates(
          lastTimestampRef.current,
          contact,
          artistId
        );

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (result.hasUpdates && result.data.length > 0) {
          setBookings(prev => {
            const merged = mergeBookings(prev, result.data);
            return filterByStatus(merged, status);
          });
          setLastUpdated(result.timestamp);
          setHasUpdates(true);
        }

        lastTimestampRef.current = result.timestamp;
      } catch (err) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Long poll error:', err);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }

    pollingRef.current = false;
  }, [contact, artistId, status, enabled, pollInterval, mergeBookings, filterByStatus]);

  useEffect(() => {
    if (!enabled) return;

    abortControllerRef.current = new AbortController();

    refresh();

    return () => {
      abortControllerRef.current?.abort();
      pollingRef.current = false;
      initialFetchDoneRef.current = false;
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !initialFetchDoneRef.current) return;

    listenLoop();

    return () => {
      pollingRef.current = false;
    };
  }, [enabled, initialFetchDoneRef.current, listenLoop]);

  useEffect(() => {
    if (bookings.length > 0) {
      setBookings(prev => filterByStatus(prev, status));
    }
  }, [status, filterByStatus]);

  return {
    bookings,
    loading,
    error,
    hasUpdates,
    lastUpdated,
    refresh,
    dismissUpdates,
  };
}
