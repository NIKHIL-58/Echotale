import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Page() {
  return (
    <AuthLayout
      title="Start listening today"
      >
      <SignupForm />
    </AuthLayout>
  );
}