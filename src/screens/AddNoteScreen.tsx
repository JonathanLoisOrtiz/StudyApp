import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import useDeckStore from '../state/deckStore';
import { cardShadow, pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';

export default function AddNoteScreen({ navigation, route }: any) {
  const { addCard, decks, init } = useDeckStore();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const { palette } = useThemeStore();
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const initialDeckId = route?.params?.deckId as number | undefined;
  const [selectedDeckId, setSelectedDeckId] = useState<number | undefined>(initialDeckId);

  React.useEffect(() => { init(); }, []);

  React.useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(initialDeckId ?? decks[0].id);
    }
  }, [decks.length]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.bg },
    deckPickerBtn: {
      backgroundColor: palette.panel,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 12,
      ...cardShadow
    },
    deckPickerText: { color: palette.text, fontFamily: pixelFont.fontFamily, fontSize: 14 },
    deckList: { backgroundColor: palette.panelAlt, borderColor: palette.border, borderWidth: 2, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    deckItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: palette.border },
    deckItemText: { color: palette.text, fontFamily: pixelFont.fontFamily },
    input: { 
      backgroundColor: palette.pastelYellow, 
      color: palette.text, 
      padding: 14, 
      borderRadius: 12, 
      marginBottom: 14, 
      fontSize: 16,
      borderWidth: 2,
      borderColor: palette.pastelYellowDark,
      fontFamily: pixelFont.fontFamily,
      ...cardShadow
    },
    primaryBtn: { 
      backgroundColor: palette.accent, 
      paddingVertical: 16, 
      borderRadius: 14,
      borderWidth: 2,
      borderColor: palette.border,
      ...cardShadow
    },
    btnTxt: { textAlign: 'center', color: 'white', fontSize: 18, fontFamily: pixelFont.fontFamily }
  }), [palette]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.deckPickerBtn} onPress={() => setShowDeckPicker(v => !v)} activeOpacity={0.85}>
        <Text style={styles.deckPickerText}>
          {selectedDeckId ? `Deck: ${decks.find(d => d.id === selectedDeckId)?.name ?? 'Select a deck'}` : 'Select a deck'}
        </Text>
      </TouchableOpacity>
      {showDeckPicker && (
        <View style={styles.deckList}>
          {decks.map((d, idx) => (
            <TouchableOpacity key={d.id} style={[styles.deckItem, idx === 0 && { borderTopWidth: 0 }]} onPress={() => { setSelectedDeckId(d.id); setShowDeckPicker(false); }}>
              <Text style={styles.deckItemText}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput 
        placeholder="Front" 
        placeholderTextColor={palette.subtle} 
        value={front} 
        onChangeText={setFront} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Back" 
        placeholderTextColor={palette.subtle} 
        value={back} 
        onChangeText={setBack} 
        style={[styles.input, { height: 120, backgroundColor: palette.pastelMint }]} 
        multiline 
      />
      <TouchableOpacity 
        style={styles.primaryBtn} 
        onPress={async () => { 
          if(front && back && selectedDeckId){ 
            await addCard(selectedDeckId, front, back); 
            setFront(''); 
            setBack(''); 
            navigation.goBack(); 
          } 
        }}
      >
        <Text style={styles.btnTxt}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}
 
