import { GeneratorForm } from "@/components/GeneratorForm";

export default function HashtagsPage() {
  return (
    <GeneratorForm
      tool="hashtags"
      eyebrow="Hashtag generator"
      title="Hashtag Generator"
      description="Create relevant hashtag sets for discovery without stuffing unrelated trend tags."
      compact
    />
  );
}
