import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated } from 'react-native';
import { cardShadow, pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';
import useDeckStore from '../state/deckStore';
import { pixelPatternDataUri } from '../theme/pattern';

const SUBJECTS = [
  {
    key: 'chem',
    name: 'Organic Chemistry',
    description: 'Quimica Organica | QUIM3031',
    image: require('../../assets/subject-chem.png'),
    cardStyle: 'chemistryCard',
    onPress: (navigation: any) => navigation.navigate('Decks')
  },
  {
    key: 'phys',
    name: 'Physics',
    description: 'Fisica Universitaria | FISI3013',
    image: require('../../assets/subject-phys.png'),
    cardStyle: 'physicsCard',
  onPress: (navigation: any) => navigation.navigate('PhysicsDecks')
  }
];

// Single mascot for a consistent welcoming feel
const heroMascotImg = require('../../assets/pixel-mascot-4.png');

export default function ClassesScreen({ navigation }: any) {
  const { palette } = useThemeStore();
  const { counts, decks, init, rebuildCounts } = useDeckStore();
  const [ready, setReady] = React.useState(false);
  const heroFade = React.useRef(new Animated.Value(0)).current;
  const subjectAnim: Record<string, Animated.Value> = React.useRef({}).current;

  React.useEffect(() => {
    (async () => {
      await init();
      rebuildCounts();
      setReady(true);
      Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    })();
  }, [init]);

  // Removed bounce animation for a calmer feel

  SUBJECTS.forEach((s, i) => {
    if (!subjectAnim[s.key]) {
      subjectAnim[s.key] = new Animated.Value(0);
      Animated.timing(subjectAnim[s.key], { toValue: 1, duration: 500, delay: 250 + i*130, useNativeDriver: true }).start();
    }
  });

  // aggregate totals for a friendly line
  let totalDue = 0; let totalNew = 0; let totalReview = 0; let totalLearn = 0;
  Object.values(counts).forEach(c => { totalDue += c.new + c.learn + c.review; totalNew+=c.new; totalLearn+=c.learn; totalReview+=c.review; });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // No bounce translate

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    bgPattern: { position:'absolute', top:0, left:0, right:0, bottom:0, opacity:0.25 },
    scrollContent: { paddingTop: 5, paddingHorizontal: 20 },
  hero: { flexDirection:'row', backgroundColor: palette.panel, borderRadius: 28, padding:10, marginTop: 12, marginBottom: 30, borderWidth:2, borderColor: palette.border, ...cardShadow },
    heroTextBlock: { flex:1, paddingRight: 12 },
    greeting: { fontSize: 28, fontFamily: pixelFont.heavy, color: palette.text, marginBottom: 4 },
    tagline: { fontSize: 14, color: palette.subtle, marginBottom: 14, fontFamily: pixelFont.fontFamily },
    statsRow: { flexDirection:'row', marginBottom: 14 },
    statBubble: { flexDirection:'row', alignItems:'center', backgroundColor: palette.pastelYellow, paddingHorizontal:10, paddingVertical:6, borderRadius: 14, marginRight:8, borderWidth:1, borderColor: palette.pastelYellowDark },
    newBubble: { backgroundColor: palette.pastelYellow, borderColor: palette.pastelYellowDark },
  learnBubble: { backgroundColor: palette.pastelMint, borderColor: palette.border },
    reviewBubble: { backgroundColor: palette.pastelBlue, borderColor: palette.pastelBlueDark },
    statNumber: { fontSize:16, fontFamily: pixelFont.heavy, color: palette.text, marginRight:4 },
    statLabel: { fontSize: 12, fontFamily: pixelFont.fontFamily, color: palette.subtle },
    startBtn: { backgroundColor: palette.accent, alignSelf:'flex-start', paddingVertical:10, paddingHorizontal:18, borderRadius: 14, borderWidth:2, borderColor: palette.border },
    startTxt: { color:'#fff', fontSize:15, fontFamily: pixelFont.heavy, letterSpacing:0.5 },
    heroMascot: { width:110, height:110, marginLeft:8, alignSelf:'flex-end', marginTop:4 },
    sectionHeading: { fontSize:20, fontFamily: pixelFont.heavy, color: palette.text, marginBottom:16 },
  subjectCard: { borderRadius: 22, padding:16, marginBottom:16, borderWidth:2, ...cardShadow },
  chemistryCard: { backgroundColor: palette.panel, borderColor: palette.border },
  physicsCard: { backgroundColor: palette.panel, borderColor: palette.border },
    subjectRow: { flexDirection:'row', alignItems:'center' },
    subjectImage: { width:56, height:56, marginRight:14 },
    subjectName: { fontSize:18, fontFamily: pixelFont.heavy, color: palette.text },
    subjectDescription: { fontSize:13, marginTop:4, lineHeight:17, color: palette.subtle, fontFamily: pixelFont.fontFamily }
  }), [palette]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: pixelPatternDataUri }} style={styles.bgPattern} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, { opacity: heroFade, transform:[{ translateY: heroFade.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}> 
          <View style={styles.heroTextBlock}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.tagline}>{totalDue>0 ? `You have ${totalDue} cards waiting` : 'You are all caught up! 🎉'}</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statBubble, styles.newBubble]}><Text style={styles.statNumber}>{totalNew}</Text><Text style={styles.statLabel}>New</Text></View>
              <View style={[styles.statBubble, styles.learnBubble]}><Text style={styles.statNumber}>{totalLearn}</Text><Text style={styles.statLabel}>Learn</Text></View>
              <View style={[styles.statBubble, styles.reviewBubble]}><Text style={styles.statNumber}>{totalReview}</Text><Text style={styles.statLabel}>Review</Text></View>
            </View>
            {decks.length > 0 && totalDue > 0 && (
              <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Decks')} activeOpacity={0.9}>
                <Text style={styles.startTxt}>Start Studying</Text>
              </TouchableOpacity>
            )}
          </View>
          <Image source={heroMascotImg} style={styles.heroMascot} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.sectionHeading}>Subjects</Text>
        {SUBJECTS.map(s => {
          const a = subjectAnim[s.key];
          const translate = a.interpolate({ inputRange:[0,1], outputRange:[24,0] });
          const scale = a.interpolate({ inputRange:[0,1], outputRange:[0.95,1] });
          return (
            <Animated.View key={s.key} style={{ opacity: a, transform:[{ translateY: translate }, { scale }] }}>
              <TouchableOpacity
                style={[styles.subjectCard, (styles as any)[s.cardStyle]]}
                activeOpacity={0.85}
                onPress={() => s.onPress(navigation)}
              >
                <View style={styles.subjectRow}>
                  <Image source={s.image} style={styles.subjectImage} />
                  <View style={{ flex:1 }}>
                    <Text style={styles.subjectName}>{s.name}</Text>
                    <Text style={styles.subjectDescription}>{s.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

