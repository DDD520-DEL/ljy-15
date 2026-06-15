import { create } from 'zustand';
import type { Artist, Style, ArtistQuery, BrowseHistoryItem, SortBy, SortOrder } from '../../shared/types';
import {
  getArtists,
  getStyles,
  getRegions,
  getFavorites,
  addFavorite,
  removeFavorite,
  recordBrowse,
  getRecommendations,
  getBrowseHistory,
  removeBrowseHistory,
  clearBrowseHistory,
} from '../lib/api';

const FILTERS_STORAGE_KEY = 'inkmatch_home_filters';

const validSortByValues: SortBy[] = ['rating', 'popularity', 'price'];
const validSortOrderValues: SortOrder[] = ['asc', 'desc'];

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
    if (parsed.sortBy && validSortByValues.includes(parsed.sortBy)) {
      result.sortBy = parsed.sortBy;
    }
    if (parsed.sortOrder && validSortOrderValues.includes(parsed.sortOrder)) {
      result.sortOrder = parsed.sortOrder;
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
      filters.keyword ||
      filters.sortBy ||
      filters.sortOrder;
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
  browseHistory: BrowseHistoryItem[];
  loading: boolean;
  browseHistoryLoading: boolean;
  filters: ArtistQuery;
  recommendedArtists: Artist[];
  recommendedBasedOnStyles: string[];
  recommendationsLoading: boolean;
  fetchArtists: () => Promise<void>;
  fetchStyles: () => Promise<void>;
  fetchRegions: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchBrowseHistory: () => Promise<void>;
  setFilters: (filters: Partial<ArtistQuery>) => void;
  resetFilters: () => void;
  toggleFavorite: (artistId: string) => Promise<boolean>;
  isFavorite: (artistId: string) => boolean;
  recordArtistBrowse: (artistId: string) => Promise<void>;
  fetchRecommendations: (limit?: number) => Promise<void>;
  removeBrowseHistoryItem: (artistId: string) => Promise<boolean>;
  clearAllBrowseHistory: () => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  artists: [],
  styles: [],
  regions: [],
  favorites: [],
  browseHistory: [],
  loading: false,
  browseHistoryLoading: false,
  filters: loadFiltersFromStorage(),
  recommendedArtists: [],
  recommendedBasedOnStyles: [],
  recommendationsLoading: false,

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

  fetchBrowseHistory: async () => {
    set({ browseHistoryLoading: true });
    const history = await getBrowseHistory();
    set({ browseHistory: history, browseHistoryLoading: false });
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

  recordArtistBrowse: async (artistId) => {
    await recordBrowse(artistId);
  },

  fetchRecommendations: async (limit = 8) => {
    set({ recommendationsLoading: true });
    const result = await getRecommendations(limit);
    set({
      recommendedArtists: result.artists,
      recommendedBasedOnStyles: result.basedOnStyles,
      recommendationsLoading: false,
    });
  },

  removeBrowseHistoryItem: async (artistId) => {
    const success = await removeBrowseHistory(artistId);
    if (success) {
      await get().fetchBrowseHistory();
    }
    return success;
  },

  clearAllBrowseHistory: async () => {
    const success = await clearBrowseHistory();
    if (success) {
      await get().fetchBrowseHistory();
    }
    return success;
  },
}));
