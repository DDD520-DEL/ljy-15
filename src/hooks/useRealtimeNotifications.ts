import { useState, useEffect, useRef, useCallback } from 'react';
import type { Notification } from '../../shared/types';
import { getNotifications, listenNotificationUpdates, markNotificationRead, markAllNotificationsRead } from '../lib/api';

interface UseRealtimeNotificationsOptions {
  contact?: string;
  artistId?: string;
  enabled?: boolean;
  pollInterval?: number;
}

interface UseRealtimeNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasUpdates: boolean;
  lastUpdated: number;
  refresh: () => Promise<void>;
  dismissUpdates: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useRealtimeNotifications({
  contact,
  artistId,
  enabled = true,
  pollInterval = 2000,
}: UseRealtimeNotificationsOptions = {}): UseRealtimeNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const lastTimestampRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  const mergeNotifications = useCallback((existing: Notification[], updates: Notification[]): Notification[] => {
    const map = new Map(existing.map(n => [n.id, n]));
    updates.forEach(n => map.set(n.id, n));
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getNotifications(contact, artistId);
      setNotifications(result.data);
      setUnreadCount(result.data.filter(n => !n.read).length);
      lastTimestampRef.current = result.timestamp;
      setLastUpdated(result.timestamp);
      setHasUpdates(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
      initialFetchDoneRef.current = true;
    }
  }, [contact, artistId, enabled]);

  const dismissUpdates = useCallback(() => {
    setHasUpdates(false);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead(contact, artistId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('标记全部已读失败:', err);
    }
  }, [contact, artistId]);

  const listenLoop = useCallback(async () => {
    if (!enabled || pollingRef.current) return;

    pollingRef.current = true;

    while (pollingRef.current && enabled) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      try {
        const result = await listenNotificationUpdates(
          lastTimestampRef.current,
          contact,
          artistId
        );

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (result.hasUpdates && result.data.length > 0) {
          setNotifications(prev => mergeNotifications(prev, result.data));
          setUnreadCount(result.unreadCount);
          setLastUpdated(result.timestamp);
          setHasUpdates(true);
        } else if (result.hasUpdates) {
          setUnreadCount(result.unreadCount);
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
  }, [contact, artistId, enabled, pollInterval, mergeNotifications]);

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

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasUpdates,
    lastUpdated,
    refresh,
    dismissUpdates,
    markAsRead,
    markAllAsRead,
  };
}
