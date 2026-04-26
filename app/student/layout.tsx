import { redirect } from "next/navigation";
import { StudentShell } from "@/components/student/student-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student");
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile | null;

  if (!profile) {
    redirect("/login?message=profile_pending");
  }

  if (profile.role === "admin" && profile.status === "approved") {
    redirect("/admin");
  }

  if (profile.status !== "approved") {
    redirect(`/login?message=${profile.status}`);
  }

  return <StudentShell profile={profile}>{children}</StudentShell>;
}
