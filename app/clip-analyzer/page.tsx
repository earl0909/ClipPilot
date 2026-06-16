import { GeneratorForm } from "@/components/GeneratorForm";

export default function ClipAnalyzerPage() {
  return (
    <GeneratorForm
      tool="clip-analyzer"
      eyebrow="Clip analyzer"
      title="Clip Analyzer"
      description="Score a streamer clip, decide POST or SKIP, and generate the hook, caption, hashtags, cut notes, and edit direction."
      outputTitle="Clip analysis"
    />
  );
}
