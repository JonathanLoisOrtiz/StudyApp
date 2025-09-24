import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated } from 'react-native';
import useDeckStore from '../state/deckStore';
import { cardShadow, pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';
// removed pixel pattern background per request
const physImg = require('../../assets/subject-phys.png');

export default function PhysicsDeckListScreen({ navigation }: any) {
  const { decks, counts, rebuildCounts, init } = useDeckStore();
  const [loading, setLoading] = React.useState(true);
  const { palette } = useThemeStore();
  const heroFade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    (async () => {
      await init();
      rebuildCounts();
      setLoading(false);
      Animated.timing(heroFade, { toValue: 1, duration: 550, useNativeDriver: true }).start();
    })();
  }, [init]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: palette.bg },
  // bgPattern removed
    loading: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor: palette.bg },
    deck: { padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 2, ...cardShadow },
    deckName: { fontSize: 20, fontWeight: '700', color: palette.text, textShadowColor: '#fff', textShadowOffset: {width:1,height:1}, textShadowRadius:1, fontFamily: pixelFont.fontFamily },
    counts: { marginTop: 4, color: palette.subtle, fontFamily: pixelFont.fontFamily },
    hero: { flexDirection:'row', backgroundColor: palette.panel, borderRadius: 24, padding: 12, borderWidth:2, borderColor: palette.border, ...cardShadow, marginBottom: 14 },
    heroTextBlock: { flex:1, paddingRight: 10 },
    title: { fontSize: 22, fontFamily: pixelFont.heavy, color: palette.text },
    tagline: { fontSize: 13, color: palette.subtle, marginTop: 6, marginBottom: 10, fontFamily: pixelFont.fontFamily },
    statsRow: { flexDirection:'row', marginBottom: 4 },
    statBubble: { flexDirection:'row', alignItems:'center', backgroundColor: palette.pastelYellow, paddingHorizontal:10, paddingVertical:6, borderRadius: 14, marginRight:8, borderWidth:1, borderColor: palette.pastelYellowDark },
    learnBubble: { backgroundColor: palette.pastelMint, borderColor: palette.border },
    reviewBubble: { backgroundColor: palette.pastelBlue, borderColor: palette.pastelBlueDark },
    statNumber: { fontSize: 14, fontFamily: pixelFont.heavy, color: palette.text, marginRight:4 },
    statLabel: { fontSize: 11, fontFamily: pixelFont.fontFamily, color: palette.subtle },
    heroArt: { width: 76, height: 76, alignSelf:'flex-end' }
  }), [palette]);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={palette.accent} /></View>;
  }

  // Physics decks are the FISI3011 exam decks we seeded
  const physicsDecks = decks
    .filter(d => d.name.startsWith('FISI3011'))
    .sort((a, b) => a.name.localeCompare(b.name));

  // aggregate totals for hero stats
  let totalNew = 0, totalLearn = 0, totalReview = 0;
  physicsDecks.forEach(d => {
    const c = counts[d.id] || { new:0, learn:0, review:0 };
    totalNew += c.new; totalLearn += c.learn; totalReview += c.review;
  });

  return (
    <View style={styles.container}>
  {/* background pattern removed */}
      <FlatList
        data={physicsDecks}
        keyExtractor={d => String(d.id)}
        ListHeaderComponent={(
          <Animated.View style={[styles.hero, { opacity: heroFade, transform:[{ translateY: heroFade.interpolate({ inputRange:[0,1], outputRange:[18,0] }) }] }] }>
            <View style={styles.heroTextBlock}>
              <Text style={styles.title}>Physics Decks</Text>
              <Text style={styles.tagline}>You have {totalNew + totalLearn + totalReview} cards waiting</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBubble}><Text style={styles.statNumber}>{totalNew}</Text><Text style={styles.statLabel}>New</Text></View>
                <View style={[styles.statBubble, styles.learnBubble]}><Text style={styles.statNumber}>{totalLearn}</Text><Text style={styles.statLabel}>Learn</Text></View>
                <View style={[styles.statBubble, styles.reviewBubble]}><Text style={styles.statNumber}>{totalReview}</Text><Text style={styles.statLabel}>Review</Text></View>
              </View>
            </View>
            <Image source={physImg} style={styles.heroArt} />
          </Animated.View>
        )}
        renderItem={({ item }) => {
          const c = counts[item.id] || { new: 0, learn: 0, review: 0 };
          return (
            <View>
              <TouchableOpacity
                style={[styles.deck, { backgroundColor: palette.panel, borderColor: palette.border }]}
                onPress={() => navigation.navigate('Study', { deckId: item.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.deckName}>{item.name}</Text>
                <Text style={styles.counts}>N {c.new}  L {c.learn}  R {c.review}</Text>
              </TouchableOpacity>
              <View style={{ flexDirection:'row', marginTop: -8, marginBottom: 10 }}>
                <TouchableOpacity
                  style={{ paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:2, borderColor: palette.border, backgroundColor: palette.panel, alignSelf:'flex-start' }}
                  onPress={() => navigation.navigate('ManageCards', { deckId: item.id })}
                >
                  <Text style={{ color: palette.text, fontFamily: pixelFont.fontFamily, fontSize: 12 }}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
  <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.accent, borderColor: palette.border }}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AddNote', { deckId: physicsDecks[0]?.id })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>➕ Add Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ flex: 1, marginLeft: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.info, borderColor: palette.border }}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('UploadNotes', { deckId: physicsDecks[0]?.id })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>🤖 From Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, marginLeft: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.warning, borderColor: palette.border }}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ImageNotes', { deckId: physicsDecks[0]?.id })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>📷 From Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
