"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon } from "@/components/icon";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Profile } from "@/lib/supabase/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const message = searchParams.get("message");
  const verified = searchParams.get("verified");
  const supabase = createSupabaseBrowserClient();
  const [mode, setMode] = useState<"signin" | "student">("signin");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(
    verified ? { type: "success", message: "Email verified. You can now continue." } : message ? { type: "info", message: statusMessage(message) } : null,
  );
  const [form, setForm] = useState({ email: "", password: "" });
  const clearToast = useCallback(() => setToast(null), []);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function routeAfterAuth(userId: string) {
    const { data } = await supabase.from("profiles").select("role,status").eq("id", userId).single();
    const profile = data as Pick<Profile, "role" | "status"> | null;

    if (!profile) {
      setToast({ type: "info", message: "Profile is being created. Try again after a moment." });
      return;
    }

    if (profile.status !== "approved") {
      setToast({ type: "info", message: statusMessage(profile.status) });
      return;
    }

    router.push(next ?? (profile.role === "admin" ? "/admin" : "/student"));
    router.refresh();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setToast({ type: "error", message: "Use a valid email address." });
      return;
    }

    if (mode === "student") {
      setLoading(true);
      const email = form.email.trim().toLowerCase();
      const { data: canRequestAccess, error: approvalError } = await supabase.rpc("can_request_student_access", { target_email: email });

      if (approvalError) {
        setLoading(false);
        setToast({ type: "error", message: approvalError.message });
        return;
      }

      if (!canRequestAccess) {
        setLoading(false);
        setToast({ type: "info", message: "Your email is not approved yet. Ask admin to approve your application first." });
        return;
      }

      if (form.password.length < 6) {
        setLoading(false);
        setToast({ type: "error", message: "Choose a password with at least 6 characters." });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
      });
      setLoading(false);

      if (error) {
        setToast({
          type: "error",
          message: error.message === "User already registered" ? "This student account already exists. Use Sign In with the same approved email and password." : error.message,
        });
        return;
      }

      if (data.session && data.user) {
        await routeAfterAuth(data.user.id);
        return;
      }

      setMode("signin");
      setToast({ type: "success", message: "Student account created! Check your email for a verification link, then sign in with your email and password." });
      return;
    }

    if (form.password.length < 6) {
      setToast({ type: "error", message: "Use a password with at least 6 characters." });
      return;
    }

    setLoading(true);

    if (mode === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email.trim().toLowerCase(), password: form.password });
      setLoading(false);

      if (error) {
        setToast({ type: "error", message: error.message });
        return;
      }

      if (data.user) await routeAfterAuth(data.user.id);
      return;
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(0,51,160,0.2),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(254,214,91,0.35),transparent_25%),linear-gradient(135deg,#ffffff,#f0f3ff)] px-5 py-8 md:px-margin-page">
      <Toast toast={toast} onClear={clearToast} />
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl bg-primary p-8 text-white shadow-2xl md:p-10">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white">
            <Icon name="arrow_back" className="text-lg" /> Back to landing page
          </Link>
          <div className="mt-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="lock_open" className="text-4xl" />
          </div>
          <p className="mt-10 text-label-sm uppercase tracking-widest text-blue-100">WeConnect Access</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight">Role-based login for admins and students.</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">Admins sign in with password. Approved students create their own password once, then use the same email and password to sign in.</p>
          <div className="mt-10 rounded-xl bg-white/10 p-5 text-sm text-blue-50">
            First admin setup: create the user from Supabase Authentication, then run the SQL in `supabase/admin-setup.sql` with your email.
          </div>
        </section>

        <section className="wc-card p-6 md:p-8">
          <div className="mb-8 flex rounded-xl bg-surface-container p-1">
            <button onClick={() => setMode("signin")} className={`flex-1 rounded-lg px-4 py-3 text-label-md ${mode === "signin" ? "bg-white text-primary shadow" : "text-on-surface-variant"}`}>Sign In</button>
            <button onClick={() => setMode("student")} className={`flex-1 rounded-lg px-4 py-3 text-label-md ${mode === "student" ? "bg-white text-primary shadow" : "text-on-surface-variant"}`}>Student Sign Up</button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="wc-label">Email</span>
              <input value={form.email} onChange={(event) => updateField("email", event.target.value)} className="wc-input mt-2" type="email" autoComplete="email" required />
            </label>

            <label className="block">
              <span className="wc-label">{mode === "signin" ? "Password" : "Create Password"}</span>
              <input value={form.password} onChange={(event) => updateField("password", event.target.value)} className="wc-input mt-2" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required />
            </label>

            {mode === "signin" ? null : (
              <div className="rounded-xl bg-surface-container-low p-4 text-body-md text-on-surface-variant">
                Only admin-approved student emails can create an account here. After signup, use the same email and password to sign in.
              </div>
            )}

            {mode === "signin" ? (
              <button disabled={loading} className="wc-primary-btn w-full py-4 text-lg">
                {loading ? "Working..." : "Sign In"}
              </button>
            ) : (
              <button disabled={loading} className="wc-primary-btn w-full py-4 text-lg">
                {loading ? "Working..." : "Create Student Account"}
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

function statusMessage(status: string) {
  if (status === "pending" || status === "profile_pending") return "Your profile is pending admin approval.";
  if (status === "rejected") return "Your application/profile was rejected. Contact admin for clarification.";
  return "Continue after your account status is approved.";
}
