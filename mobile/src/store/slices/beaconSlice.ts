import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BeaconState, DetectedBeacon } from '../../types';
import { COOLDOWN_MS } from '../../services/BLEService';

const initialState: BeaconState = {
  isScanning: false,
  detectedBeacons: [],
  lastTriggeredBeaconId: null,
  cooldowns: {},
  bluetoothState: 'unknown',
};

const beaconSlice = createSlice({
  name: 'beacon',
  initialState,
  reducers: {
    setScanningStatus(state, action: PayloadAction<boolean>) {
      state.isScanning = action.payload;
    },

    setBluetoothState(state, action: PayloadAction<BeaconState['bluetoothState']>) {
      state.bluetoothState = action.payload;
    },

    beaconDetected(state, action: PayloadAction<DetectedBeacon>) {
      const beacon = action.payload;
      const idx = state.detectedBeacons.findIndex(b => b.id === beacon.id);
      if (idx >= 0) {
        state.detectedBeacons[idx] = beacon;
      } else {
        state.detectedBeacons.push(beacon);
      }
    },

    triggerBeacon(state, action: PayloadAction<string>) {
      const beaconId = action.payload;
      state.lastTriggeredBeaconId = beaconId;
      state.cooldowns[beaconId] = Date.now();
    },

    pruneStaleBeacons(state) {
      const staleThreshold = Date.now() - 10_000; // 10 s without update = gone
      state.detectedBeacons = state.detectedBeacons.filter(
        b => b.lastSeen > staleThreshold,
      );
    },

    clearBeacons(state) {
      state.detectedBeacons = [];
      state.lastTriggeredBeaconId = null;
    },
  },
});

export const {
  setScanningStatus,
  setBluetoothState,
  beaconDetected,
  triggerBeacon,
  pruneStaleBeacons,
  clearBeacons,
} = beaconSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectIsScanning = (s: { beacon: BeaconState }) => s.beacon.isScanning;
export const selectDetectedBeacons = (s: { beacon: BeaconState }) => s.beacon.detectedBeacons;
export const selectBluetoothState = (s: { beacon: BeaconState }) => s.beacon.bluetoothState;

/** Returns true if this beacon is within its cooldown window (already triggered recently) */
export const selectIsOnCooldown = (beaconId: string) => (s: { beacon: BeaconState }) => {
  const ts = s.beacon.cooldowns[beaconId];
  return ts !== undefined && Date.now() - ts < COOLDOWN_MS;
};

export default beaconSlice.reducer;
