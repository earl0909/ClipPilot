"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { OutputPanel } from "@/components/OutputPanel";

type Provider = "openai" | "gemini" | "anthropic" | "openrouter";

type FormState = {
  provider: Provider;
  apiKey: string;
  platform: string;
  style: string;
  videoUrl: string;
  manualDescription: string;
  extraContext: string;
};

const styles = [
  "Simple Viral Commentary",
  "Minimal Commentary",
  "High Energy Commentary",
  "Storytelling",
  "Documentary",
  "Emotional",
  "Funny",
  "Educational",
  "Fast Pace",
  "MrBeast Style",
  "Faceless Viral Shorts"
];

const initialForm: FormState = {
  provider: "openrouter",
  apiKey: "",
  platform: "TikTok, Instagram Reels, and YouTube Shorts",
  style: "Simple Viral Commentary",
  videoUrl: "",
  manualDescription: "",
  extraContext: ""
};

export default function ViralShortsScriptGenerator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : ""), [videoFile]);
  const canGenerate = Boolean(form.manualDescription.trim() || form.videoUrl.trim() || videoFile);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseFile(file?: File) {
    if (!file) {
      return;
    }

    setVideoFile(file);
    setError("");
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canGenerate) {
      setError("Add a video, video URL, or manual description first.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("/api/viral-shorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          apiKey: form.apiKey,
          input: {
            platform: form.platform,
            style: form.style,
            videoUrl: form.videoUrl,
            manualDescription: form.manualDescription,
            extraContext: form.extraContext,
            videoFileName: videoFile?.name,
            videoFileType: videoFile?.type,
            videoFileSize: videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(2)} MB` : ""
          }
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Generation failed. Try again.");
        return;
      }

      setOutput(data.result || "");
      window.localStorage.setItem("clippilot-output-viral-shorts", data.result || "");
    } catch {
      setError("Could not reach the generator. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  }

  function exportFile(kind: "txt" | "md" | "docx" | "pdf") {
    if (!output) {
      return;
    }

    if (kind === "pdf") {
      window.print();
      return;
    }

    const mime =
      kind === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : kind === "md"
          ? "text/markdown"
          : "text/plain";
    const body = kind === "docx" ? buildDoc(output) : output;
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `viral-shorts-script.${kind}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-5 shadow-glow">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.45fr)] xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">AI shorts script studio</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">Viral Shorts Script Generator</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Analyze a clip idea, find the strongest hook, write synchronized commentary, score it, and export a creator-ready package.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-ink/70 p-3 text-center">
            <Metric value="10" label="Hook checks" />
            <Metric value="11" label="Styles" />
            <Metric value="4" label="Providers" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form onSubmit={generate} className="space-y-5 rounded-lg border border-line bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">AI Provider</span>
              <select
                value={form.provider}
                onChange={(event) => update("provider", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI Responses API</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">API Key</span>
              <input
                value={form.apiKey}
                onChange={(event) => update("apiKey", event.target.value)}
                type="password"
                placeholder="Use env key or paste your own"
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Platform</span>
              <input
                value={form.platform}
                onChange={(event) => update("platform", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Script Style</span>
              <select
                value={form.style}
                onChange={(event) => update("style", event.target.value)}
                className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
              >
                {styles.map((style) => (
                  <option key={style}>{style}</option>
                ))}
              </select>
            </label>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files[0]);
            }}
            className={`rounded-lg border border-dashed p-4 transition ${dragging ? "border-neon bg-neon/10" : "border-line bg-ink/70"}`}
          >
            <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
              <div className="aspect-video overflow-hidden rounded-md border border-line bg-black">
                {previewUrl ? (
                  <video src={previewUrl} controls className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    MP4 MOV AVI MKV
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-white">{videoFile ? videoFile.name : "Upload or drag a video"}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  The app previews the file and sends metadata. Add a description below when frame-level AI video analysis is not available.
                </p>
                <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  Choose video
                  <input
                    type="file"
                    accept=".mp4,.mov,.avi,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Video URL</span>
            <input
              value={form.videoUrl}
              onChange={(event) => update("videoUrl", event.target.value)}
              placeholder="Paste a TikTok, Reel, YouTube Short, or raw video URL"
              className="w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none transition focus:border-neon"
            />
            <span className="block text-xs leading-5 text-slate-500">
              For YouTube links, ClipPilot reads available title/channel metadata. Add a manual description for frame-by-frame accuracy.
            </span>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Manual Video Description</span>
            <textarea
              value={form.manualDescription}
              onChange={(event) => update("manualDescription", event.target.value)}
              rows={6}
              placeholder="Example: A girl plays hopscotch inside a store. The owner notices her and paints a real hopscotch path. Adults start playing too."
              className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Extra Notes</span>
            <textarea
              value={form.extraContext}
              onChange={(event) => update("extraContext", event.target.value)}
              rows={3}
              placeholder="Audience, product, desired tone, length, must-mention detail, or ending preference."
              className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-neon"
            />
          </label>

          {error ? <div className="rounded-lg border border-pulse/50 bg-pulse/10 p-3 text-sm font-semibold text-rose-200">{error}</div> : null}

          <button
            type="submit"
            disabled={loading || !canGenerate}
            className="w-full rounded-lg bg-neon px-5 py-3 font-black text-ink transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating retention script..." : "Generate Viral Script"}
          </button>
        </form>

        <OutputPanel title="Commentary Voiceover Package" output={output}>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output} />
            <ExportButton label="TXT" onClick={() => exportFile("txt")} disabled={!output} />
            <ExportButton label="MD" onClick={() => exportFile("md")} disabled={!output} />
            <ExportButton label="DOCX" onClick={() => exportFile("docx")} disabled={!output} />
            <ExportButton label="PDF" onClick={() => exportFile("pdf")} disabled={!output} />
          </div>
        </OutputPanel>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-white/[0.04] px-2 py-3">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function ExportButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function buildDoc(markdown: string) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br />");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Viral Shorts Script</title></head><body>${escaped}</body></html>`;
}
