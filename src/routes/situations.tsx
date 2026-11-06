import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SITUATIONS } from "@/data/situations";
import { Diagram } from "@/components/diagram";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/situations")({ component: SituationsPage });

function SituationsPage() {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [good, setGood] = useState(0);
  const item = SITUATIONS[index];

  if (!item) {
    return (
      <Shell>
        <p className="text-xs font-medium tracking-widest text-signal">СХЕМЫ</p>
        <h1 className="font-display mt-3 text-4xl">
          {good} из {SITUATIONS.length}
        </h1>
        <p className="mt-3 text-muted">Порядок проезда уже звучит одной фразой.</p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setPick(null);
            setGood(0);
          }}
          className="mt-6 min-h-12 rounded-2xl bg-signal px-5 font-semibold text-ink"
        >
          Пройти ещё раз
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-medium tracking-widest text-signal">
        КТО ПЕРВЫЙ · {index + 1} / {SITUATIONS.length}
      </p>
      <h1 className="font-display mt-3 text-3xl">{item.title}</h1>
      <p className="mt-2 text-muted">{item.scene}</p>
      <div className="mt-4">
        <Diagram id={item.id} />
      </div>
      <p className="mt-4 font-medium">{item.prompt}</p>
      <div className="mt-3 grid gap-2">
        {item.options.map((option, optionIndex) => {
          const revealed = pick !== null;
          const chosen = pick === optionIndex;
          const correct = optionIndex === item.answer;
          let tone = "border-line bg-surface";
          if (revealed && correct) tone = "border-ok bg-ok text-paper";
          else if (revealed && chosen) tone = "border-danger bg-danger text-paper";
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPick(optionIndex);
                if (optionIndex === item.answer) setGood((n) => n + 1);
              }}
              className={`min-h-12 rounded-2xl border px-4 text-left text-sm ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {pick !== null ? (
        <div className="mt-4 rounded-2xl bg-paper p-4 text-ink">
          <p className="font-display text-xl">{item.hook}</p>
          <p className="mt-2 text-sm leading-relaxed">{item.why}</p>
          <p className="mt-2 text-xs text-ink/60">{item.rule}</p>
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
        </div>
      ) : null}
    </Shell>
  );
}
