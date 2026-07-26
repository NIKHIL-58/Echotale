import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Page() {
  return (
    <AuthLayout
      title="Create your account" subtitle="Build your personal story library in less than a minute."
      >
      <SignupForm />
    </AuthLayout>
  );
}
