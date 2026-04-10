/**
 * POIContent — renders a single content block (history, tip, promo…).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { ContentBlock } from '../types';

const TYPE_META: Record<string, { icon: string; label: string }> = {
  history: { icon: 'history-edu',   label: 'Histoire' },
  tip:     { icon: 'lightbulb',     label: 'Conseil' },
  text:    { icon: 'article',       label: 'Info' },
  promo:   { icon: 'local-offer',   label: 'Offre' },
};

interface Props {
  block: ContentBlock;
  accentColor: string;
}

export default function POIContent({ block, accentColor }: Props) {
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_META[block.type] ?? TYPE_META.text;

  return (
    <View style={[styles.card, block.type === 'promo' && { borderColor: accentColor, borderWidth: 1.5 }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <View style={[styles.iconBadge, { backgroundColor: accentColor + '18' }]}>
          <Icon name={meta.icon} size={18} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          <Text style={styles.title}>{block.title}</Text>
        </View>
        <Icon name={expanded ? 'expand-less' : 'expand-more'} size={22} color="#AAA" />
      </TouchableOpacity>

      {expanded && (
        <Text style={styles.body}>{block.body}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBadge:  { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeLabel:  { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 },
  title:      { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginTop: 1 },
  body:       { fontSize: 14, color: '#555', lineHeight: 22, paddingHorizontal: 14, paddingBottom: 14 },
});
