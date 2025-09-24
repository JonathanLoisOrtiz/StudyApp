import { create } from 'zustand';
import { execute, query, runMigrations, getMeta, setMeta } from '../db/database';
import { clearStudyNotifications, scheduleDueBuckets } from '../notifications/notifications';

export interface Deck { id: number; name: string; }
export interface Card { id: number; deckId: number; front: string; back: string; queue: number; type: number; due: number; interval: number; ease: number; reps: number; lapses: number; left: number; originalDue?: number; }

interface Counts { new: number; learn: number; review: number; }

// Organic chemistry starter set (subset)
const organicCardsSeed: { front: string; back: string }[] = [
  { front: 'Define functional group', back: 'Specific atom arrangement giving characteristic reactivity' },
  { front: 'Hybridization of carbonyl carbon', back: 'sp2 trigonal planar (~120°)' },
  { front: 'Order of carbonyl electrophilicity', back: 'Acid chloride > anhydride > aldehyde > ketone > ester ≈ acid > amide' },
  { front: 'Phenol vs alcohol acidity', back: 'Phenol more acidic (resonance-stabilized phenoxide)' },
  { front: 'Criteria for aromaticity', back: 'Cyclic, planar, fully conjugated, 4n+2 π electrons' },
  { front: 'Aldol key steps', back: 'Enolate -> addition -> β-hydroxy carbonyl (-> dehydration)' },
  { front: '¹H NMR aldehydic proton shift', back: '~9–10 ppm' },
  { front: 'IR ~1700 cm⁻¹ strong peak', back: 'C=O stretch' },
  { front: 'LiAlH4 vs NaBH4 scope', back: 'LiAlH4 reduces esters/acids/amides; NaBH4 aldehydes/ketones mainly' },
  { front: 'Michael addition', back: '1,4-conjugate addition to α,β-unsaturated carbonyl' }
];

// FISI3011 Exam decks (formula/memorization-focused)
const fisiExam1Cards: { front: string; back: string }[] = [
  // Kinematics 1D
  { front: 'Average velocity (1D)', back: 'v_avg = Δx / Δt' },
  { front: 'Instantaneous velocity', back: 'v = dx/dt' },
  { front: 'Average acceleration', back: 'a_avg = Δv / Δt' },
  { front: 'Instantaneous acceleration', back: 'a = dv/dt' },
  { front: 'Kinematics: v(t) with constant a', back: 'v = v₀ + a t' },
  { front: 'Kinematics: x(t) with constant a', back: 'x = x₀ + v₀ t + (1/2) a t²' },
  { front: 'Kinematics: v² relation', back: 'v² = v₀² + 2 a (x - x₀)' },
  { front: 'Free-fall acceleration near Earth', back: 'g ≈ 9.8 m/s² downward' },
  { front: 'Velocity at top of vertical throw', back: 'v_top = 0' },
  { front: 'Time to top (vertical throw)', back: 't_top = v₀ / g' },
  // Vectors and 2D
  { front: 'Vector magnitude from components', back: '|A| = √(Aₓ² + A_y²)' },
  { front: 'Unit vectors in 2D', back: 'î along x, ĵ along y' },
  { front: 'Dot product (formula)', back: 'A·B = AB cosθ = AₓBₓ + A_yB_y' },
  { front: 'Projectile: horizontal position', back: 'x = v₀ cosθ · t' },
  { front: 'Projectile: vertical position', back: 'y = v₀ sinθ · t − (1/2) g t²' },
  { front: 'Projectile range (level ground)', back: 'R = (v₀²/g) sin(2θ)' },
  { front: 'Projectile max height', back: 'H = v₀² sin²θ / (2g)' },
  { front: 'Relative velocity (A wrt B)', back: 'v_{A/B} = v_A − v_B' },
  { front: 'Angle from components', back: 'θ = atan2(A_y, Aₓ)' },
  { front: 'Average speed vs average velocity', back: 'Speed = total distance / time; Velocity = displacement / time (vector)' },
  // Concepts
  { front: 'Displacement vs distance', back: 'Displacement is vector Δx; distance is scalar path length' },
  { front: 'Acceleration sign meaning', back: 'Sign indicates direction of change of velocity vector' },
  { front: 'Projectile independence', back: 'Horizontal and vertical motions are independent (only g acts)' },
];

const fisiExam2Cards: { front: string; back: string }[] = [
  // Newton’s Laws
  { front: 'Newton’s 1st Law', back: 'If ΣF = 0, velocity is constant (inertia)' },
  { front: 'Newton’s 2nd Law', back: 'ΣF = m a (vector equation)' },
  { front: 'Newton’s 3rd Law', back: 'Forces come in equal and opposite pairs on different bodies' },
  { front: 'Weight', back: 'W = m g (near Earth surface)' },
  { front: 'Normal force on flat surface', back: 'N = mg (no other vertical forces)' },
  { front: 'Incline: components of weight', back: 'Parallel: mg sinθ, Perpendicular: mg cosθ' },
  { front: 'Tension in massless rope', back: 'Same magnitude throughout (ideal)' },
  // Friction
  { front: 'Static friction (inequality)', back: 'f_s ≤ μ_s N' },
  { front: 'Kinetic friction', back: 'f_k = μ_k N (opposes motion)' },
  { front: 'Rolling vs sliding friction', back: 'Rolling friction typically much smaller than kinetic' },
  // Circular Motion
  { front: 'Centripetal acceleration', back: 'a_c = v² / r = ω² r (toward center)' },
  { front: 'Centripetal force requirement', back: 'F_c = m v² / r (net inward force)' },
  { front: 'Banked curve (no friction)', back: 'tanθ = v² / (r g)' },
  { front: 'Flat curve v_max (with friction)', back: 'v_max = √(μ_s g r)' },
  { front: 'Conical pendulum tension', back: 'T cosθ = mg; T sinθ = m v² / r' },
  { front: 'Period and angular speed', back: 'ω = 2π/T; v = ω r' },
  // Multi-body basics
  { front: 'Atwood machine acceleration', back: 'a = (m₂ − m₁) g / (m₁ + m₂) (ideal, no friction)' },
  { front: 'Pulley with frictionless table', back: 'ΣF_x = T − f_k = m a (example); f_k = μ_k N' },
  { front: 'Tension vs acceleration sign', back: 'Direction of a sets tension equations for each mass' },
];

const fisiExam3Cards: { front: string; back: string }[] = [
  // Gravitation
  { front: 'Newton’s Law of Gravitation', back: 'F = G m₁ m₂ / r²' },
  { front: 'Gravitational field of mass M', back: 'g(r) = G M / r² (toward M)' },
  { front: 'Gravitational potential energy', back: 'U(r) = − G M m / r' },
  { front: 'Escape speed from radius R', back: 'v_e = √(2 G M / R)' },
  { front: 'Circular orbit speed', back: 'v_orb = √(G M / r)' },
  { front: 'Orbital period (Kepler 3rd)', back: 'T = 2π √(r³ / (G M))' },
  { front: 'Total energy in circular orbit', back: 'E = − G M m / (2 r)' },
  // Work & Energy
  { front: 'Work (definition)', back: 'W = ∫ F · dx (path integral); for constant F: W = F d cosθ' },
  { front: 'Kinetic energy', back: 'K = (1/2) m v²' },
  { front: 'Work–energy theorem', back: 'W_net = ΔK' },
  { front: 'Power (instantaneous)', back: 'P = dW/dt = F · v' },
  { front: 'Spring potential energy', back: 'U_s = (1/2) k x²' },
  { front: 'Conservation of mechanical energy', back: 'K₁ + U₁ + W_nc = K₂ + U₂ (if W_nc = 0, K+U constant)' },
  { front: 'Turning point (1D potential)', back: 'At turning points, K = 0 and E = U' },
  { front: 'Coefficient of restitution e', back: 'e = |v_rel,after| / |v_rel,before| (collisions; if covered later)' },
  // Energy techniques
  { front: 'Speed from energy drop ΔU', back: 'ΔK = −ΔU ⇒ v = √(v₀² + (2/m)(U₀ − U))' },
  { front: 'Spring-mass maximum speed', back: 'v_max at x = 0: v_max = √(2E/m) with E = (1/2) k A²' },
  { front: 'Nonconservative work example', back: 'W_friction = − f_k d = − μ_k N d' },
  // Momentum intro (preview)
  { front: 'Impulse–momentum', back: 'J = ∫F dt = Δp (if momentum included early)' },
];

interface DeckState {
  decks: Deck[];
  cards: Card[];
  counts: Record<number, Counts>;
  initialized: boolean;
  autoImported: boolean;
  init: () => Promise<void>;
  addDeck: (name: string) => Promise<number>;
  deleteDeck: (id: number) => Promise<void>;
  addCard: (deckId: number, front: string, back: string) => Promise<number>;
  bulkAddCards: (deckId: number, cards: {front:string;back:string;}[]) => Promise<void>;
  updateCard: (c: Card) => Promise<void>;
  reloadCardsForDeck: (deckId: number) => Promise<void>;
  rebuildCounts: () => void;
  deleteCard: (id: number) => Promise<void>;
}

const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  cards: [],
  counts: {},
  initialized: false,
  autoImported: false,
  init: async () => {
    if (get().initialized) return;
    await runMigrations();
    const deckRows = await query<Deck>('SELECT * FROM decks');
    let decks = deckRows.rows;
    // Remove legacy 'Default' deck if present
    const defaultDeck = decks.find(d => d.name === 'Default');
    if (defaultDeck) {
      await execute('DELETE FROM cards WHERE deck_id=?', [defaultDeck.id]);
      await execute('DELETE FROM decks WHERE id=?', [defaultDeck.id]);
      decks = decks.filter(d => d.id !== defaultDeck.id);
    }
    const cardRows = await query<any>('SELECT * FROM cards');
    let cards = cardRows.rows.map(mapDbCard);

    const seeded = await getMeta('organicSeeded');
    if (!seeded) {
      let organic = decks.find(d => d.name === 'Organic Chemistry');
      if (!organic) {
        const id = await execute('INSERT INTO decks(name) VALUES(?)', ['Organic Chemistry']);
        organic = { id, name: 'Organic Chemistry' };
        decks.push(organic);
      }
      const now = Date.now();
      for (const c of organicCardsSeed) {
        const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [organic.id, c.front, c.back, 0, 0, now, 0, 250, 0, 0, 0]);
        cards.push({ id, deckId: organic.id, front: c.front, back: c.back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 });
      }
      await setMeta('organicSeeded', '1');
    }

    // Auto-import exam decks
    const examSeeded = await getMeta('examDecksSeeded');
    if (!examSeeded) {
      // Delete decks with ID 1 and 2 if they exist
      const deck1 = decks.find(d => d.id === 1);
      const deck2 = decks.find(d => d.id === 2);
      if (deck1) {
        await execute('DELETE FROM cards WHERE deck_id=?', [1]);
        await execute('DELETE FROM decks WHERE id=?', [1]);
        decks = decks.filter(d => d.id !== 1);
        cards = cards.filter(c => c.deckId !== 1);
      }
      if (deck2) {
        await execute('DELETE FROM cards WHERE deck_id=?', [2]);
        await execute('DELETE FROM decks WHERE id=?', [2]);
        decks = decks.filter(d => d.id !== 2);
        cards = cards.filter(c => c.deckId !== 2);
      }
      await setMeta('examDecksSeeded', '1');
    }

    // Seed Physics (FISI3011) exam decks if missing
    const physiSeeded = await getMeta('fisi3011Seeded');
    if (!physiSeeded) {
      const getOrCreateDeck = async (name: string) => {
        let deck = decks.find(d => d.name === name);
        if (!deck) {
          const id = await execute('INSERT INTO decks(name) VALUES(?)', [name]);
          deck = { id, name };
          decks.push(deck);
        }
        return deck;
      };

      const now = Date.now();
      const exam1 = await getOrCreateDeck('FISI3011 - Examen 1');
      const exam2 = await getOrCreateDeck('FISI3011 - Examen 2');
      const exam3 = await getOrCreateDeck('FISI3011 - Examen 3');

      for (const c of fisiExam1Cards) {
        const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [exam1.id, c.front, c.back, 0, 0, now, 0, 250, 0, 0, 0]);
        cards.push({ id, deckId: exam1.id, front: c.front, back: c.back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 });
      }
      for (const c of fisiExam2Cards) {
        const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [exam2.id, c.front, c.back, 0, 0, now, 0, 250, 0, 0, 0]);
        cards.push({ id, deckId: exam2.id, front: c.front, back: c.back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 });
      }
      for (const c of fisiExam3Cards) {
        const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [exam3.id, c.front, c.back, 0, 0, now, 0, 250, 0, 0, 0]);
        cards.push({ id, deckId: exam3.id, front: c.front, back: c.back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 });
      }

      await setMeta('fisi3011Seeded', '1');
    }

    set({ decks, cards, initialized: true });
    console.log('[DeckStore] init loaded cards:', cards.length, 'sample:', cards.slice(0,2));
    get().rebuildCounts();
  },
  addDeck: async (name) => {
    const id = await execute('INSERT INTO decks(name) VALUES(?)', [name]);
    set(s => ({ decks: [...s.decks, { id, name }] }));
    return id;
  },
  deleteDeck: async (id) => {
    await execute('DELETE FROM cards WHERE deck_id=?', [id]);
    await execute('DELETE FROM decks WHERE id=?', [id]);
    set(s => ({ 
      decks: s.decks.filter(d => d.id !== id),
      cards: s.cards.filter(c => c.deckId !== id)
    }));
    get().rebuildCounts();
  },
  addCard: async (deckId, front, back) => {
    const now = Date.now();
    const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [deckId, front, back, 0, 0, now, 0, 250, 0, 0, 0]);
    const card: Card = { id, deckId, front, back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 };
    set(s => ({ cards: [...s.cards, card] }));
    get().rebuildCounts();
    return id;
  },
  bulkAddCards: async (deckId, cardsArr) => {
    const now = Date.now();
    for (const c of cardsArr) {
      const id = await execute('INSERT INTO cards(deck_id, front, back, queue, type, due, interval, ease, reps, lapses, left) VALUES(?,?,?,?,?,?,?,?,?,?,?)', [deckId, c.front, c.back, 0, 0, now, 0, 250, 0, 0, 0]);
      const card = { id, deckId, front: c.front, back: c.back, queue: 0, type: 0, due: now, interval: 0, ease: 250, reps: 0, lapses: 0, left: 0 };
      set(s => ({ cards: [...s.cards, card] }));
    }
    get().rebuildCounts();
  },
  updateCard: async (c) => {
    await execute('UPDATE cards SET deck_id=?, front=?, back=?, queue=?, type=?, due=?, interval=?, ease=?, reps=?, lapses=?, left=?, original_due=? WHERE id=?', [c.deckId, c.front, c.back, c.queue, c.type, c.due, c.interval, c.ease, c.reps, c.lapses, c.left, c.originalDue ?? null, c.id]);
    set(s => ({ cards: s.cards.map(x => x.id === c.id ? c : x) }));
  },
  deleteCard: async (id) => {
    await execute('DELETE FROM cards WHERE id=?', [id]);
    set(s => ({ cards: s.cards.filter(c => c.id !== id) }));
    get().rebuildCounts();
  },
  reloadCardsForDeck: async (deckId) => {
    const res = await query<any>('SELECT * FROM cards WHERE deck_id=?', [deckId]);
    const mapped = res.rows.map(mapDbCard);
    const others = get().cards.filter(c => c.deckId !== deckId);
    set({ cards: [...others, ...mapped] });
  },
  rebuildCounts: () => {
    const counts: Record<number, Counts> = {};
    const now = Date.now();
    const dueTimes: number[] = [];
    get().cards.forEach(c => {
      const deckCounts = counts[c.deckId] ||= { new: 0, learn: 0, review: 0 };
      if (c.queue === 0) deckCounts.new++;
      else if (c.queue === 1 || c.queue === 3) deckCounts.learn++;
      else if (c.queue === 2) {
        if (c.due <= now) deckCounts.review++; else dueTimes.push(c.due);
      }
    });
    set({ counts });
    const bucketsMap: Record<number, number> = {};
    const windowMs = 30 * 60 * 1000;
    dueTimes.sort().forEach(t => {
      const bucket = Math.floor(t / windowMs) * windowMs;
      bucketsMap[bucket] = (bucketsMap[bucket] || 0) + 1;
    });
    const buckets = Object.entries(bucketsMap).map(([time, count]) => ({ time: Number(time), count }));
    clearStudyNotifications().then(() => scheduleDueBuckets(buckets));
  }
}));

function mapDbCard(row: any) {
  return {
    id: row.id,
    deckId: row.deck_id,
    front: row.front,
    back: row.back,
    queue: row.queue,
    type: row.type,
    due: row.due,
    interval: row.interval,
    ease: row.ease,
    reps: row.reps,
    lapses: row.lapses,
    left: row.left,
    originalDue: row.original_due ?? undefined
  } as Card;
}

export default useDeckStore;
