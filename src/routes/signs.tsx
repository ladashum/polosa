import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { SIGN_GROUPS, SIGNS } from "@/data/signs";
import type { SignInfo } from "@/data/types";
import { RoadSign } from "@/components/road-sign";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/signs")({ component: SignsPage });

function SignsPage() {
  const [group, setGroup] = useState<(typeof SIGN_GROUPS)[number]>("Все");
  const [open, setOpen] = useState<string | null>(null);
  const [quiz, setQuiz] = useState(false);
  const visible = SIGNS.filter((sign) => group === "Все" || sign.group === group);

  return (
    <Shell>
      <p className="text-xs font-medium tracking-widest text-signal">ЗНАКИ</p>
      <h1 className="font-display mt-3 text-4xl">Сначала форма, потом смысл</h1>
      <p className="mt-3 max-w-xl text-muted">
        Треугольник предупреждает. Круг с красной каймой запрещает. Синий круг приказывает.
        Жёлтый ромб — главная. Перевёрнутый треугольник — уступи.
      </p>
      <button
        type="button"
        onClick={() => setQuiz(true)}
        className="mt-5 inline-flex min-h-12 items-center rounded-2xl bg-signal px-5 font-semibold text-ink"
      >
        Узнай знак
      </button>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {SIGN_GROUPS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGroup(item)}
            className={`shrink-0 rounded-full px-3 py-2 text-sm ${
              group === item ? "bg-signal text-ink" : "bg-surface text-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((sign) => (
          <li key={sign.id}>
            <button
              type="button"
              onClick={() => setOpen(open === sign.id ? null : sign.id)}
              className="flex w-full flex-col items-center rounded-2xl border border-line bg-surface p-3 text-center"
            >
              <RoadSign id={sign.id} className="h-24 w-24" />
              <span className="mt-2 text-xs text-signal">{sign.code}</span>
              <span className="mt-1 text-sm leading-snug">{sign.name}</span>
            </button>
            {open === sign.id ? (
              <div className="mt-2 rounded-2xl bg-paper p-3 text-left text-sm text-ink">
                <p>{sign.meaning}</p>
                <p className="mt-2">{sign.action}</p>
                <p className="mt-2 font-semibold">{sign.trap}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {quiz ? <Quiz onClose={() => setQuiz(false)} /> : null}
    </Shell>
  );
}

function Quiz({ onClose }: { onClose: () => void }) {
  const order = useMemo(() => shuffle(SIGNS), []);
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const sign = order[index];

  if (!sign || index >= order.length) {
    return (
      <Overlay>
        <p className="font-display text-3xl text-ink">
          {correctCount} из {order.length}
        </p>
        <p className="mt-2 text-ink/80">Форма уже сидит в руке. Смысл догонится на билете.</p>
        <button type="button" onClick={onClose} className="mt-5 min-h-12 rounded-2xl bg-ink px-5 text-paper">
          Закрыть
        </button>
      </Overlay>
    );
  }

  const options = optionsFor(sign, order);

  return (
    <Overlay>
      <div className="flex items-center justify-between text-sm text-ink/70">
        <span>
          {index + 1} / {order.length}
        </span>
        <button type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
      <RoadSign id={sign.id} className="mx-auto mt-4 h-40 w-40" />
      <p className="mt-3 text-center text-sm text-ink/70">Что это за знак?</p>
      <div className="mt-3 grid gap-2">
        {options.map((option) => {
          const revealed = pick !== null;
          const chosen = pick === option.id;
          const right = option.id === sign.id;
          let tone = "border-paper-line";
          if (revealed && right) tone = "border-ok bg-ok text-paper";
          else if (revealed && chosen) tone = "border-danger bg-danger text-paper";
          return (
            <button
              key={option.id}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPick(option.id);
                if (option.id === sign.id) setCorrectCount((n) => n + 1);
              }}
              className={`min-h-12 rounded-2xl border px-3 text-left text-sm text-ink ${tone}`}
            >
              {option.code} {option.name}
            </button>
          );
        })}
      </div>
      {pick ? (
        <button
          type="button"
          onClick={() => {
            setPick(null);
            setIndex((n) => n + 1);
          }}
          className="mt-4 min-h-12 rounded-2xl bg-ink px-5 font-semibold text-paper"
        >
          Дальше
        </button>
      ) : null}
    </Overlay>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-bg/80 p-3 md:items-center">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-4 text-ink">
        {children}
      </div>
    </div>
  );
}

function optionsFor(sign: SignInfo, all: SignInfo[]) {
  const others = shuffle(all.filter((item) => item.id !== sign.id)).slice(0, 3);
  return shuffle([sign, ...others]);
}

function shuffle<T>(list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}
