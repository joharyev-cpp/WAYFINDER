/**
 * ApiService — HTTP client for the WAYFINDER backend.
 *
 * Base URL is set via the API_BASE_URL env var (React Native metro bundler
 * reads from .env via react-native-config, or you can hardcode for development).
 */

import type { BeaconContentResponse, POI, ApiResponse } from '../types';

// Change this to your server URL in production
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://10.0.2.2:3001/api'; // 10.0.2.2 = Android emulator → host

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  const json = await response.json() as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? 'Unknown API error');
  }
  return json.data;
}

export const ApiService = {
  /** Fetch all content for a beacon (main mobile flow) */
  getBeaconContent(beaconId: string, lang = 'fr'): Promise<BeaconContentResponse> {
    return request<BeaconContentResponse>(`/beacon/${encodeURIComponent(beaconId)}?lang=${lang}`);
  },

  /** List all POIs (for the map screen) */
  getPOIs(filters?: { country?: string; category?: string }): Promise<POI[]> {
    const params = new URLSearchParams();
    if (filters?.country)  params.set('country',  filters.country);
    if (filters?.category) params.set('category', filters.category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<POI[]>(`/pois${qs}`);
  },

  /** Get one POI's full details */
  getPOIDetail(poiId: string): Promise<BeaconContentResponse> {
    return request<BeaconContentResponse>(`/pois/${encodeURIComponent(poiId)}`);
  },

  /** Record a beacon detection for analytics (fire-and-forget) */
  recordDetection(beaconId: string, rssi: number, distance: number, deviceId: string): void {
    request<{ id: string }>('/beacon/detect', {
      method: 'POST',
      body: JSON.stringify({ beaconId, rssi, estimatedDistanceMeters: distance, deviceId }),
    }).catch(err => console.warn('[API] Failed to record detection:', err));
  },
};

export default ApiService;
