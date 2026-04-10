/**
 * HomeScreen — main scanner screen.
 *
 * Flow:
 *  1. Request Bluetooth + Location permissions on mount
 *  2. Start BLE scan
 *  3. When a new beacon is detected (and not on cooldown) → fetch content → navigate to POIDetail
 *  4. Show current scan status and list of recently detected beacons
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, Alert, AppState, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { State as BLEState } from 'react-native-ble-plx';

import bleService from '../services/BLEService';
import ApiService from '../services/ApiService';
import {
  setScanningStatus,
  setBluetoothState,
  beaconDetected,
  triggerBeacon,
  pruneStaleBeacons,
  selectIsScanning,
  selectDetectedBeacons,
  selectBluetoothState,
  selectIsOnCooldown,
} from '../store/slices/beaconSlice';
import { fetchBeaconContent } from '../store/slices/poiSlice';
import BeaconCard from '../components/BeaconCard';
import type { DetectedBeacon, RootStackParamList } from '../types';
import type { AppDispatch, RootState } from '../store/store';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Unique device ID (stable per install)
let DEVICE_ID = 'unknown';
try {
  DEVICE_ID = require('react-native').Platform.OS + '-' + Math.random().toString(36).slice(2);
} catch {}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const isScanning    = useSelector(selectIsScanning);
  const detectedBeacons = useSelector(selectDetectedBeacons);
  const bluetoothState  = useSelector(selectBluetoothState);
  const pruneInterval   = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState        = useRef(AppState.currentState);

  // ── Permissions ─────────────────────────────────────────────────────────────
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const perms = Platform.OS === 'android'
      ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]
      : [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];

    for (const perm of perms) {
      const status = await check(perm);
      if (status !== RESULTS.GRANTED) {
        const result = await request(perm);
        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Permission requise',
            'WAYFINDER nécessite Bluetooth et la localisation pour détecter les beacons.',
            [{ text: 'OK' }],
          );
          return false;
        }
      }
    }
    return true;
  }, []);

  // ── BLE state listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = bleService.onStateChange((state: BLEState) => {
      const map: Record<string, typeof bluetoothState> = {
        [BLEState.PoweredOn]:    'on',
        [BLEState.PoweredOff]:   'off',
        [BLEState.Unauthorized]: 'unauthorized',
      };
      dispatch(setBluetoothState(map[state] ?? 'unknown'));
    });
    return unsub;
  }, [dispatch]);

  // ── Start / stop scan on app state changes ───────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && appState.current !== 'active') {
        startScanning();
      } else if (nextState !== 'active') {
        bleService.stopScan();
        dispatch(setScanningStatus(false));
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Prune stale beacons every 5 s ───────────────────────────────────────────
  useEffect(() => {
    pruneInterval.current = setInterval(() => dispatch(pruneStaleBeacons()), 5000);
    return () => { if (pruneInterval.current) clearInterval(pruneInterval.current); };
  }, [dispatch]);

  // ── Initial scan startup ─────────────────────────────────────────────────────
  useEffect(() => {
    startScanning();
    return () => {
      bleService.stopScan();
      dispatch(setScanningStatus(false));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core scan logic ──────────────────────────────────────────────────────────
  const startScanning = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    dispatch(setScanningStatus(true));
    bleService.startScan(async (detected: DetectedBeacon) => {
      dispatch(beaconDetected(detected));
      handleBeaconTrigger(detected);
    });
  }, [dispatch, requestPermissions]);

  // Using a ref to have access to latest dispatch without re-creating the callback
  const handleBeaconTrigger = useCallback(
    async (detected: DetectedBeacon) => {
      // Check cooldown without causing re-render
      const state = (dispatch as unknown as { getState: () => RootState }).getState?.();
      const cooldownTs = state?.beacon?.cooldowns?.[detected.id];
      const onCooldown = cooldownTs !== undefined && Date.now() - cooldownTs < 5 * 60 * 1000;
      if (onCooldown) return;

      dispatch(triggerBeacon(detected.id));

      // Record detection for analytics
      ApiService.recordDetection(detected.id, detected.rssi, detected.estimatedDistance, DEVICE_ID);

      // Fetch content then navigate
      const result = await dispatch(fetchBeaconContent({ beaconId: detected.id }));
      if (fetchBeaconContent.fulfilled.match(result)) {
        navigation.navigate('POIDetail', { beaconId: detected.id });
      }
    },
    [dispatch, navigation],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>WAYFINDER</Text>
      <Text style={styles.subtitle}>Île Maurice & Madagascar</Text>
      <View style={styles.statusRow}>
        {isScanning
          ? <><ActivityIndicator size="small" color="#1A73E8" style={{ marginRight: 8 }} /><Text style={styles.statusOn}>Scan BLE actif</Text></>
          : <Text style={styles.statusOff}>Scan arrêté</Text>
        }
        {bluetoothState === 'off' && (
          <Text style={styles.warning}>  ⚠️ Bluetooth désactivé</Text>
        )}
      </View>
      {detectedBeacons.length > 0 && (
        <Text style={styles.sectionTitle}>Beacons détectés ({detectedBeacons.length})</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {detectedBeacons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyTitle}>En attente de beacons…</Text>
          <Text style={styles.emptyText}>
            Approchez-vous d'un point touristique équipé d'un beacon BLE pour déclencher automatiquement le guide.
          </Text>
          {!isScanning && (
            <TouchableOpacity style={styles.button} onPress={startScanning}>
              <Text style={styles.buttonText}>Démarrer le scan</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={detectedBeacons}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <BeaconCard
              beacon={item}
              onPress={() => {
                dispatch(triggerBeacon(item.id));
                dispatch(fetchBeaconContent({ beaconId: item.id })).then(result => {
                  if (fetchBeaconContent.fulfilled.match(result)) {
                    navigation.navigate('POIDetail', { beaconId: item.id });
                  }
                });
              }}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
      {detectedBeacons.length === 0 && renderHeader()}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F7FA' },
  header:      { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title:       { fontSize: 28, fontWeight: '800', color: '#1A1A2E', letterSpacing: 1 },
  subtitle:    { fontSize: 14, color: '#666', marginBottom: 12 },
  statusRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusOn:    { fontSize: 13, color: '#1A73E8', fontWeight: '600' },
  statusOff:   { fontSize: 13, color: '#999' },
  warning:     { fontSize: 13, color: '#E53935' },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginTop: 16 },
  list:        { paddingBottom: 80 },
  emptyState:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon:   { fontSize: 64, marginBottom: 20 },
  emptyTitle:  { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 12, textAlign: 'center' },
  emptyText:   { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  button:      { marginTop: 24, backgroundColor: '#1A73E8', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 25 },
  buttonText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
});
