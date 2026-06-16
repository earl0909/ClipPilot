import Link from "next/link";

const stats = [
  { label: "Hook angles", value: "5", text: "Curiosity, conflict, shock, emotion, payoff" },
  { label: "Edit rules", value: "2-4s", text: "Pattern interrupts built into every package" },
  { label: "Output focus", value: "Ready", text: "Titles, captions, hashtags, notes, checklist" }
];

const tools = [
  { href: "/clip-creator", title: "Clip Creator", text: "Build a full Reels and Shorts package from one clip brief." },
  { href: "/hooks", title: "Hook Generator", text: "Generate scroll-stopping openers for the first 1-2 seconds." },
  { href: "/captions", title: "Caption Generator", text: "Create platform-ready captions without transcript dumps." },
  { href: "/hashtags", title: "Hashtag Generator", text: "Build focused broad, niche, and clip-specific tag sets." },
  { href: "/edit-notes", title: "Edit Notes Generator", text: "Plan cuts, pattern interrupts, retention beats, and first-three-second pacing." },
  { href: "/tracker", title: "Posting Tracker", text: "Save views, likes, comments, notes, and posting dates locally." },
  { href: "/warmup-guide", title: "Warm-Up Guide", text: "Use a cautious 3-day ramp for new creator accounts." }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-panel/90 p-6 shadow-glow sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Creator dashboard</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">ClipPilot AI</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Turn streamer moments into practical Instagram Reels and YouTube Shorts packages: hooks, titles,
            captions, hashtags, edit notes, retention plans, and posting checklists.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/clip-creator" className="rounded-lg bg-neon px-5 py-3 text-center font-bold text-ink transition hover:bg-emerald-300">
              Open Clip Creator
            </Link>
            <Link href="/tracker" className="rounded-lg border border-line bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10">
              Track posts
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-line bg-panel p-5">
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="mt-2 font-semibold text-neon">{stat.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{stat.text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
