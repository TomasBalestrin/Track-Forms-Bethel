import { Suspense } from "react";

import { AuthCard } from "@/components/layout/AuthCard";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthCard title="Entre na sua conta">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
