/**
 * NearbyServices — horizontal scrolling list of services near a POI.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NearbyService } from '../types';

const SERVICE_META: Record<string, { icon: string; color: string }> = {
  restaurant: { icon: 'restaurant',         color: '#C62828' },
  hotel:      { icon: 'hotel',              color: '#1565C0' },
  taxi:       { icon: 'local-taxi',         color: '#F57F17' },
  shop:       { icon: 'shopping-bag',       color: '#6A1B9A' },
  atm:        { icon: 'atm',               color: '#2E7D32' },
  pharmacy:   { icon: 'local-pharmacy',     color: '#00695C' },
  wifi:       { icon: 'wifi',              color: '#0277BD' },
};

function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

interface Props {
  services: NearbyService[];
}

export default function NearbyServices({ services }: Props) {
  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {services.map(svc => {
        const meta = SERVICE_META[svc.type] ?? { icon: 'place', color: '#1A73E8' };
        return (
          <TouchableOpacity
            key={svc.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => svc.phone && callPhone(svc.phone)}
          >
            <View style={[styles.iconBox, { backgroundColor: meta.color + '18' }]}>
              <Icon name={meta.icon} size={24} color={meta.color} />
            </View>
            <Text style={styles.name} numberOfLines={2}>{svc.name}</Text>
            <Text style={styles.distance}>{formatDistance(svc.distanceMeters)}</Text>
            {svc.priceRange && <Text style={styles.price}>{svc.priceRange}</Text>}
            {svc.phone && (
              <View style={styles.phoneRow}>
                <Icon name="phone" size={11} color="#888" />
                <Text style={styles.phone}>{svc.phone}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:   { paddingHorizontal: 16, paddingBottom: 4, gap: 10 },
  card:     { width: 140, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 1 },
  iconBox:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  name:     { fontSize: 13, fontWeight: '700', color: '#1A1A2E', lineHeight: 18, marginBottom: 4 },
  distance: { fontSize: 12, color: '#888' },
  price:    { fontSize: 12, color: '#555', fontWeight: '600', marginTop: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  phone:    { fontSize: 11, color: '#888' },
});
