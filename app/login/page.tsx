import { Suspense } from "react";
import LoginClient from "./login-client";
import { LoadingState } from "@/components/loading-state";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background p-8"><LoadingState label="Loading login..." /></main>}>
      <LoginClient />
    </Suspense>
  );
}
