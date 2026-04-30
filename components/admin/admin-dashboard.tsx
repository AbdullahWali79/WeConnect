"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Application, CompletedStudent, Course, Enrollment, Profile, Task } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

type DashboardData = {
  courses: Course[];
  applications: Application[];
  profiles: Profile[];
  enrollments: Enrollment[];
  tasks: Task[];
  completed: CompletedStudent[];
};

export function AdminDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<DashboardData>({ courses: [], applications: [], profiles: [], enrollments: [], tasks: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [courses, applications, profiles, enrollments, tasks, completed] = await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("*").order("created_at", { ascending: false }).limit(12),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("completed_students").select("*").order("completed_at", { ascending: false }),
    ]);

    const error = courses.error ?? applications.error ?? profiles.error ?? enrollments.error ?? tasks.error ?? completed.error;
    if (error) setToast({ type: "error", message: error.message });

    setData({
      courses: courses.data ?? [],
      applications: applications.data ?? [],
      profiles: profiles.data ?? [],
      enrollments: enrollments.data ?? [],
      tasks: tasks.data ?? [],
      completed: completed.data ?? [],
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const courseById = useMemo(() => new Map(data.courses.map((course) => [course.id, course])), [data.courses]);
  const pendingApplications = data.applications.filter((application) => application.status === "pending");
  const approvedStudents = data.profiles.filter((profile) => profile.role === "student" && profile.status === "approved");
  const activeTasks = data.tasks.filter((task) => task.status !== "reviewed");

  async function updateApplication(applicationId: string, action: "approve_application" | "reject_application") {
    setBusyId(applicationId);
    const { error } =
      action === "approve_application"
        ? await supabase.rpc("approve_application", { application_id: applicationId })
        : await supabase.rpc("reject_application", { application_id: applicationId });
    setBusyId(null);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    setToast({ type: "success", message: action === "approve_application" ? "Application approved." : "Application rejected." });
    await loadData();
  }

  if (loading) return <LoadingState label="Loading admin dashboard..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader
        eyebrow="Admin Portal"
        title="Operations dashboard"
        description="Live Supabase stats for courses, applications, enrollments, tasks, and completions."
        action={<Link href="/admin/tasks" className="wc-primary-btn"><Icon name="assignment_add" /> Assign Task</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon="school" label="Total Courses" value={data.courses.length} />
        <StatCard icon="pending_actions" label="Pending Apps" value={pendingApplications.length} tone="secondary" />
        <StatCard icon="groups" label="Approved Students" value={approvedStudents.length} />
        <StatCard icon="assignment" label="Active Tasks" value={activeTasks.length} />
        <StatCard icon="workspace_premium" label="Completed" value={data.completed.length} dark />
      </div>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="wc-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/70 p-6">
            <div>
              <h2 className="text-title-lg text-on-surface">Recent Applications</h2>
              <p className="text-body-sm text-on-surface-variant">Approve or reject real application rows.</p>
            </div>
            <Link href="/admin/applications" className="wc-secondary-btn px-4 py-2">View all</Link>
          </div>

          {data.applications.length === 0 ? (
            <div className="p-6"><EmptyState title="No applications yet" description="Public application submissions will appear here." icon="pending_actions" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-surface-container-low text-label-sm uppercase tracking-widest text-primary">
                  <tr>
                    <th className="p-5">Applicant</th>
                    <th className="p-5">Course</th>
                    <th className="p-5">Phone</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Date</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/70">
                  {data.applications.slice(0, 6).map((application) => (
                    <tr key={application.id}>
                      <td className="p-5">
                        <p className="font-bold text-on-surface">{application.full_name}</p>
                        <p className="text-body-sm text-on-surface-variant">{application.email}</p>
                      </td>
                      <td className="p-5 text-on-surface-variant">{application.course_id ? courseById.get(application.course_id)?.title ?? "Unknown course" : "Not selected"}</td>
                      <td className="p-5 text-on-surface-variant">{application.phone}</td>
                      <td className="p-5"><StatusPill value={application.status} /></td>
                      <td className="p-5 text-on-surface-variant">{formatDate(application.created_at)}</td>
                      <td className="p-5">
                        <div className="flex justify-end gap-2">
                          <button disabled={application.status !== "pending" || busyId === application.id} onClick={() => updateApplication(application.id, "approve_application")} className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-40"><Icon name="check" /></button>
                          <button disabled={application.status !== "pending" || busyId === application.id} onClick={() => updateApplication(application.id, "reject_application")} className="rounded-lg bg-error-container p-2 text-error hover:bg-red-100 disabled:opacity-40"><Icon name="close" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl bg-primary p-6 text-white shadow-card">
            <h3 className="text-title-lg">Quick Tasks</h3>
            <div className="mt-5 space-y-3 text-sm text-blue-50">
              <QuickLink href="/admin/applications" icon="pending_actions" label={`Review ${pendingApplications.length} pending applications`} />
              <QuickLink href="/admin/courses" icon="school" label="Manage course catalog" />
              <QuickLink href="/admin/submissions" icon="rate_review" label="Score submissions" />
            </div>
          </div>
          <div className="wc-card p-6">
            <h3 className="text-title-lg text-on-surface">Progress Snapshot</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">{data.enrollments.length} total enrollments, {data.enrollments.filter((enrollment) => enrollment.status === "active").length} active.</p>
            <Link href="/admin/progress" className="mt-5 inline-flex text-label-md text-primary">View Detailed Report</Link>
          </div>
        </aside>
      </section>
    </>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useSpring(0, { duration: 1500, bounce: 0 });
  const display = useTransform(motionValue, (v) => Math.floor(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display]);

  return <span ref={ref}>{displayValue}</span>;
}

function StatCard({ icon, label, value, tone, dark }: { icon: string; label: string; value: number; tone?: "secondary"; dark?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={
        dark
          ? "relative overflow-hidden rounded-xl bg-primary p-4 text-white shadow-card transition-shadow hover:shadow-glow"
          : "relative overflow-hidden rounded-xl border border-outline-variant/40 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
      }
    >
      {/* Subtle top accent line */}
      <div
        className={
          dark
            ? "absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-white/20 via-white/40 to-white/20"
            : tone === "secondary"
              ? "absolute left-0 right-0 top-0 h-0.5 bg-secondary"
              : "absolute left-0 right-0 top-0 h-0.5 bg-primary/30"
        }
      />

      <div className="flex items-center gap-3">
        <div
          className={
            dark
              ? "flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white"
              : tone === "secondary"
                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-fixed"
                : "flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary"
          }
        >
          <Icon name={icon} className="text-lg" />
        </div>
        <p className={dark ? "text-xs font-bold uppercase tracking-widest text-blue-100" : "text-xs font-bold uppercase tracking-widest text-on-surface-variant"}>
          {label}
        </p>
      </div>

      <p className={dark ? "mt-3 text-2xl font-black text-white" : "mt-3 text-2xl font-black text-primary"}>
        <AnimatedNumber value={value} />
      </p>
    </motion.div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg bg-white/10 p-3 hover:bg-white/15">
      <Icon name={icon} className="text-xl" />
      <span>{label}</span>
    </Link>
  );
}
