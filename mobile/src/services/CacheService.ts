/**
 * CacheService — Offline-first cache using AsyncStorage.
 *
 * POI content is pre-fetched and stored so the app works with limited
 * connectivity (common in remote sites in Madagascar).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BeaconContentResponse, POI } from '../types';

const CACHE_VERSION = '1';
const PREFIX = `@wayfinder:v${CACHE_VERSION}:`;
const BEACON_TTL_MS  = 24 * 60 * 60 * 1000; // 24 hours
const POI_LIST_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

async function set<T>(key: string, data: T, ttl: number): Promise<void> {
  const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
}

async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
  if (!raw) return null;
  const entry = JSON.parse(raw) as CacheEntry<T>;
  if (Date.now() - entry.cachedAt > entry.ttl) {
    await AsyncStorage.removeItem(PREFIX + key);
    return null;
  }
  return entry.data;
}

export const CacheService = {
  async setBeaconContent(beaconId: string, data: BeaconContentResponse): Promise<void> {
    await set(`beacon:${beaconId}`, data, BEACON_TTL_MS);
  },

  async getBeaconContent(beaconId: string): Promise<BeaconContentResponse | null> {
    return get<BeaconContentResponse>(`beacon:${beaconId}`);
  },

  async setPOIList(pois: POI[]): Promise<void> {
    await set('pois:all', pois, POI_LIST_TTL_MS);
  },

  async getPOIList(): Promise<POI[] | null> {
    return get<POI[]>('pois:all');
  },

  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter(k => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(ours);
  },

  async getCacheSize(): Promise<{ entries: number; sizeKB: number }> {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter(k => k.startsWith(PREFIX));
    const pairs = await AsyncStorage.multiGet(ours);
    const sizeBytes = pairs.reduce((sum, [, v]) => sum + (v?.length ?? 0), 0);
    return { entries: ours.length, sizeKB: Math.round(sizeBytes / 1024) };
  },
};

export default CacheService;
