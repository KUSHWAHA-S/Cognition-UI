import { NewProjectForm } from "@/features/projects/components/NewProjectForm";

export default function NewProjectPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-base)" }}
    >
      <NewProjectForm />
    </main>
  );
}
