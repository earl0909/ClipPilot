"use client";

import { FormEvent, useState } from "react";
import { OutputPanel } from "./OutputPanel";

type GeneratorFormProps = {
  tool: string;
  title: string;
  eyebrow: string;
  description: string;
  compact?: boolean;
};

const moods = ["funny", "rage", "drama", "clutch", "shock", "emotional"];
const lengths = ["15s", "30s", "45s", "60s"];
const platforms = ["Instagram Reels", "YouTube Shorts", "Both"];

export function GeneratorForm({ tool, title, eyebrow, description, compact = false }: GeneratorFormProps) {
  const [form, setForm] = useState({
    streamerName: "",
    platform: "Both",
    transcript: "",
    happened: "",
    mood: "funny",
    length: "30s"
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input: form })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Generation failed. Try again.");
        return;
      }

      setOutput(data.result || "");
    } catch {
      setError("Could not reach the generator. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{description}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={generate} className="rounded-lg border border-line bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Streamer name</span>
              <input
                value={form.streamerName}
                onChange={(event) => update("streamerName", event.target.value)}
                placeholder="e.g. Kai Cenat, Pokimane, your channel"
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Platform</span>
              <select
                value={form.platform}
                onChange={(event) => update("platform", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                {platforms.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Clip mood</span>
              <select
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
              <span className="text-sm font-semibold text-slate-200">Target length</span>
              <select
                value={form.length}
                onChange={(event) => update("length", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                {lengths.map((length) => (
                  <option key={length}>{length}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-semibold text-slate-200">What really happened in the clip</span>
            <textarea
              value={form.happened}
              onChange={(event) => update("happened", event.target.value)}
              required
              rows={compact ? 4 : 5}
              placeholder="Describe the moment, twist, conflict, reaction, or payoff viewers should understand."
              className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Clip transcript</span>
            <textarea
              value={form.transcript}
              onChange={(event) => update("transcript", event.target.value)}
              rows={compact ? 4 : 8}
              placeholder="Paste transcript for context. The app will not use it as the main output."
              className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
            />
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
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>

        <OutputPanel title="Generated output" output={output} />
      </div>
    </div>
  );
}
