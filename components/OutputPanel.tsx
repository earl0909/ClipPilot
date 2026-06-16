import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";

export function OutputPanel({ title, output, children }: { title: string; output: string; children?: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {children}
          <CopyButton text={output} />
        </div>
      </div>
      {output ? (
        <div className="rounded-lg border border-line bg-ink/80 p-4 text-sm leading-7 text-slate-200">
          <FormattedOutput output={output} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm leading-6 text-slate-400">
          Generated creator assets will appear here. The transcript is used as context, not as the main output.
        </div>
      )}
    </section>
  );
}

function FormattedOutput({ output }: { output: string }) {
  const lines = output.split(/\r?\n/);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="mt-5 rounded-md border border-neon/25 bg-neon/10 px-3 py-2 text-base font-black text-neon first:mt-0">
              {formatInline(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={index} className="mt-5 text-lg font-black text-white first:mt-0">
              {formatInline(trimmed.replace(/^#\s+/, ""))}
            </h3>
          );
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-3 rounded-md bg-white/[0.03] px-3 py-2">
              <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-neon" />
              <p>{formatInline(trimmed.replace(/^[-*]\s+/, ""))}</p>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const marker = trimmed.match(/^(\d+)\.\s+/)?.[1];
          return (
            <div key={index} className="flex gap-3 rounded-md bg-white/[0.03] px-3 py-2">
              <span className="grid h-6 min-w-6 place-items-center rounded bg-white/10 text-xs font-black text-neon">{marker}</span>
              <p>{formatInline(trimmed.replace(/^\d+\.\s+/, ""))}</p>
            </div>
          );
        }

        return (
          <p key={index} className="text-slate-200">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string) {
  const cleaned = text.replace(/\*\*/g, "");
  const labelMatch = cleaned.match(/^([^:]{2,45}):\s*(.+)$/);

  if (!labelMatch) {
    return cleaned;
  }

  return (
    <>
      <strong className="font-black text-white">{labelMatch[1]}:</strong> {labelMatch[2]}
    </>
  );
}
