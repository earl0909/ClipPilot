"use client";

import { FormEvent, useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type SavedHook = {
  id: string;
  text: string;
  source?: string;
  createdAt: string;
};

export default function HookLibraryPage() {
  const [hooks, setHooks] = useState<SavedHook[]>([]);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHooks(readStorage<SavedHook[]>("clippilot-hooks", []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem("clippilot-hooks", JSON.stringify(hooks));
    }
  }, [hooks, loaded]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setHooks((current) => [
      { id: crypto.randomUUID(), text: trimmed, source: "Manual save", createdAt: new Date().toISOString() },
      ...current
    ]);
    setText("");
  }

  function remove(id: string) {
    setHooks((current) => current.filter((hook) => hook.id !== id));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Local storage</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Hook Library</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Save, copy, and delete hooks on this device. Generated hook packs can be saved from the Hook Generator.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={save} className="rounded-lg border border-line bg-panel p-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Save a hook</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              placeholder="Paste a hook, hook pack, or tested opener you want to reuse."
              className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
            />
          </label>
          <button type="submit" className="mt-5 w-full rounded-lg bg-neon px-5 py-3 font-black text-ink transition hover:bg-emerald-300">
            Save hook
          </button>
        </form>

        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-xl font-bold text-white">Saved hooks</h2>
          <div className="mt-4 space-y-3">
            {hooks.length ? (
              hooks.map((hook) => (
                <article key={hook.id} className="rounded-lg border border-line bg-ink/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neon">{hook.source || "Saved hook"}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(hook.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <CopyButton text={hook.text} />
                      <button
                        type="button"
                        onClick={() => remove(hook.id)}
                        className="rounded-lg border border-pulse/50 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-pulse/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">{hook.text}</pre>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm text-slate-400">
                No saved hooks yet. Save a hook pack from the generator or add one manually.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
