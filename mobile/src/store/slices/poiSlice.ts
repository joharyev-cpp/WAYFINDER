import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { POIState, BeaconContentResponse, POI } from '../../types';
import ApiService from '../../services/ApiService';
import CacheService from '../../services/CacheService';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchBeaconContent = createAsyncThunk(
  'poi/fetchBeaconContent',
  async ({ beaconId, lang = 'fr' }: { beaconId: string; lang?: string }) => {
    // Try network first, fall back to cache
    try {
      const data = await ApiService.getBeaconContent(beaconId, lang);
      await CacheService.setBeaconContent(beaconId, data);
      return data;
    } catch {
      const cached = await CacheService.getBeaconContent(beaconId);
      if (cached) return cached;
      throw new Error('No content available — check your connection.');
    }
  },
);

export const fetchAllPOIs = createAsyncThunk('poi/fetchAllPOIs', async () => {
  try {
    const pois = await ApiService.getPOIs();
    await CacheService.setPOIList(pois);
    return pois;
  } catch {
    const cached = await CacheService.getPOIList();
    if (cached) return cached;
    throw new Error('Cannot load POI list — check your connection.');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const initialState: POIState = {
  currentPOIData: null,
  loading: false,
  error: null,
  allPOIs: [],
};

const poiSlice = createSlice({
  name: 'poi',
  initialState,
  reducers: {
    clearCurrentPOI(state) {
      state.currentPOIData = null;
      state.error = null;
    },
    setAllPOIs(state, action: PayloadAction<POI[]>) {
      state.allPOIs = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBeaconContent.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeaconContent.fulfilled, (state, action: PayloadAction<BeaconContentResponse>) => {
        state.loading = false;
        state.currentPOIData = action.payload;
      })
      .addCase(fetchBeaconContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(fetchAllPOIs.fulfilled, (state, action: PayloadAction<POI[]>) => {
        state.allPOIs = action.payload;
      });
  },
});

export const { clearCurrentPOI, setAllPOIs } = poiSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentPOI   = (s: { poi: POIState }) => s.poi.currentPOIData;
export const selectPOILoading   = (s: { poi: POIState }) => s.poi.loading;
export const selectPOIError     = (s: { poi: POIState }) => s.poi.error;
export const selectAllPOIs      = (s: { poi: POIState }) => s.poi.allPOIs;

export default poiSlice.reducer;
