import { create } from 'zustand';
import type { Notification } from '../../shared/types';
import {
  getNotifications,
  getUnreadNotificationCount,
  listenNotificationUpdates,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  contact: string | null;
  artistId: string | null;
  lastTimestamp: number;
  hasUpdates: boolean;
  setUser: (contact?: string, artistId?: string) => void;
  clearUser: () => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissUpdates: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let abortController: AbortController | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  contact: null,
  artistId: null,
  lastTimestamp: 0,
  hasUpdates: false,

  setUser: (contact?: string, artistId?: string) => {
    set({ contact: contact || null, artistId: artistId || null });
    get().fetchNotifications();
    get().startListening();
  },

  clearUser: () => {
    get().stopListening();
    set({
      notifications: [],
      unreadCount: 0,
      contact: null,
      artistId: null,
      lastTimestamp: 0,
    });
  },

  fetchNotifications: async () => {
    const { contact, artistId } = get();
    if (!contact && !artistId) return;

    set({ loading: true });
    try {
      const result = await getNotifications(contact || undefined, artistId || undefined);
      set({
        notifications: result.data,
        unreadCount: result.data.filter(n => !n.read).length,
        lastTimestamp: result.timestamp,
      });
    } catch (err) {
      console.error('获取通知失败:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    const { contact, artistId } = get();
    if (!contact && !artistId) return;

    try {
      const count = await getUnreadNotificationCount(contact || undefined, artistId || undefined);
      set({ unreadCount: count });
    } catch (err) {
      console.error('获取未读数量失败:', err);
    }
  },

  startListening: () => {
    const { contact, artistId } = get();
    if (!contact && !artistId) return;

    get().stopListening();
    abortController = new AbortController();

    const poll = async () => {
      if (!abortController || abortController.signal.aborted) return;

      try {
        const result = await listenNotificationUpdates(
          get().lastTimestamp,
          contact || undefined,
          artistId || undefined
        );

        if (abortController.signal.aborted) return;

        if (result.hasUpdates && result.data.length > 0) {
          const map = new Map(get().notifications.map(n => [n.id, n]));
          result.data.forEach(n => map.set(n.id, n));
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          set({
            notifications: merged,
            unreadCount: result.unreadCount,
            lastTimestamp: result.timestamp,
            hasUpdates: true,
          });
        } else if (result.hasUpdates) {
          set({
            unreadCount: result.unreadCount,
            lastTimestamp: result.timestamp,
            hasUpdates: true,
          });
        } else {
          set({ lastTimestamp: result.timestamp });
        }
      } catch (err) {
        if (!abortController?.signal.aborted) {
          console.error('监听通知更新失败:', err);
        }
      }
    };

    pollingInterval = setInterval(poll, 3000);
  },

  stopListening: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  },

  markAsRead: async (id: string) => {
    try {
      await markNotificationRead(id);
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  },

  markAllAsRead: async () => {
    const { contact, artistId } = get();
    try {
      await markAllNotificationsRead(contact || undefined, artistId || undefined);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('标记全部已读失败:', err);
    }
  },

  dismissUpdates: () => {
    set({ hasUpdates: false });
  },
}));
