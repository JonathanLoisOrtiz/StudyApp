import { Card } from '../state/deckStore';

// Simplified Anki-like answer handler
export function applyAnswer(card: Card, rating: 'again'|'hard'|'good'|'easy'): Card {
  const now = Date.now();
  let { ease, interval, queue, type, reps, lapses } = card;
  reps += 1;

  const clone = { ...card };

  const setReview = (days: number) => {
    clone.queue = 2; // review
    clone.type = 2;
    clone.interval = Math.max(1, Math.round(days));
    clone.due = now + clone.interval * 86400000;
  };

  if (queue === 0) { // new -> learning steps collapsed simplified
    if (rating === 'again') {
      clone.due = now + 60_000; // 1m
      clone.queue = 1; // learning
      clone.type = 1;
    } else if (rating === 'hard') {
      setReview(1); // graduate short
    } else if (rating === 'good') {
      setReview(4);
    } else { // easy
      ease += 15;
      setReview(7);
    }
  } else if (queue === 2) { // review
    if (rating === 'again') {
      lapses += 1;
      ease = Math.max(130, ease - 20);
      clone.queue = 3; // relearning
      clone.type = 3;
      clone.due = now + 600_000; // 10m relearn step
      clone.interval = Math.floor(interval * 0.7);
    } else if (rating === 'hard') {
      ease = Math.max(130, ease - 15);
      interval = Math.max(interval + 1, Math.round(interval * 1.2));
      setReview(interval);
    } else if (rating === 'good') {
      const factor = ease / 100;
      const newInterval = interval * factor;
      setReview(newInterval);
    } else { // easy
      ease += 15;
      const factor = ease / 100 * 1.3;
      setReview(interval * factor);
    }
  } else if (queue === 1 || queue === 3) { // learning/relearning simplified
    if (rating === 'again') {
      clone.due = now + 60_000;
    } else if (rating === 'hard') {
      clone.due = now + 5 * 60_000;
    } else if (rating === 'good') {
      setReview(1);
    } else {
      ease += 15;
      setReview(4);
    }
  }

  clone.ease = ease;
  clone.reps = reps;
  clone.interval = clone.interval;
  clone.lapses = lapses;
  return clone;
}
