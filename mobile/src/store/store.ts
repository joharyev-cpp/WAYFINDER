import { configureStore } from '@reduxjs/toolkit';
import beaconReducer from './slices/beaconSlice';
import poiReducer    from './slices/poiSlice';

export const store = configureStore({
  reducer: {
    beacon: beaconReducer,
    poi:    poiReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
