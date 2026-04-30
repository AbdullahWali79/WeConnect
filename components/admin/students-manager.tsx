"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { resetStudentPassword } from "@/app/admin/actions";
import type { Course, Enrollment, Profile, ProgressReport } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

type StudentRow = Profile & { enrollments: Enrollment[]; progress: ProgressReport[] };

export function StudentsManager() {
  const supabase = createSupabaseBrowserClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const [resetModal, setResetModal] = useState<{ open: boolean; student: Profile | null }>({ open: false, student: null });
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profileResult, enrollmentResult, courseResult, progressResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("title"),
      supabase.from("progress_reports").select("*").order("updated_at", { ascending: false }),
    ]);
    const error = profileResult.error ?? enrollmentResult.error ?? courseResult.error ?? progressResult.error;
    if (error) setToast({ type: "error", message: error.message });
    setProfiles(profileResult.data ?? []);
    setEnrollments(enrollmentResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setProgressReports(progressResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const students: StudentRow[] = profiles.map((profile) => ({
    ...profile,
    enrollments: enrollments.filter((enrollment) => enrollment.student_id === profile.id),
    progress: progressReports.filter((report) => report.student_id === profile.id),
  }));

  async function resetPassword() {
    if (!resetModal.student || !newPassword.trim()) return;
    setResetting(true);
    const result = await resetStudentPassword(resetModal.student.id, newPassword.trim());
    setResetting(false);
    if (!result.success) {
      setToast({ type: "error", message: result.error ?? "Failed to reset password." });
      return;
    }
    setToast({ type: "success", message: "Password reset successfully." });
    setResetModal({ open: false, student: null });
    setNewPassword("");
  }

  if (loading) return <LoadingState label="Loading students..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Students" title="Enrolled students" description="Profiles and enrollments created after approval and the student's first password signup. Use this list when assigning tasks or completing courses." action={<Link href="/admin/tasks" className="wc-primary-btn text-sm py-2 px-4">Assign Task</Link>} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {students.length === 0 ? (
          <EmptyState title="No student profiles yet" description="Approve an application and have the student complete Student Sign Up once to create the enrolled profile." icon="groups" />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {students.map((student) => (
              <article key={student.id} className="wc-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-black text-white">{student.full_name?.slice(0, 1).toUpperCase() ?? "S"}</div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface">{student.full_name ?? "Unnamed student"}</h2>
                        <p className="text-xs text-on-surface-variant">{student.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant">Phone: {student.phone ?? "Not set"}</p>
                    <p className="text-xs text-on-surface-variant">Joined: {formatDate(student.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill value={student.status} />
                    <button onClick={() => setResetModal({ open: true, student })} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container p-2 text-primary hover:bg-surface-container-high" title="Reset Password">
                      <Icon name="lock_reset" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {student.enrollments.length === 0 ? (
                    <p className="rounded-lg bg-surface-container-low p-4 text-xs text-on-surface-variant">No enrollments yet.</p>
                  ) : (
                    student.enrollments.map((enrollment) => {
                      const report = student.progress.find((item) => item.course_id === enrollment.course_id);
                      return (
                        <div key={enrollment.id} className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-on-surface">{courseById.get(enrollment.course_id)?.title ?? "Unknown course"}</p>
                              <p className="text-xs text-on-surface-variant">Progress {report?.progress_percentage ?? enrollment.progress_percentage}% · Score {report?.average_score ?? enrollment.final_score}</p>
                            </div>
                            <StatusPill value={enrollment.status} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.div>

      {resetModal.open && resetModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-primary">Reset Password</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{resetModal.student.full_name} — {resetModal.student.email}</p>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">New Password</span>
              <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="wc-input mt-2" placeholder="Enter new password" />
            </label>
            <div className="mt-4 flex gap-3">
              <button disabled={resetting || !newPassword.trim()} onClick={resetPassword} className="wc-primary-btn flex-1">{resetting ? "Resetting..." : "Reset Password"}</button>
              <button onClick={() => { setResetModal({ open: false, student: null }); setNewPassword(""); }} className="wc-secondary-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
