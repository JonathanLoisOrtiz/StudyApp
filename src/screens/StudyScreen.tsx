import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import useStudySession from '../state/studySessionStore';
import { cardShadow, pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';
import { pixelPatternDataUri, cherryBlossomLandscapeUri } from '../theme/pattern';

// Replace mascotVariants with actual distinct mascot images
const mascots = [
  require('../../assets/pixel-mascot.png'),
  require('../../assets/pixel-mascot-2.png'),
  require('../../assets/pixel-mascot-3.png'),
  require('../../assets/pixel-mascot-4.png'),
  require('../../assets/pixel-mascot-5.png')
];

export default function StudyScreen({ route }: any) {
  const { deckId } = route.params;
  const { current, reveal, revealed, answer, loadDeck } = useStudySession();
  const { palette, key } = useThemeStore() as any;
  
  // Animation value for card flip
  const flipAnimation = React.useRef(new Animated.Value(0)).current;
  // Animation value for button transition
  const buttonAnimation = React.useRef(new Animated.Value(0)).current;
  // Card change transition (opacity + vertical slide)
  const cardOpacity = React.useRef(new Animated.Value(1)).current;
  const cardTranslateY = React.useRef(new Animated.Value(0)).current;
  // Rating buttons fade out on answer
  const ratingButtonsAnim = React.useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [mascotIndex, setMascotIndex] = React.useState(0); // index into mascots array

  React.useEffect(() => {
    loadDeck(deckId);
  }, [deckId]);

  // Reset animations & animate card entry when card changes
  React.useEffect(() => {
    flipAnimation.setValue(0);
    buttonAnimation.setValue(0);
    ratingButtonsAnim.setValue(1);
    if (current) {
      cardOpacity.setValue(0);
      cardTranslateY.setValue(18);
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(cardTranslateY, { toValue: 0, duration: 220, useNativeDriver: true })
      ]).start(() => setIsTransitioning(false));
    }
    // advance mascot
    setMascotIndex(i => (i + 1) % mascots.length);
  }, [current?.id]);

  // pick a different mascot image each card change
  React.useEffect(() => {
    setMascotIndex(prev => {
      if (mascots.length < 2) return prev; // nothing to change
      let next = prev;
      while (next === prev) {
        next = Math.floor(Math.random() * mascots.length);
      }
      return next;
    });
  }, [current?.id]);

  // Handle reveal with animation
  const handleReveal = () => {
    // Start card flip and button transition
    Animated.parallel([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
    
    // Reveal the answer halfway through the animation when card is perpendicular
    setTimeout(() => {
      reveal();
    }, 300);
  };

  // Create interpolated values for flip animation
  const scaleX = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  // Create interpolated values for button transition
  const showAnswerOpacity = buttonAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const showAnswerScale = buttonAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 0],
  });

  const ratingsOpacity = buttonAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const ratingsScale = buttonAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  // Handle answer with card exit animation then state advance
  const handleAnswer = (r: 'again'|'hard'|'good'|'easy') => {
    if (isTransitioning || !revealed) return; // prevent double taps or answering before reveal
    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: -20, duration: 160, useNativeDriver: true }),
      Animated.timing(ratingButtonsAnim, { toValue: 0, duration: 140, useNativeDriver: true })
    ]).start(() => {
      answer(r); // triggers new card -> entry effect in useEffect above
    });
  };

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    overlay: { flex:1, padding:20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
    empty: { color: palette.subtle, fontSize: 18, fontFamily: pixelFont.fontFamily },
    card: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: key === 'dark' ? palette.pastelPurple : palette.pastelYellow, borderRadius: 20, padding: 24, borderWidth: 2, borderColor: key === 'dark' ? palette.border : palette.pastelYellowDark, ...cardShadow, marginBottom: 24, position: 'relative' },
    front: { fontSize: 30, color: palette.text, textAlign: 'center', fontFamily: pixelFont.fontFamily, lineHeight: 38 },
  mascot: { position: 'absolute', top: 12, right: 12, width: 64, height: 64 },
    buttonArea: { paddingHorizontal: 32, paddingBottom: 20, height: 52 },
    buttonWrapper: { position: 'absolute', left: 32, right: 32, height: 52 },
    buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    primaryBtn: { backgroundColor: palette.accent, height: 52, justifyContent: 'center', borderRadius: 10, borderWidth:2, borderColor: palette.border },
    btnTxt: { textAlign: 'center', color: '#fff', fontSize: 18, fontFamily: pixelFont.fontFamily },
    row: { flexDirection: 'row', justifyContent: 'space-between', height: 52 },
    rateBtn: { flex: 1, marginHorizontal: 3, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth:2, borderColor: palette.border },
    rateTxt: { color: '#fff', textTransform: 'capitalize', fontFamily: pixelFont.fontFamily },
    again: { backgroundColor: palette.danger },
    hard: { backgroundColor: palette.warning },
    good: { backgroundColor: palette.success },
    easy: { backgroundColor: palette.info },
    disabledBtn: { opacity: 0.55 }
  }), [palette, key]);

  if (!current) {
    return (
      <View style={styles.center}> 
        <Text style={styles.empty}>No more cards</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.card,
            { transform: [{ scaleX }, { translateY: cardTranslateY }], opacity: cardOpacity }
          ]}
        >
          <Image
            source={mascots[mascotIndex]}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.front}>{revealed ? current.back : current.front}</Text>
        </Animated.View>
        
        {/* Button Area with proper spacing */}
        <View style={styles.buttonArea}>
          {/* Show Answer Button */}
          <Animated.View 
            style={[
              styles.buttonWrapper,
              {
                opacity: showAnswerOpacity,
                transform: [{ scale: showAnswerScale }]
              }
            ]}
            pointerEvents={revealed ? 'none' : 'auto'}
          >
            <TouchableOpacity style={styles.primaryBtn} onPress={handleReveal}>
              <Text style={styles.btnTxt}>Show Answer</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Rating Buttons */}
          <Animated.View 
            style={[
              styles.buttonWrapper,
              styles.row,
              {
        opacity: Animated.multiply(ratingsOpacity, ratingButtonsAnim),
                transform: [{ scale: ratingsScale }]
              }
            ]}
      pointerEvents={!revealed || isTransitioning ? 'none' : 'auto'}
          >
            {(['again','hard','good','easy'] as const).map(r => {
              const styleMap: Record<typeof r, any> = { again: styles.again, hard: styles.hard, good: styles.good, easy: styles.easy } as any;
              return (
        <TouchableOpacity key={r} style={[styles.rateBtn, styleMap[r], isTransitioning && styles.disabledBtn]} onPress={() => handleAnswer(r)}>
                  <Text style={styles.rateTxt}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

 
