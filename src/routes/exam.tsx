import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { scoreOf } from "@/lib/exam";
import { usePdd } from "@/lib/pdd-store";

export const Route = createFileRoute("/exam")({ component: ExamPage });

function ExamPage() {
  const hydrated = usePdd((s) => s.hydrated);
  const session = usePdd((s) => s.session);
  const pick = usePdd((s) => s.pick);
  const next = usePdd((s) => s.next);
  const expire = usePdd((s) => s.expire);
  const quit = usePdd((s) => s.quit);
  const clearSession = usePdd((s) => s.clearSession);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!session || session.phase === "done" || session.deadline === null) return;
    if (now >= session.deadline) expire();
  }, [now, session, expire]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!session || session.phase === "done") return;
      const n = Number(event.key);
      const slot = session.slots[session.index];
      if (!slot || n < 1 || n > slot.q.options.length) return;
      if (!session.strict && session.revealed) {
        if (event.key === "Enter") next();
        return;
      }
      pick(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, pick, next]);

  if (!hydrated) {
    return (
      <Shell>
        <p className="text-muted">Открываю билет…</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="font-display text-4xl">Билет ещё не открыт</h1>
        <Link
          to="/train"
          className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-signal px-5 font-semibold text-ink"
        >
          Выбрать режим
        </Link>
      </Shell>
    );
  }

  if (session.phase === "done") {
    const score = scoreOf(session);
    return (
      <Shell>
        <p className="text-xs font-medium tracking-widest text-signal">ИТОГ</p>
        <h1 className="font-display mt-3 text-5xl">{session.passed ? "Сдано" : "Ещё круг"}</h1>
        <p className="mt-3 max-w-xl text-lg">{session.reason}</p>
        <p className="mt-2 text-muted">
          Верных ответов: {score.correct} из {score.total}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/train"
            onClick={() => clearSession()}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-signal px-5 font-semibold text-ink"
          >
            Новый заход
          </Link>
        </div>
        <ol className="mt-8 grid gap-3">
          {session.slots.map((slot, i) => {
            const choice = session.answers[i];
            const ok = choice === slot.q.answer;
            return (
              <li key={`${slot.q.id}-${i}`} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs text-muted">
                  {slot.extra ? "Дополнительный" : "Основной"} · {ok ? "верно" : "ошибка"} · {slot.q.rule}
                </p>
                <p className="mt-1 font-medium">{slot.q.text}</p>
                <p className="mt-2 text-sm text-signal">{slot.q.hook}</p>
                <p className="mt-1 text-sm text-muted">{slot.q.why}</p>
              </li>
            );
          })}
        </ol>
      </Shell>
    );
  }

  const slot = session.slots[session.index]!;
  const left = session.deadline ? Math.max(0, session.deadline - now) : null;
  const urgent = left !== null && left < 60_000;

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {session.addedExtra ? "Дополнительный блок" : "Основной билет"} · {session.index + 1} /{" "}
          {session.slots.length}
        </p>
        <p className={`font-display text-xl ${urgent ? "text-danger" : "text-signal"}`}>
          {left === null ? "без таймера" : format(left)}
        </p>
      </div>
      <div className="mt-3 flex gap-1">
        {session.slots.map((item, i) => (
          <span
            key={`${item.q.id}-${i}`}
            className={`h-1.5 flex-1 rounded-full ${
              i === session.index ? "bg-signal" : session.answers[i] !== null ? "bg-muted" : "bg-line"
            }`}
          />
        ))}
      </div>

      <article className="mt-5 rounded-2xl bg-paper p-5 text-ink">
        <p className="text-xs font-semibold tracking-widest text-ink/50">
          {slot.q.rule}
          {slot.extra ? " · ДОП" : ""}
        </p>
        <h1 className="mt-2 text-xl leading-snug font-semibold">{slot.q.text}</h1>
        <div className="mt-4 grid gap-2">
          {slot.q.options.map((option, index) => {
            const chosen = session.answers[session.index] === index;
            const show = session.revealed;
            const correct = index === slot.q.answer;
            let tone = "border-paper-line bg-paper text-ink";
            if (show && correct) tone = "border-ok bg-ok text-paper";
            else if (show && chosen) tone = "border-danger bg-danger text-paper";
            else if (!show && chosen) tone = "border-signal bg-signal text-ink";
            return (
              <button
                key={option}
                type="button"
                disabled={session.revealed}
                onClick={() => pick(index)}
                className={`min-h-12 rounded-2xl border px-3 py-3 text-left text-sm leading-snug ${tone}`}
              >
                <span className="mr-2 font-semibold">{index + 1}</span>
                {option}
              </button>
            );
          })}
        </div>
        {session.revealed ? (
          <div className="mt-4 border-t border-paper-line pt-3 text-sm leading-relaxed">
            <p className="font-display text-lg">{slot.q.hook}</p>
            <p className="mt-2 text-ink/80">{slot.q.why}</p>
            <button
              type="button"
              onClick={() => next()}
              className="mt-4 min-h-12 w-full rounded-2xl bg-ink font-semibold text-paper"
            >
              Дальше
            </button>
          </div>
        ) : null}
      </article>
      <button type="button" onClick={() => quit()} className="mt-4 text-sm text-muted">
        Закрыть билет
      </button>
    </Shell>
  );
}

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
