import { create } from 'zustand';
import type { UserProfile } from '../../shared/types';
import { getUserProfile, updateUserProfile } from '../lib/api';

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserProfile, 'nickname' | 'avatar' | 'phone'>>) => Promise<{ success: boolean; message?: string }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: false,
  saving: false,

  fetchProfile: async () => {
    set({ loading: true });
    const profile = await getUserProfile();
    set({ profile, loading: false });
  },

  updateProfile: async (data) => {
    set({ saving: true });
    const result = await updateUserProfile(data);
    if (result.success && result.data) {
      set({ profile: result.data, saving: false });
      return { success: true };
    }
    set({ saving: false });
    return { success: false, message: result.message };
  },
}));
