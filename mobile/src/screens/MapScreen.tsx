/**
 * MapScreen — shows all registered POIs on a map.
 * Tapping a marker opens a bottom sheet with basic info.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Modal, ScrollView, Pressable,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { fetchAllPOIs, selectAllPOIs } from '../store/slices/poiSlice';
import type { POI } from '../types';
import type { AppDispatch } from '../store/store';

const CATEGORY_EMOJIS: Record<string, string> = {
  nature:    '🌿',
  culture:   '🏛️',
  beach:     '🏖️',
  museum:    '🎨',
  park:      '🌲',
  market:    '🛒',
  viewpoint: '🔭',
  restaurant:'🍽️',
  hotel:     '🏨',
  transport: '🚌',
};

// Default map region centred between Mauritius and Madagascar
const DEFAULT_REGION: Region = {
  latitude:  -18,
  longitude:  50,
  latitudeDelta:  18,
  longitudeDelta: 18,
};

export default function MapScreen() {
  const dispatch  = useDispatch<AppDispatch>();
  const allPOIs   = useSelector(selectAllPOIs);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<POI | null>(null);
  const [filter, setFilter]       = useState<'all' | 'MU' | 'MG'>('all');

  useEffect(() => {
    if (allPOIs.length === 0) {
      setLoading(true);
      dispatch(fetchAllPOIs()).finally(() => setLoading(false));
    }
  }, [dispatch, allPOIs.length]);

  const visiblePOIs = allPOIs.filter(p => filter === 'all' || p.country === filter);

  const getRegionForFilter = useCallback((f: typeof filter): Region => {
    if (f === 'MU') return { latitude: -20.25, longitude: 57.55, latitudeDelta: 1.2, longitudeDelta: 1.2 };
    if (f === 'MG') return { latitude: -18.9, longitude: 46.7, latitudeDelta: 14, longitudeDelta: 14 };
    return DEFAULT_REGION;
  }, []);

  const mapRef = React.useRef<MapView>(null);

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    mapRef.current?.animateToRegion(getRegionForFilter(f), 600);
  };

  return (
    <View style={styles.container}>
      {/* Filter bar */}
      <View style={styles.filterBar}>
        {(['all', 'MU', 'MG'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
              {f === 'all' ? 'Tous' : f === 'MU' ? '🇲🇺 Maurice' : '🇲🇬 Madagascar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#1A73E8" />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {visiblePOIs.map(poi => (
          <Marker
            key={poi.id}
            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
            title={poi.name}
            onPress={() => setSelected(poi)}
          >
            <View style={styles.markerBubble}>
              <Text style={styles.markerEmoji}>{CATEGORY_EMOJIS[poi.category] ?? '📍'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bottom sheet for selected POI */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetEmoji}>{CATEGORY_EMOJIS[selected.category] ?? '📍'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetName}>{selected.name}</Text>
                    <Text style={styles.sheetAddr}>{selected.address}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Icon name="close" size={22} color="#888" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.sheetDesc}>{selected.description}</Text>
                <View style={styles.sheetRow}>
                  {selected.openingHours && (
                    <View style={styles.sheetChip}>
                      <Icon name="access-time" size={13} color="#555" />
                      <Text style={styles.sheetChipText}>{selected.openingHours}</Text>
                    </View>
                  )}
                  {selected.entryFee && (
                    <View style={styles.sheetChip}>
                      <Icon name="confirmation-number" size={13} color="#555" />
                      <Text style={styles.sheetChipText}>{selected.entryFee}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  map:              { flex: 1 },
  filterBar:        { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  filterBtn:        { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, elevation: 3 },
  filterBtnActive:  { backgroundColor: '#1A73E8' },
  filterBtnText:    { fontSize: 13, fontWeight: '600', color: '#333' },
  filterBtnTextActive: { color: '#fff' },
  loaderOverlay:    { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 20, backgroundColor: 'rgba(255,255,255,0.6)' },

  markerBubble:     { backgroundColor: '#fff', borderRadius: 20, padding: 6, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 },
  markerEmoji:      { fontSize: 20 },

  modalBackdrop:    { flex: 1, justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  sheetHandle:      { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  sheetEmoji:       { fontSize: 32 },
  sheetName:        { fontSize: 17, fontWeight: '700', color: '#1A1A2E', flexShrink: 1 },
  sheetAddr:        { fontSize: 12, color: '#888', marginTop: 2 },
  sheetDesc:        { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 12 },
  sheetRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0F4F8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  sheetChipText:    { fontSize: 12, color: '#444' },
});
