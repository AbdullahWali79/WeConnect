"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/lib/supabase/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { useTheme } from "@/components/theme-provider";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/applications", label: "Applications", icon: "pending_actions" },
  { href: "/admin/courses", label: "Courses", icon: "school" },
  { href: "/admin/students", label: "Students", icon: "groups" },
  { href: "/admin/tasks", label: "Tasks", icon: "assignment_add" },
  { href: "/admin/submissions", label: "Reviews", icon: "rate_review" },
  { href: "/admin/progress", label: "Progress", icon: "monitoring" },
  { href: "/admin/completions", label: "Completion", icon: "workspace_premium" },
  { href: "/admin/announcements", label: "Announcements", icon: "campaign" },
  { href: "/admin/promotional-popups", label: "Promotions", icon: "auto_awesome" },
];

export function AdminShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <div className="min-h-screen bg-background text-on-background lg:flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg lg:hidden"
      >
        <Icon name="menu" className="text-xl" />
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-[#00216e] text-white dark:bg-[#0a1628] lg:relative lg:block",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="expanded-logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon name="hub" className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold leading-tight">Admin Portal</h1>
                    <p className="text-[10px] text-blue-100 leading-tight">WeConnect</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"
                >
                  <Icon name="hub" className="text-lg" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse toggle - desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-blue-100 transition hover:bg-white/20 hover:text-white lg:flex"
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon name="chevron_left" className="text-sm" />
              </motion.div>
            </button>

            {/* Close button - mobile only */}
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-blue-100 lg:hidden"
            >
              <Icon name="close" className="text-sm" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                    active
                      ? "bg-white text-primary shadow-lg"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                    <Icon
                      name={item.icon}
                      className={cn(
                        "transition-transform duration-200",
                        active ? "text-[20px]" : "text-[20px] group-hover:scale-110"
                      )}
                    />
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Active indicator dot for collapsed */}
                  {collapsed && active && (
                    <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-secondary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Dark Mode Toggle */}
          <div className="px-3 py-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                collapsed ? "justify-center" : "",
                "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? (resolvedTheme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                <Icon name={resolvedTheme === "dark" ? "light_mode" : "dark_mode"} className="text-[20px]" />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* User Profile Footer */}
          <div className="px-3 py-4">
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="expanded-profile"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl bg-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <Icon name="person" className="text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">{profile?.full_name ?? "Admin"}</p>
                        <p className="truncate text-[10px] text-blue-100">{profile?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-fixed transition hover:brightness-105"
                    >
                      <Icon name="logout" className="text-sm" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-profile"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Icon name="person" className="text-lg" />
                  </div>
                  <button
                    onClick={logout}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-fixed transition hover:brightness-105"
                    title="Sign out"
                  >
                    <Icon name="logout" className="text-lg" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 pt-16 md:p-6 md:pt-16 lg:p-6 lg:pt-4">
        {children}
      </main>
    </div>
  );
}
