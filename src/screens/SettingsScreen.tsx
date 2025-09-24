import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, pixelFont } from '../theme/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: palette.pastelPurple, padding: 24 },
  title: { fontSize: 28, fontFamily: pixelFont.heavy, color: palette.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: palette.subtle, fontFamily: pixelFont.fontFamily }
});