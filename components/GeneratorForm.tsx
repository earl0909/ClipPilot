"use client";

import { FormEvent, useEffect, useState } from "react";
import { CopyButton } from "./CopyButton";
import { moods } from "./moodOptions";
import { OutputPanel } from "./OutputPanel";

type Tool = "hooks" | "clip-analyzer" | "campaign-analyzer" | "transcript-intelligence";

type GeneratorFormProps = {
  tool: Tool;
  title: string;
  eyebrow: string;
  description: string;
  outputTitle: string;
};

type FormState = {
  streamerName: string;
  platform: string;
  transcript: string;
  happened: string;
  mood: string;
  secondaryMood: string;
  useEmojis: string;
  campaignText: string;
};

type HistoryEntry = {
  tool: Tool;
  createdAt: string;
  score?: number;
};

type SavedHook = {
  id: string;
  text: string;
  source?: string;
  createdAt: string;
};

type SavedCampaign = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
};

const platforms = ["YouTube Shorts", "Instagram Reels", "Both"];

const initialForm: FormState = {
  streamerName: "",
  platform: "Both",
  transcript: "",
  happened: "",
  mood: "Funny",
  secondaryMood: "",
  useEmojis: "true",
  campaignText: ""
};

export function GeneratorForm({ tool, title, eyebrow, description, outputTitle }: GeneratorFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);

  useEffect(() => {
    const cachedOutput = window.localStorage.getItem(outputKey(tool));
    if (cachedOutput) {
      setOutput(cachedOutput);
    }

    if (tool === "campaign-analyzer") {
      setSavedCampaigns(readStorage<SavedCampaign[]>("clippilot-campaign-breakdowns", []));
    }
  }, [tool]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOutput("");
    setSaved(false);

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

      const result = data.result || "";
      setOutput(result);
      window.localStorage.setItem(outputKey(tool), result);
      saveHistory(tool, result);
    } catch {
      setError("Could not reach the generator. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  }

  function saveGeneratedHooks() {
    if (!output) {
      return;
    }

    const hooks = readStorage<SavedHook[]>("clippilot-hooks", []);
    const nextHook = {
      id: crypto.randomUUID(),
      text: output,
      source: "Hook Generator",
      createdAt: new Date().toISOString()
    };
    window.localStorage.setItem("clippilot-hooks", JSON.stringify([nextHook, ...hooks]));
    setSaved(true);
  }

  function saveCampaignBreakdown() {
    if (!output) {
      return;
    }

    const nextCampaign = {
      id: crypto.randomUUID(),
      title: getCampaignTitle(output),
      text: output,
      createdAt: new Date().toISOString()
    };
    const nextCampaigns = [nextCampaign, ...savedCampaigns];
    setSavedCampaigns(nextCampaigns);
    window.localStorage.setItem("clippilot-campaign-breakdowns", JSON.stringify(nextCampaigns));
    setSaved(true);
  }

  function loadCampaignBreakdown(text: string) {
    setOutput(text);
    window.localStorage.setItem(outputKey(tool), text);
  }

  function deleteCampaignBreakdown(id: string) {
    const nextCampaigns = savedCampaigns.filter((campaign) => campaign.id !== id);
    setSavedCampaigns(nextCampaigns);
    window.localStorage.setItem("clippilot-campaign-breakdowns", JSON.stringify(nextCampaigns));
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
          {tool === "campaign-analyzer" ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-200">Whop or clipping campaign instructions</span>
              <textarea
                value={form.campaignText}
                onChange={(event) => update("campaignText", event.target.value)}
                required
                rows={14}
                placeholder="Paste campaign rules, payout details, platform requirements, hashtags, tags, visual requirements, and rejection notes."
                className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
              />
            </label>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {tool === "clip-analyzer" ? (
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-200">Streamer/creator name</span>
                    <input
                      value={form.streamerName}
                      onChange={(event) => update("streamerName", event.target.value)}
                      placeholder="e.g. creator name or channel"
                      className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
                    />
                  </label>
                ) : null}

                {tool === "hooks" || tool === "clip-analyzer" ? (
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
                ) : null}

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

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-semibold text-slate-200">
                  {tool === "transcript-intelligence" ? "Short description of what happened" : "What happened in the clip"}
                </span>
                <textarea
                  value={form.happened}
                  onChange={(event) => update("happened", event.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the twist, conflict, emotional beat, reaction, or payoff viewers need to understand."
                  className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Transcript</span>
                <textarea
                  value={form.transcript}
                  onChange={(event) => update("transcript", event.target.value)}
                  required
                  rows={8}
                  placeholder="Paste the clip transcript. Remove obvious noise if you already have a cleaner version."
                  className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
                />
              </label>
            </>
          )}

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

        <OutputPanel title={outputTitle} output={output}>
          {tool === "hooks" ? (
            <button
              type="button"
              onClick={saveGeneratedHooks}
              disabled={!output}
              className="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saved ? "Saved" : "Save to Hook Library"}
            </button>
          ) : null}
          {tool === "campaign-analyzer" ? (
            <button
              type="button"
              onClick={saveCampaignBreakdown}
              disabled={!output}
              className="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saved ? "Saved" : "Save Campaign Breakdown"}
            </button>
          ) : null}
        </OutputPanel>
      </div>

      {tool === "campaign-analyzer" ? (
        <section className="rounded-lg border border-line bg-panel p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Saved campaign breakdowns</h2>
              <p className="mt-1 text-sm text-slate-400">Stored locally on this device.</p>
            </div>
            <p className="text-sm font-semibold text-neon">{savedCampaigns.length} saved</p>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {savedCampaigns.length ? (
              savedCampaigns.map((campaign) => (
                <article key={campaign.id} className="rounded-lg border border-line bg-ink/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-white">{campaign.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{new Date(campaign.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadCampaignBreakdown(campaign.text)}
                        className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Load
                      </button>
                      <CopyButton text={campaign.text} />
                      <button
                        type="button"
                        onClick={() => deleteCampaignBreakdown(campaign.id)}
                        className="rounded-lg border border-pulse/50 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-pulse/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{campaign.text.replace(/[#*]/g, "")}</p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm text-slate-400 lg:col-span-2">
                No saved campaign breakdowns yet. Generate one, then save it here before switching tasks.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function outputKey(tool: Tool) {
  return `clippilot-output-${tool}`;
}

function getCampaignTitle(output: string) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const campaignHeadingIndex = lines.findIndex((line) => /^##\s+Campaign Name/i.test(line));
  const possibleName = campaignHeadingIndex >= 0 ? lines[campaignHeadingIndex + 1] : lines[0];
  return (possibleName || "Campaign breakdown").replace(/[#*]/g, "").slice(0, 80);
}

function saveHistory(tool: Tool, output: string) {
  const history = readStorage<HistoryEntry[]>("clippilot-history", []);
  const scoreMatch = output.match(/(?:viral potential score|viral score|score)[^\d]*(\d{1,3})/i);
  const parsedScore = scoreMatch ? Math.min(100, Number.parseInt(scoreMatch[1], 10)) : undefined;
  const nextEntry: HistoryEntry = { tool, createdAt: new Date().toISOString(), score: parsedScore };
  window.localStorage.setItem("clippilot-history", JSON.stringify([nextEntry, ...history].slice(0, 200)));
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
