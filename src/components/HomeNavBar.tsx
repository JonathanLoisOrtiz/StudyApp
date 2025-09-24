import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Animated, Easing } from 'react-native';
import { pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';

interface Props {
  current: string | undefined;
  navigate: (route: string) => void;
}

const tabs = [
  { key: 'Classes', label: 'Home', type: 'image', src: require('../../assets/pixel-mascot-4.png') },
  { key: 'Palette', label: 'Palettes', type: 'emoji', glyph: '🎨' }
];

export default function HomeNavBar({ current, navigate }: Props) {
  const { palette } = useThemeStore();
  const [layouts, setLayouts] = React.useState<Record<string,{x:number;width:number}>>({});
  const indicatorX = React.useRef(new Animated.Value(0)).current;
  const indicatorW = React.useRef(new Animated.Value(0)).current;

  const updateIndicator = React.useCallback((key: string) => {
    const l = layouts[key];
    if (!l) return;
    Animated.parallel([
      Animated.timing(indicatorX, { toValue: l.x, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(indicatorW, { toValue: l.width, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: false })
    ]).start();
  }, [layouts, indicatorX, indicatorW]);

  React.useEffect(() => {
    if (current) updateIndicator(current);
  }, [current, updateIndicator]);

  const onLayoutTab = (key: string, e: any) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts(prev => {
      const next = { ...prev, [key]: { x, width } };
      return next;
    });
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
  <View style={[styles.bar, { backgroundColor: palette.bg, borderColor: palette.border }]}>
  {/* No highlight/rectangle, only icon and label light up */}
        {tabs.map(t => {
          const active = current === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tab}
              activeOpacity={0.85}
              onPress={() => navigate(t.key)}
              onLayout={(e) => onLayoutTab(t.key, e)}
            >
              {t.type === 'image' ? (
                <Image source={t.src} style={[styles.iconImg, active && styles.iconActive]} resizeMode="contain" />
              ) : (
                <Text style={[styles.emoji, active && styles.iconActive, { color: active ? palette.text : palette.subtle }]}>{t.glyph}</Text>
              )}
              <Text style={[styles.label, { color: active ? palette.text : palette.subtle }, active && styles.labelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position:'absolute', left:0, right:0, bottom:0 },
  // Full-width bar occupying entire bottom area, with extra padding for iOS safe area approximation
  bar: { flexDirection:'row', paddingTop:8, paddingBottom: Platform.select({ ios: 28, android: 14, default: 18 }), paddingHorizontal:12, borderTopLeftRadius:0, borderTopRightRadius:0, borderRadius:0, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:12, shadowOffset:{width:0,height:-2}, borderTopWidth:1, borderColor:'rgba(0,0,0,0.06)', overflow:'hidden' },
  tab: { flex:1, alignItems:'center', justifyContent:'center', paddingVertical:4, paddingHorizontal:4 },
  activePill: { position:'absolute', top:4, bottom: Platform.select({ ios: 10, default: 8 }), backgroundColor: 'rgba(255,255,255,0.9)' },
  iconImg: { width:28, height:28, marginBottom:1, opacity:0.55 },
  emoji: { fontSize:22, marginBottom:1, opacity:0.55 },
  iconActive: { opacity:1 },
  label: { fontSize:11, fontFamily: pixelFont.fontFamily, letterSpacing:0.3 },
  labelActive: { fontFamily: pixelFont.heavy }
});
