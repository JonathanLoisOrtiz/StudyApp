import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';

const PALETTES = [
  {
    key: 'default',
    name: 'Default Pastels',
    colors: ['#F4E8FD', '#FDE8F4', '#F9D9E7', '#FF6FA5', '#402631']
  },
  {
    key: 'dark',
    name: 'Dark Mode',
    colors: ['#181825', '#232634', '#313244', '#FF6FA5', '#F5C2E7']
  },
  {
    key: 'spring',
    name: 'Spring',
    colors: ['#E8FDF4', '#FDF9E8', '#B6E2D3', '#FFB7B2', '#7A4F62']
  },
  {
    key: 'summer',
    name: 'Summer',
    colors: ['#FDF0E8', '#FDF9E8', '#F4B75D', '#FF6FA5', '#58B26B']
  },
  {
    key: 'autumn',
    name: 'Autumn',
    colors: ['#F6D1E1', '#F4B75D', '#E24C5E', '#7A4F62', '#F5C2E7']
  },
  {
    key: 'winter',
    name: 'Winter',
    colors: ['#E8F4FD', '#D1E9FB', '#313244', '#5BC0DE', '#F4E8FD']
  }
];

export default function PaletteScreen() {
  const { key, setPaletteByKey, palette } = useThemeStore() as any;
  const [selected, setSelected] = React.useState<string>(key);
  React.useEffect(() => setSelected(key), [key]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex:1, backgroundColor: palette.bg, padding: 24 },
    title: { fontSize: 28, fontFamily: pixelFont.heavy, marginBottom: 12, color: palette.text },
    item: { padding: 16, borderRadius: 16, backgroundColor: palette.panel, marginBottom: 12, borderWidth:2, borderColor: palette.border, alignItems:'flex-start' },
    selectedItem: { backgroundColor: palette.panelAlt, borderColor: palette.accent },
    itemText: { fontSize: 16, fontFamily: pixelFont.fontFamily, marginTop: 8, color: palette.text },
    selectedText: { fontFamily: pixelFont.heavy, color: palette.text },
    swatchRow: { flexDirection: 'row', marginBottom: 2 },
    swatch: { width: 28, height: 16, borderRadius: 4, marginRight: 6, borderWidth: 1, borderColor: palette.border }
  }), [palette]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Palette</Text>
      <FlatList
        data={PALETTES}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selected === item.key && styles.selectedItem]}
            onPress={() => { setSelected(item.key); setPaletteByKey(item.key as any); }}
            activeOpacity={0.85}
          >
            <View style={styles.swatchRow}>
              {item.colors.map((c, i) => (
                <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={[styles.itemText, selected === item.key && styles.selectedText]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
