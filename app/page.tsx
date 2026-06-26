"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HistoryEntry = {
  tool: string;
  createdAt: string;
  score?: number;
};

type SavedHook = {
  id: string;
  text: string;
  createdAt: string;
};

const tools = [
  { href: "/viral-shorts-script-generator", title: "Viral Shorts Script Generator", text: "Upload, describe, score, and export retention-first short-form scripts." },
  { href: "/hooks", title: "Hook Generator", text: "Generate ten first-second hooks with curiosity and retention scores." },
  { href: "/clip-analyzer", title: "Clip Analyzer", text: "Score a streamer clip, get POST or SKIP, and pull ready-to-use assets." },
  { href: "/campaign-analyzer", title: "Campaign Analyzer", text: "Extract Whop campaign rules, risks, payout details, and checklist items." },
  { href: "/transcript-intelligence", title: "Transcript Intelligence", text: "Find the hook, payoff, timeline, title, caption, and ideal length." }
];

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hooks, setHooks] = useState<SavedHook[]>([]);

  useEffect(() => {
    setHistory(readStorage<HistoryEntry[]>("clippilot-history", []));
    setHooks(readStorage<SavedHook[]>("clippilot-hooks", []));
  }, []);

  const averageScore = useMemo(() => {
    const scores = history.map((entry) => entry.score).filter((score): score is number => typeof score === "number");
    if (!scores.length) {
      return "0";
    }
    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length).toString();
  }, [history]);

  const campaignsChecked = history.filter((entry) => entry.tool === "campaign-analyzer").length;
  const clipsAnalyzed = history.filter((entry) => entry.tool === "clip-analyzer").length;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-panel/90 p-6 shadow-glow sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Clipper dashboard</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">ClipPilot OS</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            A focused workspace for streamer clippers and Whop campaign creators: hooks, clip scores,
            campaign rules, transcript timelines, and a local hook library.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/clip-analyzer" className="rounded-lg bg-neon px-5 py-3 text-center font-bold text-ink transition hover:bg-emerald-300">
              Analyze a clip
            </Link>
            <Link href="/campaign-analyzer" className="rounded-lg border border-line bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10">
              Check campaign rules
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clips analyzed" value={clipsAnalyzed.toString()} text="Clip Analyzer runs saved on this device." />
        <StatCard label="Average viral score" value={averageScore} text="Average from parsed clip analyzer scores." />
        <StatCard label="Saved hooks" value={hooks.length.toString()} text="Hooks stored in the local Hook Library." />
        <StatCard label="Campaigns checked" value={campaignsChecked.toString()} text="Whop campaign instructions analyzed." />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="rounded-lg border border-line bg-panel p-5 transition hover:border-neon/60 hover:bg-white/[0.07]">
            <h2 className="text-xl font-bold text-white">{tool.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{tool.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatCard({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-2 font-semibold text-neon">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
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
