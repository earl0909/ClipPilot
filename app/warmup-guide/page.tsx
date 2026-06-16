const days = [
  {
    day: "Day 1",
    title: "Observe the niche",
    items: ["Watch streamer clips", "Like naturally", "No posting"]
  },
  {
    day: "Day 2",
    title: "Build real signals",
    items: ["Follow streamers and similar accounts", "Comment genuinely", "No spam"]
  },
  {
    day: "Day 3",
    title: "Post carefully",
    items: ["Post first clip", "Credit original creator", "Use 3-5 relevant hashtags"]
  }
];

export default function WarmupGuidePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Account warm-up</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">3-Day Warm-Up Guide</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Give a new account a normal-looking start before you scale clip posting.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {days.map((day) => (
          <article key={day.day} className="rounded-lg border border-line bg-panel p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-neon">{day.day}</p>
            <h2 className="mt-3 text-xl font-bold text-white">{day.title}</h2>
            <div className="mt-5 space-y-3">
              {day.items.map((item) => (
                <label key={item} className="flex items-center gap-3 rounded-lg border border-line bg-ink/70 p-3 text-sm text-slate-200">
                  <input type="checkbox" className="h-4 w-4 accent-emerald-300" />
                  {item}
                </label>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 p-5">
        <h2 className="text-lg font-black text-yellow-300">Warning</h2>
        <p className="mt-2 leading-7 text-yellow-100">
          Avoid posting too many clips on a new account. Start with 1 clip per day.
        </p>
      </section>
    </div>
  );
}
