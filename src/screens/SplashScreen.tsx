import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import useThemeStore from '../state/themeStore';
import useDeckStore from '../state/deckStore';
import { pixelFont } from '../theme/theme';

const heroMascotImg = require('../../assets/pixel-mascot-4.png');

export default function SplashScreen({ navigation }: any) {
  const { palette } = useThemeStore();
  const { init } = useDeckStore();
  const [skipped, setSkipped] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const minDelay = new Promise<void>(res => setTimeout(() => res(), 1200));
    const doInit = (async () => { try { await init(); } catch {} })();
    Promise.all([minDelay, doInit]).then(() => {
      if (!cancelled && !skipped) {
        navigation.replace('Classes');
      }
    });
    return () => { cancelled = true; };
  }, [init, skipped]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex:1, backgroundColor: palette.bg, alignItems:'center', justifyContent:'center', padding: 24 },
    title: { fontSize: 22, color: palette.text, fontFamily: pixelFont.heavy, marginTop: 12, marginBottom: 8, textAlign:'center' },
    tagline: { fontSize: 13, color: palette.subtle, fontFamily: pixelFont.fontFamily, marginBottom: 20, textAlign:'center' },
    mascot: { width: 140, height: 140, marginBottom: 8 },
    skipBtn: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, borderWidth: 2, borderColor: palette.border, backgroundColor: palette.panel },
    skipTxt: { color: palette.text, fontFamily: pixelFont.heavy }
  }), [palette]);

  return (
    <View style={styles.container}>
      <Image source={heroMascotImg} style={styles.mascot} resizeMode="contain" />
      <Text style={styles.title}>Kiarita's Studying App</Text>
      <Text style={styles.tagline}>Loading your study space…</Text>
      <ActivityIndicator color={palette.accent} />
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => { setSkipped(true); navigation.replace('Classes'); }}
        activeOpacity={0.85}
      >
        <Text style={styles.skipTxt}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
