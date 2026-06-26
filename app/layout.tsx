import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipPilot OS",
  description: "Streamer clip and Whop campaign analysis for creator operators."
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/viral-shorts-script-generator", label: "Viral Scripts", icon: "V" },
  { href: "/hooks", label: "Hook Generator", icon: "H" },
  { href: "/clip-analyzer", label: "Clip Analyzer", icon: "C" },
  { href: "/campaign-analyzer", label: "Campaign Analyzer", icon: "W" },
  { href: "/youtube-seo", label: "YouTube SEO", icon: "Y" },
  { href: "/transcript-intelligence", label: "Transcript Intel", icon: "T" },
  { href: "/hook-library", label: "Hook Library", icon: "L" },
  { href: "/warmup-guide", label: "Warm-Up Guide", icon: "A" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:flex">
          <aside className="border-b border-line bg-ink/85 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-neon text-lg font-black text-ink shadow-glow">
                CP
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">ClipPilot OS</p>
                <p className="text-sm text-slate-400">Clipper campaign cockpit</p>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-w-fit items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-white/5 text-xs text-neon">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden px-5 pb-5 pt-4 lg:block">
              <div className="rounded-lg border border-line bg-panel p-4">
                <p className="text-sm font-semibold text-white">Daily focus</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Lead with the wildest moment, cut dead air, and keep the viewer chasing one clear question.
                </p>
              </div>
            </div>
          </aside>
          <main className="w-full px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
