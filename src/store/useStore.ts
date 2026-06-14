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

const FILTERS_STORAGE_KEY = 'inkmatch_home_filters';

const loadFiltersFromStorage = (): ArtistQuery => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const result: ArtistQuery = {};
    if (parsed.styles && Array.isArray(parsed.styles) && parsed.styles.length > 0) {
      result.styles = parsed.styles;
    }
    if (parsed.region && typeof parsed.region === 'string') {
      result.region = parsed.region;
    }
    if (typeof parsed.priceMin === 'number' && !isNaN(parsed.priceMin)) {
      result.priceMin = parsed.priceMin;
    }
    if (typeof parsed.priceMax === 'number' && !isNaN(parsed.priceMax)) {
      result.priceMax = parsed.priceMax;
    }
    if (parsed.keyword && typeof parsed.keyword === 'string') {
      result.keyword = parsed.keyword;
    }
    return result;
  } catch {
    return {};
  }
};

const saveFiltersToStorage = (filters: ArtistQuery) => {
  if (typeof window === 'undefined') return;
  try {
    const hasAnyFilter =
      (filters.styles && filters.styles.length > 0) ||
      filters.region ||
      typeof filters.priceMin === 'number' ||
      typeof filters.priceMax === 'number' ||
      filters.keyword;
    if (hasAnyFilter) {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } else {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

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
  resetFilters: () => void;
  toggleFavorite: (artistId: string) => Promise<boolean>;
  isFavorite: (artistId: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  artists: [],
  styles: [],
  regions: [],
  favorites: [],
  loading: false,
  filters: loadFiltersFromStorage(),

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
    const next = { ...get().filters, ...filters };
    set({ filters: next });
    saveFiltersToStorage(next);
  },

  resetFilters: () => {
    set({ filters: {} });
    saveFiltersToStorage({});
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
