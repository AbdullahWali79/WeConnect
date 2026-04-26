"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Profile } from "@/lib/supabase/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

const nav = [
  { href: "/student", label: "My Tasks", icon: "assignment" },
  { href: "/student/progress", label: "My Progress", icon: "monitoring" },
];

export function StudentShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-on-background lg:flex">
      <aside className="sticky top-0 z-30 bg-primary text-white lg:h-screen lg:w-72">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Icon name="school" />
          </div>
          <div>
            <span className="text-lg font-bold">Student Hub</span>
            <p className="text-xs text-blue-100">WeConnect Learning</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-2 lg:overflow-visible">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                  active ? "bg-white text-primary shadow-lg" : "text-blue-100 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon name={item.icon} className="text-[22px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-6 py-6 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <Link href="/student" className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container py-3 font-bold text-on-secondary-fixed">
            <Icon name="add_task" /> Submit Task
          </Link>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-sm font-bold">{profile?.full_name ?? "Student"}</p>
            <p className="truncate text-xs text-blue-100">{profile?.email}</p>
            <button onClick={logout} className="mt-4 w-full rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white">
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
