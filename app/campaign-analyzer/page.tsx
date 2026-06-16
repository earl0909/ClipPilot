import { GeneratorForm } from "@/components/GeneratorForm";

export default function CampaignAnalyzerPage() {
  return (
    <GeneratorForm
      tool="campaign-analyzer"
      eyebrow="Whop campaign analyzer"
      title="Campaign Analyzer"
      description="Paste Whop or clipping campaign instructions and extract payout terms, required assets, rejection risks, and a submission checklist."
      outputTitle="Campaign breakdown"
    />
  );
}
