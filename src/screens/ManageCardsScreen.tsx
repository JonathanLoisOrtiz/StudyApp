import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import useDeckStore from '../state/deckStore';
import useThemeStore from '../state/themeStore';
import { cardShadow, pixelFont } from '../theme/theme';

type Props = { route: { params?: { deckId?: number } }, navigation: any };

export default function ManageCardsScreen({ route }: Props) {
  const { decks, cards, init, reloadCardsForDeck, deleteCard } = useDeckStore();
  const { palette } = useThemeStore();
  const [loading, setLoading] = React.useState(true);
  const [deckId, setDeckId] = React.useState<number | null>(route.params?.deckId ?? null);

  React.useEffect(() => {
    (async () => {
      await init();
      const id = deckId ?? decks[0]?.id ?? null;
      setDeckId(id);
      if (id) await reloadCardsForDeck(id);
      setLoading(false);
    })();
  }, [init]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg, padding: 16 },
    loading: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor: palette.bg },
    headerRow: { flexDirection:'row', alignItems:'center', marginBottom: 12 },
    deckPill: { paddingVertical:8, paddingHorizontal:12, borderRadius: 12, backgroundColor: palette.panel, borderWidth:2, borderColor: palette.border, marginRight:8 },
    deckPillTxt: { color: palette.text, fontFamily: pixelFont.fontFamily },
    selectedPill: { backgroundColor: palette.accent, borderColor: palette.border },
    selectedPillTxt: { color: '#fff', fontFamily: pixelFont.heavy },
    cardRow: { padding: 14, borderRadius: 14, borderWidth:2, borderColor: palette.border, backgroundColor: palette.panel, marginBottom: 10, ...cardShadow },
    front: { color: palette.text, fontFamily: pixelFont.heavy, fontSize: 16, marginBottom: 6 },
    back: { color: palette.subtle, fontFamily: pixelFont.fontFamily },
    rowActions: { flexDirection:'row', marginTop: 10 },
    dangerBtn: { backgroundColor: palette.danger, borderRadius: 8, paddingVertical:8, paddingHorizontal:12, borderWidth:2, borderColor: palette.border, marginRight:8 },
    actionTxt: { color: '#fff', fontFamily: pixelFont.heavy, fontSize: 13 },
  }), [palette]);

  const decksToShow = decks.filter(d => d.name !== 'Default');
  const cardsForDeck = deckId ? cards.filter(c => c.deckId === deckId) : [];

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={palette.accent} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Deck chooser row */}
      <View style={styles.headerRow}>
        <FlatList
          data={decksToShow}
          horizontal
          keyExtractor={(d) => String(d.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = item.id === deckId;
            return (
              <TouchableOpacity
                onPress={async () => {
                  setLoading(true);
                  setDeckId(item.id);
                  await reloadCardsForDeck(item.id);
                  setLoading(false);
                }}
                style={[styles.deckPill, selected && styles.selectedPill]}
              >
                <Text style={[styles.deckPillTxt, selected && styles.selectedPillTxt]}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Cards list */}
      <FlatList
        data={cardsForDeck}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <Text style={styles.front}>{item.front}</Text>
            <Text style={styles.back}>{item.back}</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => {
                  Alert.alert(
                    'Delete card?',
                    'This will permanently remove the card.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        await deleteCard(item.id);
                      }}
                    ]
                  );
                }}
              >
                <Text style={styles.actionTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: palette.subtle, fontFamily: pixelFont.fontFamily }}>No cards in this deck.</Text>}
      />
    </View>
  );
}
