"use client";

import { FormEvent, useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { moods } from "@/components/moodOptions";

type SeoForm = {
  clipSummary: string;
  hookUsed: string;
  payoff: string;
  topic: string;
  mood: string;
  secondaryMood: string;
  streamerName: string;
  useEmojis: string;
};

type SeoPackage = {
  id: string;
  title: string;
  output: string;
  createdAt: string;
};

type OutputSection = {
  title: string;
  body: string;
};

const initialForm: SeoForm = {
  clipSummary: "",
  hookUsed: "",
  payoff: "",
  topic: "",
  mood: "Funny",
  secondaryMood: "",
  streamerName: "",
  useEmojis: "true"
};

const historyKey = "clippilot-youtube-seo-packages";
const outputKey = "clippilot-output-youtube-seo";

export default function YouTubeSeoPage() {
  const [form, setForm] = useState<SeoForm>(initialForm);
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<SeoPackage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOutput(window.localStorage.getItem(outputKey) || "");
    setHistory(readStorage<SeoPackage[]>(historyKey, []));
  }, []);

  function update(field: keyof SeoForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "youtube-seo", input: form })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Generation failed. Try again.");
        return;
      }

      const result = data.result || "";
      setOutput(result);
      window.localStorage.setItem(outputKey, result);
    } catch {
      setError("Could not reach the generator. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  }

  function savePackage() {
    if (!output) {
      return;
    }

    const nextPackage = {
      id: crypto.randomUUID(),
      title: getPackageTitle(output, form.topic),
      output,
      createdAt: new Date().toISOString()
    };
    const nextHistory = [nextPackage, ...history].slice(0, 50);
    setHistory(nextHistory);
    window.localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    setSaved(true);
  }

  function loadPackage(savedPackage: SeoPackage) {
    setOutput(savedPackage.output);
    window.localStorage.setItem(outputKey, savedPackage.output);
  }

  function deletePackage(id: string) {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    window.localStorage.setItem(historyKey, JSON.stringify(nextHistory));
  }

  const sections = parseSections(output);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">YouTube Shorts SEO</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">YouTube SEO Generator</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Generate a Shorts package built for CTR, retention, discoverability, replayability, and comment engagement.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={generate} className="rounded-lg border border-line bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Clip Summary</span>
              <textarea
                required
                rows={4}
                value={form.clipSummary}
                onChange={(event) => update("clipSummary", event.target.value)}
                placeholder="What happens in the clip and why should someone keep watching?"
                className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Hook Used In Video</span>
              <textarea
                required
                rows={3}
                value={form.hookUsed}
                onChange={(event) => update("hookUsed", event.target.value)}
                placeholder="e.g. He instantly regretted this"
                className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Ending / Payoff</span>
              <textarea
                required
                rows={3}
                value={form.payoff}
                onChange={(event) => update("payoff", event.target.value)}
                placeholder="What is the final reaction, twist, fail, reveal, or punchline?"
                className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Game / Topic</span>
              <input
                required
                value={form.topic}
                onChange={(event) => update("topic", event.target.value)}
                placeholder="e.g. Valorant, Minecraft, dating advice"
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Creator / Streamer Name</span>
              <input
                value={form.streamerName}
                onChange={(event) => update("streamerName", event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Primary Mood</span>
              <select
                required
                value={form.mood}
                onChange={(event) => update("mood", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                {moods.map((mood) => (
                  <option key={mood}>{mood}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Secondary Mood</span>
              <select
                value={form.secondaryMood}
                onChange={(event) => update("secondaryMood", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                <option value="">None</option>
                {moods.map((mood) => (
                  <option key={mood}>{mood}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-ink/70 p-3 text-sm font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={form.useEmojis === "true"}
              onChange={(event) => update("useEmojis", event.target.checked ? "true" : "false")}
              className="h-4 w-4 accent-emerald-300"
            />
            Use Emojis
          </label>

          {error ? (
            <div className="mt-4 rounded-lg border border-pulse/50 bg-pulse/10 p-3 text-sm font-semibold text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-neon px-5 py-3 font-black text-ink transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Generating..." : "Generate All"}
          </button>
        </form>

        <section className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-white">SEO package</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={savePackage}
                disabled={!output}
                className="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saved ? "Saved" : "Save SEO Package"}
              </button>
              <CopyButton text={output} />
            </div>
          </div>

          {output ? (
            <div className="space-y-3">
              {sections.map((section) => (
                <article key={section.title} className="rounded-lg border border-line bg-ink/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-neon">{section.title}</h3>
                    <CopyButton text={section.body} />
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{section.body}</pre>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm leading-6 text-slate-400">
              Your title, description, key moments, hashtags, score, and alternative titles will appear here.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-line bg-panel p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Local SEO history</h2>
            <p className="mt-1 text-sm text-slate-400">Previous packages saved on this device.</p>
          </div>
          <p className="text-sm font-semibold text-neon">{history.length} saved</p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {history.length ? (
            history.map((item) => (
              <article key={item.id} className="rounded-lg border border-line bg-ink/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadPackage(item)}
                      className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Load
                    </button>
                    <CopyButton text={item.output} />
                    <button
                      type="button"
                      onClick={() => deletePackage(item.id)}
                      className="rounded-lg border border-pulse/50 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-pulse/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{item.output.replace(/[#*]/g, "")}</p>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm text-slate-400 lg:col-span-2">
              No saved SEO packages yet. Generate a package, then save it to keep it here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function parseSections(output: string): OutputSection[] {
  const sections: OutputSection[] = [];
  let current: OutputSection | null = null;

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      if (current) {
        sections.push({ ...current, body: current.body.trim() });
      }
      current = { title: line.replace(/^##\s+/, "").trim(), body: "" };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    }
  }

  if (current) {
    sections.push({ ...current, body: current.body.trim() });
  }

  return sections.length ? sections : [{ title: "Generated SEO Package", body: output }];
}

function getPackageTitle(output: string, fallback: string) {
  const titleSection = parseSections(output).find((section) => section.title.toLowerCase().includes("viral title"));
  const firstLine = titleSection?.body.split(/\r?\n/).find((line) => line.trim());
  return (firstLine || fallback || "YouTube SEO package").replace(/[*#]/g, "").slice(0, 90);
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
