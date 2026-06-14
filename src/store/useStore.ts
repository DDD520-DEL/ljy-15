import { create } from 'zustand';
import type { Artist, Style, ArtistQuery } from '../../shared/types';
import {
  getArtists,
  getStyles,
  getRegions,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../lib/api';

interface AppState {
  artists: Artist[];
  styles: Style[];
  regions: string[];
  favorites: Artist[];
  loading: boolean;
  filters: ArtistQuery;
  fetchArtists: () => Promise<void>;
  fetchStyles: () => Promise<void>;
  fetchRegions: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  setFilters: (filters: Partial<ArtistQuery>) => void;
  toggleFavorite: (artistId: string) => Promise<boolean>;
  isFavorite: (artistId: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  artists: [],
  styles: [],
  regions: [],
  favorites: [],
  loading: false,
  filters: {},

  fetchArtists: async () => {
    set({ loading: true });
    const artists = await getArtists(get().filters);
    set({ artists, loading: false });
  },

  fetchStyles: async () => {
    const styles = await getStyles();
    set({ styles });
  },

  fetchRegions: async () => {
    const regions = await getRegions();
    set({ regions });
  },

  fetchFavorites: async () => {
    const favorites = await getFavorites();
    set({ favorites });
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  toggleFavorite: async (artistId) => {
    const isFav = get().isFavorite(artistId);
    let success: boolean;
    if (isFav) {
      success = await removeFavorite(artistId);
    } else {
      success = await addFavorite(artistId);
    }
    if (success) {
      await get().fetchFavorites();
    }
    return success;
  },

  isFavorite: (artistId) => {
    return get().favorites.some(a => a.id === artistId);
  },
}));
