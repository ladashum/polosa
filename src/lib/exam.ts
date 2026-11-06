import { QUESTIONS, type Question } from "@/data/questions";

export type Mode = "exam" | "sprint" | "topic" | "mistakes";

export type Slot = {
  q: Question;
  extra: boolean;
};

export type Session = {
  id: string;
  mode: Mode;
  strict: boolean;
  topic?: string;
  slots: Slot[];
  mainCount: number;
  index: number;
  answers: (number | null)[];
  revealed: boolean;
  deadline: number | null;
  phase: "run" | "done";
  passed: boolean | null;
  reason: string;
  recorded: boolean;
  addedExtra: boolean;
};

function sample<T>(list: readonly T[], n: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function ticketPool() {
  return QUESTIONS.filter((q) => q.block >= 1);
}

export function createSession(
  mode: Mode,
  opts?: { topic?: string; mistakeIds?: string[] },
): Session | null {
  let picked: Question[] = [];
  let strict = false;
  let deadline: number | null = null;
  const now = Date.now();

  if (mode === "exam") {
    strict = true;
    deadline = now + 20 * 60 * 1000;
    const pool = ticketPool();
    for (const block of [1, 2, 3, 4] as const) {
      const group = pool.filter((q) => q.block === block);
      picked.push(...sample(group, 5));
    }
  } else if (mode === "sprint") {
    deadline = now + 10 * 60 * 1000;
    picked = sample(ticketPool(), 10);
  } else if (mode === "topic") {
    const topic = opts?.topic;
    if (!topic) return null;
    picked = sample(
      QUESTIONS.filter((q) => q.topic === topic),
      10,
    );
  } else {
    const ids = new Set(opts?.mistakeIds ?? []);
    picked = QUESTIONS.filter((q) => ids.has(q.id));
    if (picked.length === 0) return null;
  }

  if (picked.length === 0) return null;

  return {
    id: `b-${now.toString(36)}-${Math.floor(Math.random() * 1000)}`,
    mode,
    strict,
    topic: opts?.topic,
    slots: picked.map((q) => ({ q, extra: false })),
    mainCount: picked.length,
    index: 0,
    answers: picked.map(() => null),
    revealed: false,
    deadline,
    phase: "run",
    passed: null,
    reason: "",
    recorded: false,
    addedExtra: false,
  };
}

function fail(session: Session, reason: string): Session {
  return { ...session, phase: "done", passed: false, reason, revealed: false };
}

function succeed(session: Session, reason: string): Session {
  return { ...session, phase: "done", passed: true, reason, revealed: false };
}

function looseFinish(session: Session, reason: string): Session {
  const correct = session.slots.filter(
    (slot, i) => session.answers[i] === slot.q.answer,
  ).length;
  const all = correct === session.slots.length;
  return {
    ...session,
    phase: "done",
    passed: all,
    reason: reason || `${correct} из ${session.slots.length}`,
    revealed: false,
  };
}

function mainWrongIndexes(session: Session): number[] {
  const indexes: number[] = [];
  for (let i = 0; i < session.mainCount; i += 1) {
    if (session.answers[i] !== session.slots[i]!.q.answer) indexes.push(i);
  }
  return indexes;
}

function openExtras(session: Session, now: number): Session {
  const wrong = mainWrongIndexes(session);
  if (session.deadline !== null && now > session.deadline) {
    return fail(session, "Время вышло.");
  }
  if (wrong.length === 0) return succeed(session, "Все ответы билета верные.");
  if (wrong.length >= 3) {
    return fail(session, "Три ошибки в билете. Дополнительных вопросов уже нет.");
  }
  const blocks = wrong.map((i) => session.slots[i]!.q.block);
  if (new Set(blocks).size !== wrong.length) {
    return fail(session, "Две ошибки в одном тематическом блоке.");
  }

  const used = new Set(session.slots.map((slot) => slot.q.id));
  const extra: Slot[] = [];
  for (const i of wrong) {
    const block = session.slots[i]!.q.block;
    const pool = QUESTIONS.filter((q) => q.block === block && !used.has(q.id));
    const picked = sample(pool, 5);
    if (picked.length < 5) {
      return fail(
        session,
        "В этом блоке тренажёра не хватило вопросов на дополнительный набор.",
      );
    }
    for (const q of picked) {
      used.add(q.id);
      extra.push({ q, extra: true });
    }
  }

  const bonus = wrong.length * 5 * 60 * 1000;
  return {
    ...session,
    slots: [...session.slots, ...extra],
    answers: [...session.answers, ...extra.map(() => null)],
    index: session.mainCount,
    addedExtra: true,
    deadline: (session.deadline ?? now) + bonus,
    reason: "",
  };
}

function closeExtras(session: Session): Session {
  const extras = session.slots
    .map((slot, i) => ({ slot, i }))
    .filter((item) => item.slot.extra);
  const bad = extras.some((item) => session.answers[item.i] !== item.slot.q.answer);
  if (bad) return fail(session, "Ошибка в дополнительном блоке.");
  const mistakes = mainWrongIndexes(session).length;
  return succeed(
    session,
    mistakes === 1
      ? "Одна ошибка закрыта пятью дополнительными вопросами."
      : "Две ошибки в разных блоках закрыты дополнительными вопросами.",
  );
}

export function answerQuestion(session: Session, choice: number, now = Date.now()): Session {
  if (session.phase === "done") return session;
  if (session.answers[session.index] !== null && session.strict) return session;

  const answers = session.answers.slice();
  answers[session.index] = choice;
  const next: Session = { ...session, answers };

  if (!session.strict) return { ...next, revealed: true };

  const last = next.index >= next.slots.length - 1;
  if (!last) return { ...next, index: next.index + 1, revealed: false };

  if (!next.addedExtra) return openExtras(next, now);
  return closeExtras(next);
}

export function goNext(session: Session): Session {
  if (session.phase === "done" || session.strict) return session;
  if (!session.revealed) return session;
  if (session.index < session.slots.length - 1) {
    return { ...session, index: session.index + 1, revealed: false };
  }
  return looseFinish(session, "");
}

export function expireSession(session: Session): Session {
  if (session.phase === "done" || session.deadline === null) return session;
  if (Date.now() < session.deadline) return session;
  if (!session.strict) return looseFinish(session, "Время вышло.");
  return fail(session, "Время вышло.");
}

export function quitSession(session: Session): Session {
  if (session.phase === "done") return session;
  if (!session.strict) return looseFinish(session, "Билет закрыт досрочно.");
  return fail(session, "Билет закрыт досрочно.");
}

export function scoreOf(session: Session) {
  const total = session.slots.length;
  const correct = session.slots.filter(
    (slot, i) => session.answers[i] === slot.q.answer,
  ).length;
  return { correct, total };
}
