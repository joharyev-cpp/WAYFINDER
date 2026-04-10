export type Country = 'MU' | 'MG';  // MU = Mauritius, MG = Madagascar

export type POICategory =
  | 'nature'
  | 'culture'
  | 'beach'
  | 'restaurant'
  | 'hotel'
  | 'market'
  | 'transport'
  | 'museum'
  | 'viewpoint'
  | 'park';

export interface POI {
  id: string;
  name: string;
  description: string;
  category: POICategory;
  country: Country;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string | null;
  audioGuideUrl: string | null;
  websiteUrl: string | null;
  openingHours: string | null;
  entryFee: string | null;
  languages: string[];  // stored as JSON
  createdAt: string;
  updatedAt: string;
}

export interface Beacon {
  id: string;           // UUID-MAJOR-MINOR
  uuid: string;
  major: number;
  minor: number;
  poiId: string;
  label: string;
  txPower: number;      // calibrated RSSI at 1 m
  active: boolean;
  installedAt: string | null;
  batteryLevel: number | null;
  createdAt: string;
}

export interface NearbyService {
  id: string;
  poiId: string;
  type: 'restaurant' | 'hotel' | 'taxi' | 'shop' | 'atm' | 'pharmacy' | 'wifi';
  name: string;
  description: string;
  phone: string | null;
  distanceMeters: number;
  priceRange: string | null;
}

export interface ContentBlock {
  id: string;
  poiId: string;
  lang: string;         // 'fr' | 'en' | 'mg' (Malagasy)
  title: string;
  body: string;
  type: 'text' | 'tip' | 'history' | 'promo';
}

export interface DetectionEvent {
  id: string;
  beaconId: string;
  rssi: number;
  estimatedDistanceMeters: number;
  deviceId: string;
  detectedAt: string;
}

// API response shapes
export interface BeaconContentResponse {
  beacon: Beacon;
  poi: POI;
  content: ContentBlock[];
  nearbyServices: NearbyService[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
