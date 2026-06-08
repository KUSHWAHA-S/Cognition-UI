import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-base)" }}
    >
      <SignupForm />
    </main>
  );
}
