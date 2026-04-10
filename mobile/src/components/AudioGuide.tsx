/**
 * AudioGuide — compact audio player for POI audio guides.
 * Uses react-native-track-player for background audio support.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State as TrackState,
  Capability,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  url: string;
  title: string;
}

let playerSetup = false;

async function setupPlayer() {
  if (playerSetup) return;
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
  playerSetup = true;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioGuide({ url, title }: Props) {
  const [ready, setReady]     = useState(false);
  const [loading, setLoading] = useState(true);
  const playbackState = usePlaybackState();
  const progress      = useProgress();

  const isPlaying = playbackState.state === TrackState.Playing;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await setupPlayer();
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id:  'audio-guide',
          url,
          title,
          artist: 'WAYFINDER',
        });
        if (mounted) { setReady(true); setLoading(false); }
      } catch (e) {
        console.warn('[AudioGuide] setup error:', e);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      TrackPlayer.reset().catch(() => {});
    };
  }, [url, title]);

  const togglePlay = useCallback(async () => {
    if (!ready) return;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [ready, isPlaying]);

  const progressPercent = progress.duration > 0
    ? progress.position / progress.duration
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="headset" size={18} color="#1A73E8" />
        <Text style={styles.label}>Audio guide</Text>
      </View>

      <View style={styles.player}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={28} color="#fff" />
          }
        </TouchableOpacity>

        <View style={styles.progressArea}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(progress.position)}</Text>
            <Text style={styles.time}>{formatTime(progress.duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { backgroundColor: '#EEF4FF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 8 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  label:        { fontSize: 12, fontWeight: '700', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: 0.6 },
  player:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playBtn:      { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1A73E8', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  progressArea: { flex: 1 },
  title:        { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  progressBar:  { height: 4, backgroundColor: '#C8D6F8', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1A73E8', borderRadius: 2 },
  timeRow:      { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time:         { fontSize: 11, color: '#888' },
});
