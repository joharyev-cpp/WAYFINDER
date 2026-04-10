// ─── Domain types (mirrored from backend) ───────────────────────────────────

export type Country = 'MU' | 'MG';

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
  languages: string[];
}

export interface Beacon {
  id: string;
  uuid: string;
  major: number;
  minor: number;
  poiId: string;
  label: string;
  txPower: number;
  active: boolean;
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
  lang: string;
  title: string;
  body: string;
  type: 'text' | 'tip' | 'history' | 'promo';
}

export interface BeaconContentResponse {
  beacon: Beacon;
  poi: POI;
  content: ContentBlock[];
  nearbyServices: NearbyService[];
}

// ─── BLE ─────────────────────────────────────────────────────────────────────

export interface DetectedBeacon {
  id: string;           // UUID-MAJOR-MINOR
  uuid: string;
  major: number;
  minor: number;
  rssi: number;
  txPower: number;
  estimatedDistance: number;
  deviceName: string | null;
  lastSeen: number;     // Date.now()
}

export interface IBeaconData {
  uuid: string;
  major: number;
  minor: number;
  txPower: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  POIDetail: { beaconId: string };
  Map: undefined;
  Settings: undefined;
};

// ─── Redux state ─────────────────────────────────────────────────────────────

export interface BeaconState {
  isScanning: boolean;
  detectedBeacons: DetectedBeacon[];
  lastTriggeredBeaconId: string | null;
  cooldowns: Record<string, number>;  // beaconId → timestamp of last trigger
  bluetoothState: 'unknown' | 'off' | 'on' | 'unauthorized';
}

export interface POIState {
  currentPOIData: BeaconContentResponse | null;
  loading: boolean;
  error: string | null;
  allPOIs: POI[];
}
