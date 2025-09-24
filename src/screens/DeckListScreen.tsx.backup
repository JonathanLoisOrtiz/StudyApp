import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated } from 'react-native';
import useDeckStore from '../state/deckStore';
import { cardShadow, pixelFont } from '../theme/theme';
import useThemeStore from '../state/themeStore';
// removed pixel pattern background per request
// subject art
const chemImg = require('../../assets/subject-chem.png');

const organicCards = [
  { front: 'Define functional group', back: 'Specific atom arrangement giving characteristic reactivity' },
  { front: 'Hybridization of carbonyl carbon', back: 'sp2 trigonal planar (~120°)' },
  { front: 'Why carbonyl carbon electrophilic?', back: 'Polar C=O; resonance places partial positive on carbon' },
  { front: 'Order of carbonyl electrophilicity', back: 'Acid chloride > anhydride > aldehyde > ketone > ester ≈ acid > amide' },
  { front: 'Phenol vs alcohol acidity', back: 'Phenol more acidic due to resonance-stabilized phenoxide' },
  { front: 'Enantiomer definition', back: 'Non-superimposable mirror image; all chiral centers inverted' },
  { front: 'Meso compound feature', back: 'Multiple stereocenters + internal symmetry plane; achiral' },
  { front: 'SN2 rate law', back: 'rate = k[substrate][nucleophile]' },
  { front: 'E2 stereochemical requirement', back: 'Anti-periplanar β-H and leaving group' },
  { front: 'Criteria for aromaticity', back: 'Cyclic, planar, fully conjugated, 4n+2 π electrons' },
  { front: 'Aldol key steps', back: 'Enolate formation -> addition -> β-hydroxy carbonyl (-> dehydration)' },
  { front: 'pKa order (acid, alcohol, alkyne, alkene, alkane)', back: 'Carboxylic acid < alcohol < terminal alkyne < alkene < alkane (stronger to weaker acid)' },
  { front: '¹H NMR aldehydic proton shift', back: '~9–10 ppm' },
  { front: 'IR ~1700 cm⁻¹ strong peak', back: 'C=O stretch' },
  { front: 'LiAlH4 vs NaBH4 scope', back: 'LiAlH4 reduces esters/acids/amides; NaBH4 mainly aldehydes/ketones' },
  { front: 'Grignard reagent limitation', back: 'Destroyed by protic functional groups (need protection)' },
  { front: 'TBDMS chloride purpose', back: 'Protect alcohol as silyl ether; removed by fluoride (TBAF)' },
  { front: 'Michael addition definition', back: '1,4-conjugate addition to α,β-unsaturated carbonyl' },
  { front: 'Robinson annulation combo', back: 'Michael addition + intramolecular aldol -> cyclic enone' },
  { front: 'Kinetic vs thermodynamic enolate', back: 'Kinetic: less substituted (fast, LDA, low T); Thermodynamic: more substituted (equilibrated, higher T)' }
];

// Q3031 Primer Examen - September 12, 2024
const exam1Cards = [
  // Estructura y Enlace (Cap. 1)
  { front: 'What determines molecular geometry according to VSEPR theory?', back: 'Electron pair repulsion minimizes energy; bonding and lone pairs arrange to minimize repulsion' },
  { front: 'Difference between σ and π bonds', back: 'σ bonds: head-on orbital overlap, single bonds; π bonds: sideways orbital overlap, in double/triple bonds' },
  { front: 'sp³ hybridization characteristics', back: 'Tetrahedral geometry, 109.5° bond angles, 4 equivalent hybrid orbitals' },
  { front: 'sp² hybridization characteristics', back: 'Trigonal planar geometry, 120° bond angles, 3 hybrid orbitals + 1 p orbital' },
  { front: 'sp hybridization characteristics', back: 'Linear geometry, 180° bond angles, 2 hybrid orbitals + 2 p orbitals' },
  { front: 'What makes a molecule polar?', back: 'Net dipole moment due to electronegativity differences and asymmetric geometry' },
  { front: 'Formal charge calculation', back: 'FC = (valence e⁻) - (nonbonding e⁻) - ½(bonding e⁻)' },
  
  // Resonancia (Cap. 2, 8)
  { front: 'Rules for drawing resonance structures', back: '1) Same connectivity 2) Same number of electrons 3) Only π electrons and lone pairs move 4) Formal charges minimize' },
  { front: 'What stabilizes resonance structures?', back: 'Lower formal charges, negative charge on most electronegative atom, positive charge on least electronegative' },
  { front: 'Resonance vs tautomerism', back: 'Resonance: electron delocalization, same structure; Tautomerism: atom movement, different structures' },
  { front: 'Why is benzene especially stable?', back: 'Aromatic stabilization: cyclic conjugation of 6 π electrons (4n+2 rule) provides extra stability' },
  { front: 'How does resonance affect acidity?', back: 'Resonance stabilization of conjugate base increases acidity (e.g., carboxylic acids)' },
  
  // Ácidos y Bases
  { front: 'Brønsted-Lowry acid definition', back: 'Proton (H⁺) donor' },
  { front: 'Brønsted-Lowry base definition', back: 'Proton (H⁺) acceptor' },
  { front: 'Lewis acid definition', back: 'Electron pair acceptor' },
  { front: 'Lewis base definition', back: 'Electron pair donor' },
  { front: 'Factors affecting acid strength', back: '1) Electronegativity 2) Size 3) Resonance stabilization 4) Inductive effects' },
  { front: 'Why is HI stronger acid than HF?', back: 'Larger iodine atom forms weaker H-I bond and larger, more stable I⁻ ion' },
  { front: 'pKa relationship to acid strength', back: 'Lower pKa = stronger acid; higher pKa = weaker acid' },
  { front: 'Inductive effect on acidity', back: 'Electron-withdrawing groups increase acidity; electron-donating groups decrease acidity' },
  
  // Nomenclatura y Conformaciones (Cap. 3)
  { front: 'IUPAC naming priority order', back: 'Acids > esters > amides > aldehydes > ketones > alcohols > amines > alkenes > alkynes > alkanes' },
  { front: 'R vs S configuration determination', back: 'Assign priorities (atomic number), orient lowest priority away, trace 1→2→3: clockwise=R, counterclockwise=S' },
  { front: 'Chair conformation stability', back: 'Axial positions less stable due to 1,3-diaxial interactions; equatorial positions preferred' },
  { front: 'Ring flip in cyclohexane', back: 'Chair conformations interconvert; axial becomes equatorial and vice versa' },
  { front: 'Gauche vs anti conformations', back: 'Gauche: 60° dihedral angle, higher energy; Anti: 180° dihedral angle, lower energy' },
  
  // Estereoquímica (Cap. 4)
  { front: 'Enantiomers definition', back: 'Non-superimposable mirror images; same physical properties except optical rotation' },
  { front: 'Diastereomers definition', back: 'Stereoisomers that are not mirror images; different physical and chemical properties' },
  { front: 'Meso compound characteristics', back: 'Has stereocenters but is achiral due to internal plane of symmetry' },
  { front: 'Optical activity requirement', back: 'Molecule must be chiral (no plane of symmetry)' },
  { front: 'Racemic mixture properties', back: '50:50 mixture of enantiomers; optically inactive; melting point often different from pure enantiomers' },
  { front: 'How to identify stereocenters', back: 'Carbon with 4 different groups attached' },
  
  // Energética (Cap. 5)
  { front: 'Activation energy definition', back: 'Minimum energy required for reaction to occur; determines reaction rate' },
  { front: 'Thermodynamic vs kinetic control', back: 'Thermodynamic: most stable product predominates; Kinetic: fastest-forming product predominates' },
  { front: 'Enthalpy vs entropy in reactions', back: 'ΔG = ΔH - TΔS; negative ΔG means spontaneous reaction' },
  { front: 'Catalyst effect on reaction', back: 'Lowers activation energy, increases rate, but does not change equilibrium position' },
  { front: 'Hammond postulate', back: 'Transition state resembles the species (reactant or product) to which it is closer in energy' }
];

// Q3031 Segundo Examen - October 17, 2024  
const exam2Cards = [
  // Adición Electrofílica de Alquenos (Cap. 6)
  { front: 'Markovnikov\'s rule', back: 'In HX addition to alkenes, H goes to carbon with more hydrogens, X goes to more substituted carbon' },
  { front: 'Anti-Markovnikov addition conditions', back: 'Peroxides (ROOR) cause radical mechanism, reversing regioselectivity' },
  { front: 'Hydroboration-oxidation mechanism', back: '1) BH₃ syn addition 2) H₂O₂/OH⁻ oxidation 3) Net anti-Markovnikov, syn stereochemistry' },
  { front: 'Oxymercuration-demercuration result', back: 'Markovnikov addition of water without rearrangement' },
  { front: 'Alkene stability order', back: 'Tetrasubstituted > trisubstituted > disubstituted > monosubstituted > unsubstituted' },
  { front: 'Carbocation stability order', back: '3° > 2° > 1° > methyl (stabilized by hyperconjugation and inductive effects)' },
  { front: 'Epoxidation of alkenes', back: 'mCPBA (meta-chloroperoxybenzoic acid) gives syn addition of oxygen across double bond' },
  { front: 'Dihydroxylation conditions', back: 'OsO₄ or KMnO₄ give syn-diols; OsO₄ with NMO is catalytic' },
  { front: 'Ozonolysis products', back: 'O₃ followed by Zn/AcOH gives aldehydes/ketones; breaks C=C bond completely' },
  
  // Estereoquímica Productos de Adición Electrofílica
  { front: 'Syn vs anti addition', back: 'Syn: both groups add to same face; Anti: groups add to opposite faces' },
  { front: 'Bromine addition stereochemistry', back: 'Anti addition via bromonium ion intermediate' },
  { front: 'Chiral center formation in additions', back: 'Achiral alkene + achiral reagent → racemic mixture if new stereocenter formed' },
  
  // Adición Electrofílica de Alquinos (Cap. 7, 17)
  { front: 'Alkyne acidity', back: 'Terminal alkynes (pKa ~25) more acidic than alkenes/alkanes due to sp hybridization' },
  { front: 'Alkyne alkylation mechanism', back: '1) NaNH₂ forms acetylide anion 2) SN2 with 1° alkyl halide' },
  { front: 'Hydration of alkynes', back: 'H₂SO₄/HgSO₄ gives methyl ketones (Markovnikov); hydroboration gives aldehydes (anti-Markovnikov)' },
  { front: 'Alkyne reduction methods', back: 'Lindlar catalyst: syn to alkene; Na/NH₃: anti to alkene; excess H₂/Pt: complete to alkane' },
  
  // Espectroscopia Infrarrojo (Cap. 13)
  { front: 'IR frequency factors', back: 'Bond strength and mass affect frequency: stronger bonds and lighter atoms = higher frequency' },
  { front: 'O-H stretch characteristics', back: 'Broad 3200-3600 cm⁻¹; alcohols broader than carboxylic acids due to H-bonding' },
  { front: 'C=O stretch positions', back: 'Aldehydes/ketones ~1715; carboxylic acids ~1760; esters ~1735; amides ~1650 cm⁻¹' },
  { front: 'C-H stretch regions', back: 'Alkyl C-H ~2800-3000; =C-H ~3000-3100; ≡C-H ~3300 cm⁻¹' },
  { front: 'Fingerprint region', back: '600-1400 cm⁻¹; complex, characteristic for specific compounds' },
  { front: 'C=C stretch characteristics', back: 'Weak absorption ~1600-1700 cm⁻¹; often not visible if symmetrical' },
  { front: 'N-H stretch patterns', back: 'Primary amides: 2 peaks; secondary amides: 1 peak; amines: variable, 3300-3500 cm⁻¹' },
  
  // Adición Electrofílica de Dienos (Cap. 8)
  { front: 'Conjugated diene stability', back: 'Lower heat of hydrogenation due to resonance stabilization' },
  { front: '1,2 vs 1,4 addition products', back: '1,2: kinetic control, low temp; 1,4: thermodynamic control, high temp' },
  { front: 'Diels-Alder reaction requirements', back: 'Conjugated diene + dienophile; electron-rich diene + electron-poor dienophile preferred' },
  { front: 'Diels-Alder stereochemistry', back: 'Concerted, syn addition; endo product kinetically favored over exo' }
];

// Q3031 Tercer Examen - December 9, 2024
const exam3Cards = [
  // Aromaticidad (Cap. 8)
  { front: 'Hückel\'s rule', back: '4n+2 π electrons in cyclic, planar, fully conjugated system = aromatic' },
  { front: 'Antiaromatic characteristics', back: '4n π electrons; cyclic, planar, conjugated; very unstable' },
  { front: 'Tropylium ion aromaticity', back: '7-membered ring with 6 π electrons (4n+2, n=1); very stable cation' },
  { front: 'Cyclopentadienyl anion', back: '5-membered ring with 6 π electrons; aromatic and stable' },
  { front: 'Pyridine vs pyrrole', back: 'Pyridine: N lone pair not in π system; Pyrrole: N lone pair contributes to aromaticity' },
  { front: 'Benzene resonance energy', back: '~36 kcal/mol stabilization compared to hypothetical 1,3,5-cyclohexatriene' },
  
  // Sustitución Electrofílica de Benceno (Cap. 18)
  { front: 'Electrophilic aromatic substitution mechanism', back: '1) Electrophilic attack 2) Carbocation intermediate (arenium ion) 3) Deprotonation restores aromaticity' },
  { front: 'Friedel-Crafts acylation', back: 'RCOCl + AlCl₃ → acylium ion → aromatic ketone; no rearrangement' },
  { front: 'Friedel-Crafts alkylation problems', back: 'Carbocation rearrangement; polyalkylation; deactivated rings won\'t react' },
  { front: 'Nitration conditions', back: 'HNO₃/H₂SO₄ generates NO₂⁺ electrophile' },
  { front: 'Sulfonation reversibility', back: 'SO₃/H₂SO₄ for sulfonation; dilute H₂SO₄/heat for desulfonation' },
  { front: 'Halogenation conditions', back: 'X₂ + FeX₃ or AlX₃ Lewis acid catalyst' },
  
  // Sustitución Electrofílica de Bencenos Sustituidos
  { front: 'Ortho/para directors', back: 'Activating: -OH, -OR, -NH₂, -NR₂, -R; Deactivating: -F, -Cl, -Br, -I' },
  { front: 'Meta directors', back: 'All deactivating: -NO₂, -CN, -SO₃H, -CHO, -COR, -COOH, -COR' },
  { front: 'Why halogens are o/p directors but deactivating', back: 'Inductive withdrawal deactivates; resonance donation directs o/p' },
  { front: 'Aniline acetylation purpose', back: 'Protects amino group from protonation/oxidation; allows selective nitration at para position' },
  { front: 'Steric effects in substitution', back: 'Ortho position blocked by bulky groups; para product predominates' },
  { front: 'Multiple substitution effects', back: 'Strongest director controls regioselectivity; activating groups override deactivating ones' },
  
  // Resonancia Magnética Nuclear (Cap. 14)
  { front: 'NMR shielding vs deshielding', back: 'Shielding: electron density around nucleus, upfield shift; Deshielding: less electron density, downfield shift' },
  { front: 'Chemical shift factors', back: 'Electronegativity, hybridization, anisotropy effects (aromatic rings)' },
  { front: 'Aromatic proton chemical shifts', back: '7-8 ppm due to aromatic ring current deshielding' },
  { front: 'Aldehyde proton shift', back: '9-10 ppm due to carbonyl deshielding' },
  { front: 'Coupling constant factors', back: 'Depends on dihedral angle, bond distance, hybridization' },
  { front: 'Vicinal vs geminal coupling', back: 'Vicinal: across 3 bonds (typical J = 6-8 Hz); Geminal: across 2 bonds (J = 10-18 Hz)' },
  { front: 'Integration in ¹H NMR', back: 'Area under peak proportional to number of equivalent protons' },
  { front: 'Multiplicity rules', back: 'n equivalent neighboring protons cause n+1 splitting pattern' },
  { front: '¹³C NMR characteristics', back: 'Each carbon gives one signal; no splitting due to ¹H coupling in proton-decoupled spectra' },
  { front: 'DEPT experiment purpose', back: 'Distinguishes CH₃, CH₂, CH, and quaternary carbons by editing technique' }
];

export default function DeckListScreen({ navigation }: any) {
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

  // Sort decks to put Q3031 exams in chronological order
  const sortedDecks = [...decks].sort((a, b) => {
    // Define the desired order for Q3031 exams
    const examOrder = [
      'Q3031 Primer Examen - Sept 12',
      'Q3031 Segundo Examen - Oct 17', 
      'Q3031 Tercer Examen - Dec 9'
    ];
    
    const aIndex = examOrder.indexOf(a.name);
    const bIndex = examOrder.indexOf(b.name);
    
    // If both are exam decks, sort by exam order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is an exam deck, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // For non-exam decks, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Show only chemistry-related decks; hide Physics (FISI3011) and the implicit Default deck
  const displayDecks = sortedDecks.filter(d => d.name !== 'Default' && !d.name.startsWith('FISI3011'));

  // aggregate totals for hero stats
  let totalNew = 0, totalLearn = 0, totalReview = 0;
  displayDecks.forEach(d => {
    const c = counts[d.id] || { new:0, learn:0, review:0 };
    totalNew += c.new; totalLearn += c.learn; totalReview += c.review;
  });

  return (
    <View style={styles.container}>
  {/* background pattern removed */}
      <FlatList
          data={displayDecks}
          keyExtractor={d => String(d.id)}
          ListHeaderComponent={(
            <Animated.View style={[styles.hero, { opacity: heroFade, transform:[{ translateY: heroFade.interpolate({ inputRange:[0,1], outputRange:[18,0] }) }] }] }>
              <View style={styles.heroTextBlock}>
                <Text style={styles.title}>Chemistry Decks</Text>
                <Text style={styles.tagline}>You have {totalNew + totalLearn + totalReview} cards waiting</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBubble}><Text style={styles.statNumber}>{totalNew}</Text><Text style={styles.statLabel}>New</Text></View>
                  <View style={[styles.statBubble, styles.learnBubble]}><Text style={styles.statNumber}>{totalLearn}</Text><Text style={styles.statLabel}>Learn</Text></View>
                  <View style={[styles.statBubble, styles.reviewBubble]}><Text style={styles.statNumber}>{totalReview}</Text><Text style={styles.statLabel}>Review</Text></View>
                </View>
              </View>
              <Image source={chemImg} style={styles.heroArt} />
            </Animated.View>
          )}
          renderItem={({ item, index }) => {
            const c = counts[item.id] || { new: 0, learn: 0, review: 0 };
            
            return (
              <View>
                <TouchableOpacity 
                  style={[styles.deck, { backgroundColor: palette.panel, borderColor: palette.border }]} 
                  onPress={() => navigation.navigate('Study', { deckId: item.id })}
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
            onPress={() => navigation.navigate('AddNote', { deckId: displayDecks[0]?.id })}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>➕ Add Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{ flex: 1, marginLeft: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.info, borderColor: palette.border }}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('UploadNotes', { deckId: displayDecks[0]?.id })}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>🤖 From Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, marginLeft: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.warning, borderColor: palette.border }}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ImageNotes', { deckId: displayDecks[0]?.id })}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: pixelFont.heavy }}>📷 From Image</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}
 
