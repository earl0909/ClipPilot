import { GeneratorForm } from "@/components/GeneratorForm";

export default function TranscriptIntelligencePage() {
  return (
    <GeneratorForm
      tool="transcript-intelligence"
      eyebrow="Transcript intelligence"
      title="Transcript Intelligence"
      description="Find the best hook moment, payoff, title, caption, thumbnail text, ideal length, and timeline from a raw transcript."
      outputTitle="Transcript plan"
    />
  );
}
