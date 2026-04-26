"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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

  if (loading) return <LoadingState label="Loading students..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Students" title="Enrolled students" description="Profiles and enrollments created after approval and the student's first email-link login. Use this list when assigning tasks or completing courses." action={<Link href="/admin/tasks" className="wc-primary-btn">Assign Task</Link>} />
      {students.length === 0 ? (
        <EmptyState title="No student profiles yet" description="Approve an application and have the student use the email login link once to create the enrolled profile." icon="groups" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {students.map((student) => (
            <article key={student.id} className="wc-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-black text-white">{student.full_name?.slice(0, 1).toUpperCase() ?? "S"}</div>
                    <div>
                      <h2 className="text-title-lg text-on-surface">{student.full_name ?? "Unnamed student"}</h2>
                      <p className="text-body-sm text-on-surface-variant">{student.email}</p>
                    </div>
                  </div>
                  <p className="text-body-md text-on-surface-variant">Phone: {student.phone ?? "Not set"}</p>
                  <p className="text-body-sm text-on-surface-variant">Joined: {formatDate(student.created_at)}</p>
                </div>
                <StatusPill value={student.status} />
              </div>

              <div className="mt-6 space-y-3">
                {student.enrollments.length === 0 ? (
                  <p className="rounded-lg bg-surface-container-low p-4 text-body-sm text-on-surface-variant">No enrollments yet.</p>
                ) : (
                  student.enrollments.map((enrollment) => {
                    const report = student.progress.find((item) => item.course_id === enrollment.course_id);
                    return (
                      <div key={enrollment.id} className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-on-surface">{courseById.get(enrollment.course_id)?.title ?? "Unknown course"}</p>
                            <p className="text-body-sm text-on-surface-variant">Progress {report?.progress_percentage ?? enrollment.progress_percentage}% · Score {report?.average_score ?? enrollment.final_score}</p>
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
    </>
  );
}
