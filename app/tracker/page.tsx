"use client";

import { FormEvent, useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  platform: string;
  datePosted: string;
  views: string;
  likes: string;
  comments: string;
  notes: string;
};

const emptyPost = {
  id: "",
  title: "",
  platform: "Instagram Reels",
  datePosted: "",
  views: "",
  likes: "",
  comments: "",
  notes: ""
};

export default function TrackerPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<Post>(emptyPost);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("clippilot-posts");
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch {
        setPosts([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem("clippilot-posts", JSON.stringify(posts));
    }
  }, [loaded, posts]);

  function update(field: keyof Post, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId) {
      setPosts((current) => current.map((post) => (post.id === editingId ? { ...form, id: editingId } : post)));
      setEditingId(null);
    } else {
      setPosts((current) => [{ ...form, id: crypto.randomUUID() }, ...current]);
    }
    setForm(emptyPost);
  }

  function edit(post: Post) {
    setForm(post);
    setEditingId(post.id);
  }

  function remove(id: string) {
    setPosts((current) => current.filter((post) => post.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyPost);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Local storage</p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Posting Tracker</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Track clip performance on this device. Add each post, update stats, and keep quick notes on what worked.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={save} className="rounded-lg border border-line bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Clip title</span>
              <input
                required
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Streamer realizes chat was right"
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
                <option>Instagram Reels</option>
                <option>YouTube Shorts</option>
                <option>Both</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Date posted</span>
              <input
                type="date"
                value={form.datePosted}
                onChange={(event) => update("datePosted", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>
            {(["views", "likes", "comments"] as const).map((field) => (
              <label key={field} className="space-y-2">
                <span className="text-sm font-semibold capitalize text-slate-200">{field}</span>
                <input
                  inputMode="numeric"
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
                />
              </label>
            ))}
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Hook used, retention notes, comments worth replying to..."
                rows={4}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
              />
            </label>
          </div>
          <button type="submit" className="mt-5 w-full rounded-lg bg-neon px-5 py-3 font-black text-ink transition hover:bg-emerald-300">
            {editingId ? "Save changes" : "Add post"}
          </button>
        </form>

        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-xl font-bold text-white">Saved posts</h2>
          <div className="mt-4 space-y-3">
            {posts.length ? (
              posts.map((post) => (
                <article key={post.id} className="rounded-lg border border-line bg-ink/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-white">{post.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {post.platform} {post.datePosted ? `- ${post.datePosted}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => edit(post)} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
                        Edit
                      </button>
                      <button type="button" onClick={() => remove(post.id)} className="rounded-lg border border-pulse/50 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-pulse/10">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-md bg-white/5 p-3"><b className="block text-white">{post.views || 0}</b>Views</div>
                    <div className="rounded-md bg-white/5 p-3"><b className="block text-white">{post.likes || 0}</b>Likes</div>
                    <div className="rounded-md bg-white/5 p-3"><b className="block text-white">{post.comments || 0}</b>Comments</div>
                  </div>
                  {post.notes ? <p className="mt-4 text-sm leading-6 text-slate-300">{post.notes}</p> : null}
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm text-slate-400">
                No posts yet. Add your first clip after publishing.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
