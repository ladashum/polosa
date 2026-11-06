import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  answerQuestion,
  createSession,
  expireSession,
  goNext,
  quitSession,
  type Mode,
  type Session,
} from "@/lib/exam";

type HistoryItem = {
  id: string;
  at: number;
  mode: Mode;
  passed: boolean | null;
  correct: number;
  total: number;
  reason: string;
};

type State = {
  hydrated: boolean;
  seen: string[];
  results: Record<string, boolean>;
  history: HistoryItem[];
  streak: number;
  streakDate: string;
  session: Session | null;
  setHydrated: () => void;
  seeChapter: (slug: string) => void;
  start: (mode: Mode, topic?: string) => boolean;
  pick: (choice: number) => void;
  next: () => void;
  expire: () => void;
  quit: () => void;
  clearSession: () => void;
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function streakPatch(streak: number, streakDate: string) {
  const today = dayKey(new Date());
  if (streakDate === today) return { streak, streakDate };
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return {
    streak: streakDate === dayKey(y) ? streak + 1 : 1,
    streakDate: today,
  };
}

function record(session: Session, state: State): Partial<State> {
  if (session.phase !== "done" || session.recorded) return { session };
  const results = { ...state.results };
  session.slots.forEach((slot, i) => {
    const choice = session.answers[i];
    if (choice === null) return;
    results[slot.q.id] = choice === slot.q.answer;
  });
  const correct = session.slots.filter(
    (slot, i) => session.answers[i] === slot.q.answer,
  ).length;
  const item: HistoryItem = {
    id: session.id,
    at: Date.now(),
    mode: session.mode,
    passed: session.passed,
    correct,
    total: session.slots.length,
    reason: session.reason,
  };
  return {
    session: { ...session, recorded: true },
    results,
    history: [item, ...state.history].slice(0, 12),
    ...streakPatch(state.streak, state.streakDate),
  };
}

export const usePdd = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      seen: [],
      results: {},
      history: [],
      streak: 0,
      streakDate: "",
      session: null,
      setHydrated: () => set({ hydrated: true }),
      seeChapter: (slug) =>
        set((state) => ({
          seen: state.seen.includes(slug) ? state.seen : [...state.seen, slug],
          ...streakPatch(state.streak, state.streakDate),
        })),
      start: (mode, topic) => {
        const mistakeIds = Object.entries(get().results)
          .filter(([, ok]) => !ok)
          .map(([id]) => id);
        const session = createSession(mode, { topic, mistakeIds });
        if (!session) return false;
        set({ session });
        return true;
      },
      pick: (choice) => {
        const state = get();
        if (!state.session) return;
        const session = answerQuestion(state.session, choice);
        set(record(session, state));
      },
      next: () => {
        const state = get();
        if (!state.session) return;
        const session = goNext(state.session);
        set(record(session, state));
      },
      expire: () => {
        const state = get();
        if (!state.session) return;
        const session = expireSession(state.session);
        set(record(session, state));
      },
      quit: () => {
        const state = get();
        if (!state.session) return;
        const session = quitSession(state.session);
        set(record(session, state));
      },
      clearSession: () => set({ session: null }),
    }),
    {
      name: "polosa-pdd-v1",
      skipHydration: true,
      partialize: (state) => ({
        seen: state.seen,
        results: state.results,
        history: state.history,
        streak: state.streak,
        streakDate: state.streakDate,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function HydratePdd() {
  useEffect(() => {
    void Promise.resolve(usePdd.persist.rehydrate()).finally(() => {
      usePdd.getState().setHydrated();
    });
  }, []);
  return null;
}

export function accuracyOf(results: Record<string, boolean>) {
  const vals = Object.values(results);
  if (vals.length === 0) return 0;
  return Math.round((vals.filter(Boolean).length / vals.length) * 100);
}
