export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface POI {
  id: string;
  name: string;
  country: 'MU' | 'MG';
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string | null;
  entryFee: string | null;
}

export interface Beacon {
  id: string;
  uuid: string;
  major: number;
  minor: number;
  poi_id: string;
  poi_name?: string;
  country?: string;
  category?: string;
  label: string;
  tx_power: number;
  active: number;  // 0 | 1
  installed_at: string | null;
  battery_level: number | null;
  created_at: string;
}

export interface NearbyService {
  id: string;
  poi_id: string;
  poi_name?: string;
  country?: string;
  type: string;
  name: string;
  description: string;
  phone: string | null;
  distance_meters: number;
  price_range: string | null;
}

export interface Stats {
  totalPOIs: number;
  totalBeacons: number;
  activeBeacons: number;
  totalServices: number;
  totalDetections: number;
  todayDetections: number;
  weekDetections: number;
  topPOIs: { name: string; country: string; detections: number }[];
  recentDetections: { detected_at: string; rssi: number; beacon_label: string; poi_name: string }[];
}

export interface BeaconContent {
  beacon: Beacon;
  poi: POI;
  content: { id: string; lang: string; title: string; body: string; type: string }[];
  nearbyServices: NearbyService[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
