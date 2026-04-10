import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { clearBeacons, selectBluetoothState } from '../store/slices/beaconSlice';
import CacheService from '../services/CacheService';
import type { AppDispatch } from '../store/store';

type LangOption = { code: string; label: string; flag: string };
const LANGUAGES: LangOption[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'mg', label: 'Malagasy',  flag: '🇲🇬' },
];

export default function SettingsScreen() {
  const dispatch      = useDispatch<AppDispatch>();
  const bluetoothState = useSelector(selectBluetoothState);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [audioAutoPlay, setAudioAutoPlay]               = useState(false);
  const [selectedLang, setSelectedLang]                  = useState('fr');
  const [cacheInfo, setCacheInfo] = useState<{ entries: number; sizeKB: number } | null>(null);

  useEffect(() => {
    CacheService.getCacheSize().then(setCacheInfo);
  }, []);

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Tout le contenu téléchargé sera supprimé. Vous aurez besoin d\'une connexion pour recharger les guides.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            await CacheService.clearAll();
            dispatch(clearBeacons());
            setCacheInfo({ entries: 0, sizeKB: 0 });
            Alert.alert('Cache vidé', 'Le cache a été effacé avec succès.');
          },
        },
      ],
    );
  };

  const Row = ({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Icon name={icon} size={22} color="#1A73E8" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Paramètres</Text>

      {/* Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>État Bluetooth</Text>
        <View style={[styles.btStatus, { backgroundColor: bluetoothState === 'on' ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>
            {bluetoothState === 'on' ? '🟢' : bluetoothState === 'off' ? '🔴' : '🟡'}
          </Text>
          <Text style={styles.btStatusText}>
            {bluetoothState === 'on' ? 'Bluetooth activé — scan actif'
              : bluetoothState === 'off' ? 'Bluetooth désactivé — activez-le pour détecter les beacons'
              : 'Vérification en cours…'}
          </Text>
        </View>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Langue des guides</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langBtn, selectedLang === l.code && styles.langBtnActive]}
              onPress={() => setSelectedLang(l.code)}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langLabel, selectedLang === l.code && { color: '#fff' }]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Row icon="notifications" label="Alertes beacon">
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: '#1A73E8' }}
          />
        </Row>
        <Row icon="headset" label="Audio automatique">
          <Switch
            value={audioAutoPlay}
            onValueChange={setAudioAutoPlay}
            trackColor={{ true: '#1A73E8' }}
          />
        </Row>
      </View>

      {/* Cache */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cache hors-ligne</Text>
        <View style={styles.cacheInfo}>
          <Text style={styles.cacheText}>
            {cacheInfo
              ? `${cacheInfo.entries} élément(s) — ${cacheInfo.sizeKB} KB`
              : 'Calcul en cours…'}
          </Text>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
            <Text style={styles.clearBtnText}>Vider</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cacheHint}>
          Le contenu est mis en cache 24 h pour fonctionner sans connexion (utile dans les zones reculées de Madagascar).
        </Text>
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>À propos</Text>
        <Text style={styles.aboutText}>
          WAYFINDER v1.0.0{'\n'}
          Guide touristique BLE — Île Maurice & Madagascar{'\n\n'}
          Fonctionne avec des beacons iBeacon (Minew, Kontakt, Estimote).{'\n'}
          Portée efficace : 1 – 30 m selon environnement.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F7FA' },
  pageTitle:       { fontSize: 26, fontWeight: '800', color: '#1A1A2E', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  card:            { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 1 },
  cardTitle:       { fontSize: 14, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  btStatus:        { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12 },
  btStatusText:    { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  langRow:         { flexDirection: 'row', gap: 8 },
  langBtn:         { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F0F4F8' },
  langBtnActive:   { backgroundColor: '#1A73E8' },
  langFlag:        { fontSize: 22, marginBottom: 4 },
  langLabel:       { fontSize: 12, fontWeight: '600', color: '#444' },
  row:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  rowLeft:         { flexDirection: 'row', alignItems: 'center' },
  rowIcon:         { marginRight: 12 },
  rowLabel:        { fontSize: 15, color: '#333' },
  cacheInfo:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cacheText:       { fontSize: 14, color: '#555' },
  clearBtn:        { backgroundColor: '#FFEBEE', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  clearBtnText:    { color: '#C62828', fontWeight: '700', fontSize: 13 },
  cacheHint:       { fontSize: 12, color: '#999', lineHeight: 18 },
  aboutText:       { fontSize: 14, color: '#555', lineHeight: 22 },
});
