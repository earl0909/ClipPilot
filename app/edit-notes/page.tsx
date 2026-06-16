import { GeneratorForm } from "@/components/GeneratorForm";

export default function EditNotesPage() {
  return (
    <GeneratorForm
      tool="editnotes"
      eyebrow="Edit notes generator"
      title="Edit Notes Generator"
      description="Turn a clip moment into cut notes, retention beats, first-three-second direction, and pattern interrupts."
      compact
    />
  );
}
