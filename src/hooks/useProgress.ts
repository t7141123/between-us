/**
 * useProgress: which questions the user has already been through, and the conversation streak.
 * Everything stays on the device. State lives in refs mirrored into React state so the deck builder
 * can read the latest values without re-running.
 */
import { useCallback, useRef, useState } from 'react';
import { StorageService } from '../services/storage';
import { dayKey, EMPTY_STREAK, recordActivity, StreakState } from '../services/progressCore';

export function useProgress() {
  const seenRef = useRef<Set<string>>(new Set());
  const streakRef = useRef<StreakState>(EMPTY_STREAK);
  const [seen, setSeen] = useState<Set<string>>(() => new Set())
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);

  /** Load persisted values (called once after storage has been read). */
  const hydrate = useCallback((savedSeen: string[], savedStreak: StreakState) => {
    seenRef.current = new Set(savedSeen);
    streakRef.current = savedStreak;
    setSeen(seenRef.current);
    setStreak(savedStreak);
  }, []);

  /** The user spent time with a question: remember it and count today as a conversation day. */
  const markSeen = useCallback((qid: string) => {
    if (!seenRef.current.has(qid)) {
      const next = new Set(seenRef.current);
      next.add(qid);
      seenRef.current = next;
      setSeen(next);
      void StorageService.setSeen([...next]);
    }
    const updated = recordActivity(streakRef.current, dayKey(new Date()));
    if (updated !== streakRef.current) {
      streakRef.current = updated;
      setStreak(updated);
      void StorageService.setStreak(updated);
    }
  }, []);

  /** Forget the given questions so they can be drawn as new again. */
  const resetSeen = useCallback((qids: string[]) => {
    const next = new Set(seenRef.current);
    for (const qid of qids) next.delete(qid);
    seenRef.current = next;
    setSeen(next);
    void StorageService.setSeen([...next]);
  }, []);

  /** Replace everything (used when a cloud backup is adopted or merged). */
  const replaceSeen = useCallback((qids: string[]) => {
    seenRef.current = new Set(qids);
    setSeen(seenRef.current);
    void StorageService.setSeen(qids);
  }, []);

  return { seen, seenRef, streak, hydrate, markSeen, resetSeen, replaceSeen };
}
