import { create } from 'zustand';
import useDeckStore, { Card } from './deckStore';
import { applyAnswer } from '../scheduler/scheduler';

interface StudyState {
  current: Card | null;
  revealed: boolean;
  queue: Card[];
  loadDeck: (deckId: number) => Promise<void>;
  reveal: () => void;
  answer: (rating: 'again'|'hard'|'good'|'easy') => Promise<void>;
  deleteCurrent: () => Promise<void>;
}

const useStudySession = create<StudyState>((set, get) => ({
  current: null,
  revealed: false,
  queue: [],
  loadDeck: async (deckId) => {
    await useDeckStore.getState().init();
    await useDeckStore.getState().reloadCardsForDeck(deckId);
    const { cards } = useDeckStore.getState();
    const due = Date.now();
    const deckCards = cards.filter(c => c.deckId === deckId && c.due <= due).sort((a,b)=>a.due-b.due);
    console.log('[StudySession] loadDeck deckId=', deckId, 'totalCardsInStore=', cards.length, 'matchingDeckCards=', deckCards.length); // DEBUG
    if (deckCards.length === 0) {
      const allForDeck = cards.filter(c => c.deckId === deckId);
      console.log('[StudySession] All cards for deck (ignoring due filter) length=', allForDeck.length, allForDeck.slice(0,3));
    }
    set({ queue: deckCards, current: deckCards[0] || null, revealed: false });
  },
  reveal: () => set({ revealed: true }),
  answer: async (rating) => {
    const s = get();
    if (!s.current) return;
    const updated = applyAnswer(s.current, rating);
    await useDeckStore.getState().updateCard(updated);
    const rest = s.queue.slice(1);
    set({ queue: rest, current: rest[0] || null, revealed: false });
    useDeckStore.getState().rebuildCounts();
  },
  deleteCurrent: async () => {
    const s = get();
    if (!s.current) return;
    const id = s.current.id;
    await useDeckStore.getState().deleteCard(id);
    const rest = s.queue.slice(1);
    set({ queue: rest, current: rest[0] || null, revealed: false });
  }
}));

export default useStudySession;
