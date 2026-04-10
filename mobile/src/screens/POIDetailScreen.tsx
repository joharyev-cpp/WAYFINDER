/**
 * POIDetailScreen — Rich content for a beacon-triggered POI.
 *
 * Displays:
 *  - POI name, category badge, opening hours, entry fee
 *  - Content blocks (history, tips, promos) in preferred language
 *  - Audio guide player
 *  - Nearby services list
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { selectCurrentPOI, selectPOILoading, selectPOIError } from '../store/slices/poiSlice';
import POIContent    from '../components/POIContent';
import AudioGuide    from '../components/AudioGuide';
import NearbyServices from '../components/NearbyServices';
import type { RootStackParamList } from '../types';

type RouteT = RouteProp<RootStackParamList, 'POIDetail'>;

const CATEGORY_COLORS: Record<string, string> = {
  nature:    '#2E7D32',
  culture:   '#6A1B9A',
  beach:     '#0277BD',
  museum:    '#E65100',
  park:      '#2E7D32',
  market:    '#F57F17',
  viewpoint: '#00838F',
  restaurant:'#C62828',
  hotel:     '#1565C0',
  transport: '#424242',
};

const CATEGORY_LABELS: Record<string, string> = {
  nature:    'Nature',
  culture:   'Culture & Histoire',
  beach:     'Plage',
  museum:    'Musée',
  park:      'Parc National',
  market:    'Marché',
  viewpoint: 'Belvédère',
  restaurant:'Restaurant',
  hotel:     'Hébergement',
  transport: 'Transport',
};

export default function POIDetailScreen() {
  const route  = useRoute<RouteT>();
  const data   = useSelector(selectCurrentPOI);
  const loading = useSelector(selectPOILoading);
  const error  = useSelector(selectPOIError);
  const [activeLang, setActiveLang] = useState('fr');

  useEffect(() => {
    if (data?.poi?.languages?.includes('fr')) setActiveLang('fr');
    else if (data?.poi?.languages?.[0]) setActiveLang(data.poi.languages[0]);
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text style={styles.loadingText}>Chargement du contenu…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error ?? 'Contenu non disponible.'}</Text>
      </View>
    );
  }

  const { poi, content, nearbyServices, beacon } = data;
  const filteredContent = content.filter(c => c.lang === activeLang);
  const color = CATEGORY_COLORS[poi.category] ?? '#1A73E8';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Hero banner */}
      <View style={[styles.hero, { backgroundColor: color }]}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{CATEGORY_LABELS[poi.category] ?? poi.category}</Text>
        </View>
        <Text style={styles.heroTitle}>{poi.name}</Text>
        <Text style={styles.heroAddress}>{poi.address}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaItem}>
            {poi.country === 'MU' ? '🇲🇺 Île Maurice' : '🇲🇬 Madagascar'}
          </Text>
          {beacon && (
            <Text style={styles.heroMetaItem}>
              📡 ~{Math.round(beacon.txPower ? -1 : 5)} m
            </Text>
          )}
        </View>
      </View>

      {/* Info chips */}
      <View style={styles.chips}>
        {poi.openingHours && (
          <View style={styles.chip}>
            <Icon name="access-time" size={14} color="#555" />
            <Text style={styles.chipText}>{poi.openingHours}</Text>
          </View>
        )}
        {poi.entryFee && (
          <View style={styles.chip}>
            <Icon name="confirmation-number" size={14} color="#555" />
            <Text style={styles.chipText}>{poi.entryFee}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.description}>{poi.description}</Text>
      </View>

      {/* Language selector */}
      {(poi.languages?.length ?? 0) > 1 && (
        <View style={styles.langRow}>
          {poi.languages.map(lang => (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, activeLang === lang && { backgroundColor: color }]}
              onPress={() => setActiveLang(lang)}
            >
              <Text style={[styles.langBtnText, activeLang === lang && { color: '#fff' }]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Audio guide */}
      {poi.audioGuideUrl && (
        <AudioGuide url={poi.audioGuideUrl} title={`Audio — ${poi.name}`} />
      )}

      {/* Content blocks */}
      {filteredContent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guide</Text>
          {filteredContent.map(block => (
            <POIContent key={block.id} block={block} accentColor={color} />
          ))}
        </View>
      )}

      {/* Nearby services */}
      {nearbyServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À proximité</Text>
          <NearbyServices services={nearbyServices} />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F5F7FA' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText:   { marginTop: 12, color: '#666', fontSize: 15 },
  errorIcon:     { fontSize: 48, marginBottom: 12 },
  errorText:     { fontSize: 16, color: '#555', textAlign: 'center' },

  hero:          { paddingTop: 80, paddingBottom: 28, paddingHorizontal: 20, minHeight: 220 },
  heroOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroBadge:     { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroTitle:     { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroAddress:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10 },
  heroMeta:      { flexDirection: 'row', gap: 16 },
  heroMetaItem:  { fontSize: 13, color: 'rgba(255,255,255,0.9)' },

  chips:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6, elevation: 1 },
  chipText:      { fontSize: 12, color: '#333' },

  section:       { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 12, marginTop: 8 },
  description:   { fontSize: 15, color: '#444', lineHeight: 23 },

  langRow:       { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  langBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#E8EAED' },
  langBtnText:   { fontSize: 13, fontWeight: '600', color: '#444' },
});
