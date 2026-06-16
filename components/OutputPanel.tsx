import { CopyButton } from "./CopyButton";

export function OutputPanel({ title, output }: { title: string; output: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <CopyButton text={output} />
      </div>
      {output ? (
        <pre className="whitespace-pre-wrap rounded-lg border border-line bg-ink/80 p-4 text-sm leading-7 text-slate-200">
          {output}
        </pre>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-ink/60 p-6 text-sm leading-6 text-slate-400">
          Generated creator assets will appear here. The transcript is used as context, not as the main output.
        </div>
      )}
    </section>
  );
}
