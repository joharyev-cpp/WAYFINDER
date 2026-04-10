/**
 * BeaconCard — compact card shown in the HomeScreen list for each detected beacon.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { DetectedBeacon } from '../types';

interface Props {
  beacon: DetectedBeacon;
  onPress: () => void;
}

function signalBars(rssi: number): { bars: number; color: string; label: string } {
  if (rssi >= -55) return { bars: 4, color: '#2E7D32', label: 'Excellent' };
  if (rssi >= -65) return { bars: 3, color: '#558B2F', label: 'Bon' };
  if (rssi >= -75) return { bars: 2, color: '#F57F17', label: 'Moyen' };
  return { bars: 1, color: '#C62828', label: 'Faible' };
}

function formatDistance(m: number): string {
  if (m < 0)    return '—';
  if (m < 1)    return '< 1 m';
  if (m < 100)  return `~${Math.round(m)} m`;
  return `~${(m / 1000).toFixed(1)} km`;
}

export default function BeaconCard({ beacon, onPress }: Props) {
  const sig = signalBars(beacon.rssi);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBox, { backgroundColor: sig.color + '22' }]}>
        <Icon name="bluetooth-searching" size={26} color={sig.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.id} numberOfLines={1}>{beacon.id}</Text>
        <Text style={styles.meta}>
          {formatDistance(beacon.estimatedDistance)}  •  RSSI {beacon.rssi} dBm  •  {sig.label}
        </Text>
      </View>

      <View style={styles.bars}>
        {[1, 2, 3, 4].map(n => (
          <View
            key={n}
            style={[
              styles.bar,
              { height: 4 + n * 4, backgroundColor: n <= sig.bars ? sig.color : '#DDD' },
            ]}
          />
        ))}
      </View>

      <Icon name="chevron-right" size={20} color="#BBB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 5, borderRadius: 14, padding: 14, elevation: 1, gap: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info:    { flex: 1 },
  id:      { fontSize: 13, fontWeight: '600', color: '#222', fontFamily: 'monospace' },
  meta:    { fontSize: 12, color: '#888', marginTop: 2 },
  bars:    { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginRight: 4 },
  bar:     { width: 5, borderRadius: 2 },
});
