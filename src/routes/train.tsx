import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CHAPTERS } from "@/data/chapters";
import { Shell } from "@/components/shell";
import { usePdd } from "@/lib/pdd-store";
import type { Mode } from "@/lib/exam";

export const Route = createFileRoute("/train")({ component: TrainPage });

function TrainPage() {
  const navigate = useNavigate();
  const start = usePdd((s) => s.start);
  const history = usePdd((s) => s.history);
  const results = usePdd((s) => s.results);
  const hydrated = usePdd((s) => s.hydrated);
  const mistakes = Object.values(results).filter((ok) => !ok).length;

  function go(mode: Mode, topic?: string) {
    const ok = start(mode, topic);
    if (ok) void navigate({ to: "/exam" });
  }

  return (
    <Shell>
      <p className="text-xs font-medium tracking-widest text-signal">БИЛЕТ</p>
      <h1 className="font-display mt-3 text-4xl">Как на экзамене</h1>
      <p className="mt-3 max-w-xl text-muted">
        20 вопросов, 20 минут, четыре темы по пять. Одна ошибка открывает пять
        дополнительных вопросов. Две ошибки в одной теме билет закрывают. Время
        на дополнительные вопросы прибавляется.
      </p>

      <button
        type="button"
        onClick={() => go("exam")}
        className="mt-6 flex min-h-24 w-full flex-col items-start justify-center rounded-2xl bg-signal px-5 py-4 text-left text-ink"
      >
        <span className="font-display text-2xl">Пробный билет</span>
        <span className="mt-1 text-sm">Без подсказок до конца. Как за компьютером в ГИБДД.</span>
      </button>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => go("sprint")}
          className="min-h-20 rounded-2xl border border-line bg-surface px-4 py-3 text-left"
        >
          <span className="block font-semibold">Спринт на 10</span>
          <span className="mt-1 block text-sm text-muted">Сразу видно, почему ответ такой.</span>
        </button>
        <button
          type="button"
          onClick={() => go("mistakes")}
          disabled={!hydrated || mistakes === 0}
          className="min-h-20 rounded-2xl border border-line bg-surface px-4 py-3 text-left disabled:opacity-50"
        >
          <span className="block font-semibold">Только ошибки</span>
          <span className="mt-1 block text-sm text-muted">
            {hydrated ? `${mistakes} в копилке` : "Считаем после первого билета"}
          </span>
        </button>
      </div>

      <h2 className="font-display mt-8 text-xl">По теме</h2>
      <ul className="mt-3 grid gap-2">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.slug}>
            <button
              type="button"
              onClick={() => go("topic", chapter.slug)}
              className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-line px-4 text-left"
            >
              <span>{chapter.title}</span>
              <span className="text-sm text-signal">{chapter.km}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-xl">Последние попытки</h2>
      {!hydrated || history.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Здесь появятся результаты. Первый билет ничего не портит.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {history.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line px-4 py-3 text-sm">
              <span className={item.passed ? "text-ok" : "text-danger"}>
                {item.passed ? "Сдано" : "Ещё круг"}
              </span>
              <span className="text-muted">
                {" "}
                · {label(item.mode)} · {item.correct}/{item.total}
              </span>
              <p className="mt-1 text-muted">{item.reason}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted">
        Вопросы написаны для тренировки по действующим правилам. Это учебные формулировки.
        Официальные билеты ГИБДД на экзамене будут другими словами.
      </p>
      <Link to="/situations" className="mt-3 inline-flex text-sm font-semibold text-signal">
        Схемы «кто первый»
      </Link>
    </Shell>
  );
}

function label(mode: Mode) {
  if (mode === "exam") return "билет";
  if (mode === "sprint") return "спринт";
  if (mode === "topic") return "тема";
  return "ошибки";
}
