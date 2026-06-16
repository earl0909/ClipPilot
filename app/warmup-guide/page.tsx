"use client";

import { useEffect, useMemo, useState } from "react";

type WarmupState = {
  platform: string;
  accountAge: string;
  accountType: string;
  checkedTasks: Record<string, boolean>;
};

const storageKey = "clippilot-warmup-guide";

const platforms = ["Instagram", "YouTube Shorts", "Both"];
const accountAges = ["Brand New", "1-3 Days", "4-7 Days", "1+ Week"];
const accountTypes = ["Streamer Clips", "Podcast Clips", "Funny Clips", "Gaming Clips", "Other"];

const days = [
  {
    title: "Day 1",
    focus: "Teach the account what niche it belongs to before posting.",
    tasks: ["Watch niche content", "Like 5-10 posts/videos", "Browse naturally", "No posting"]
  },
  {
    title: "Day 2",
    focus: "Build real engagement signals with creators and viewers in the niche.",
    tasks: ["Follow relevant creators", "Like 10-20 posts", "Leave genuine comments", "Continue watching content", "No posting"]
  },
  {
    title: "Day 3",
    focus: "Launch with one clean clip and keep behaving like a real viewer.",
    tasks: ["Post first clip", "Use relevant hashtags", "Continue engaging", "Reply to comments"]
  }
];

const preLaunchTasks = [
  "Profile photo uploaded",
  "Username finalized",
  "Bio completed",
  "Niche selected",
  "First clip ready",
  "Caption prepared",
  "Hashtags prepared",
  "Warm-up completed"
];

const mistakes = [
  "Posting immediately after account creation",
  "Uploading many clips on day one",
  "Using inconsistent niches",
  "Ignoring comments",
  "Reposting identical clips repeatedly"
];

const initialState: WarmupState = {
  platform: "Instagram",
  accountAge: "Brand New",
  accountType: "Streamer Clips",
  checkedTasks: {}
};

export default function WarmupGuidePage() {
  const [state, setState] = useState<WarmupState>(initialState);
  const [loaded, setLoaded] = useState(false);

  const allTasks = useMemo(
    () => [...days.flatMap((day) => day.tasks.map((task) => taskId(day.title, task))), ...preLaunchTasks.map((task) => taskId("prelaunch", task))],
    []
  );

  const completedCount = allTasks.filter((id) => state.checkedTasks[id]).length;
  const completion = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0;
  const completedDays = days.filter((day) => day.tasks.every((task) => state.checkedTasks[taskId(day.title, task)])).length;
  const dayThreeComplete = days[2].tasks.every((task) => state.checkedTasks[taskId(days[2].title, task)]);
  const preLaunchComplete = preLaunchTasks.every((task) => state.checkedTasks[taskId("prelaunch", task)]);
  const readyToPost = dayThreeComplete && preLaunchComplete;
  const launchReason = getLaunchReason(dayThreeComplete, preLaunchComplete);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setState(JSON.parse(saved) as WarmupState);
      } catch {
        setState(initialState);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, loaded]);

  function update(field: keyof Omit<WarmupState, "checkedTasks">, value: string) {
    setState((current) => ({ ...current, [field]: value }));
  }

  function toggle(id: string) {
    setState((current) => ({
      ...current,
      checkedTasks: { ...current.checkedTasks, [id]: !current.checkedTasks[id] }
    }));
  }

  function resetWarmup() {
    setState(initialState);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Account warm-up</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">Account Warm-Up Guide</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Build normal account signals before posting clips on Instagram, YouTube Shorts, or both.
            </p>
          </div>
          <button
            type="button"
            onClick={resetWarmup}
            className="rounded-lg border border-pulse/50 px-4 py-3 text-sm font-bold text-rose-200 transition hover:bg-pulse/10"
          >
            Reset Warm-Up
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SelectCard label="Platform" value={state.platform} options={platforms} onChange={(value) => update("platform", value)} />
        <SelectCard label="Account Age" value={state.accountAge} options={accountAges} onChange={(value) => update("accountAge", value)} />
        <SelectCard label="Account Type" value={state.accountType} options={accountTypes} onChange={(value) => update("accountType", value)} />
      </section>

      <section className="rounded-lg border border-line bg-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Personalized warm-up plan</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">{getPlanSummary(state.platform, state.accountAge, state.accountType)}</p>
          </div>
          <div className="rounded-lg border border-line bg-ink/70 px-4 py-3 text-sm">
            <span className="text-slate-400">Daily streak </span>
            <span className="font-black text-neon">{completedDays}/3</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-200">Completion</span>
            <span className="font-black text-neon">{completion}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink">
            <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {days.map((day) => {
          const dayComplete = day.tasks.every((task) => state.checkedTasks[taskId(day.title, task)]);

          return (
            <article key={day.title} className="rounded-lg border border-line bg-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-neon">{day.title}</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{dayComplete ? "Complete" : "Warm-up tasks"}</h2>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-black ${dayComplete ? "bg-neon text-ink" : "bg-white/10 text-slate-300"}`}>
                  {dayComplete ? "Done" : "Open"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{day.focus}</p>
              <div className="mt-5 space-y-3">
                {day.tasks.map((task) => (
                  <ChecklistItem key={task} id={taskId(day.title, task)} label={task} checked={Boolean(state.checkedTasks[taskId(day.title, task)])} onToggle={toggle} />
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <article className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-xl font-bold text-white">Pre-Launch Checklist</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {preLaunchTasks.map((task) => (
              <ChecklistItem key={task} id={taskId("prelaunch", task)} label={task} checked={Boolean(state.checkedTasks[taskId("prelaunch", task)])} onToggle={toggle} />
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-xl font-bold text-white">Launch Recommendation</h2>
          <div className={`mt-4 rounded-lg border p-4 ${readyToPost ? "border-neon/40 bg-neon/10" : "border-yellow-400/40 bg-yellow-400/10"}`}>
            <p className="text-sm font-semibold text-slate-300">Status:</p>
            <p className={`mt-1 text-2xl font-black ${readyToPost ? "text-neon" : "text-yellow-300"}`}>
              {readyToPost ? "Ready to Post" : "Continue Warming"}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-300">Reason:</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">{launchReason}</p>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-line bg-panel p-5">
        <h2 className="text-xl font-bold text-white">Common Mistakes</h2>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-pulse">Avoid</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {mistakes.map((mistake) => (
            <div key={mistake} className="rounded-lg border border-pulse/30 bg-pulse/10 p-3 text-sm leading-6 text-rose-100">
              {mistake}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SelectCard({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="rounded-lg border border-line bg-panel p-5">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ChecklistItem({ id, label, checked, onToggle }: { id: string; label: string; checked: boolean; onToggle: (id: string) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-ink/70 p-3 text-sm text-slate-200 transition hover:bg-white/[0.06]">
      <input type="checkbox" checked={checked} onChange={() => onToggle(id)} className="sr-only" />
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-sm font-black ${checked ? "border-neon bg-neon text-ink" : "border-line bg-white/5 text-transparent"}`}>
        ✓
      </span>
      <span className={checked ? "text-white" : "text-slate-300"}>{label}</span>
    </label>
  );
}

function taskId(group: string, task: string) {
  return `${group}:${task}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getPlanSummary(platform: string, age: string, type: string) {
  const platformText = platform === "Both" ? "Instagram and YouTube Shorts" : platform;
  const ageText = age === "1+ Week" ? "You can launch more confidently, but still complete the checklist." : "Move slowly and avoid bulk posting.";
  return `${platformText} plan for ${type.toLowerCase()} accounts. ${ageText}`;
}

function getLaunchReason(dayThreeComplete: boolean, preLaunchComplete: boolean) {
  if (!dayThreeComplete) {
    return "Account has not completed Day 3 activities.";
  }

  if (!preLaunchComplete) {
    return "Pre-launch checklist still has unfinished items.";
  }

  return "Warm-up activities and pre-launch checklist are complete.";
}
