"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, Profile, ProgressReport } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

export function ProgressManager() {
  const supabase = createSupabaseBrowserClient();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [reportResult, studentResult, courseResult] = await Promise.all([
      supabase.from("progress_reports").select("*").order("updated_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student"),
      supabase.from("courses").select("*"),
    ]);
    const error = reportResult.error ?? studentResult.error ?? courseResult.error;
    if (error) setToast({ type: "error", message: error.message });
    setReports(reportResult.data ?? []);
    setStudents(studentResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  if (loading) return <LoadingState label="Loading progress reports..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Progress Reports" title="Automatic progress reports" description="Progress is recalculated by database triggers whenever tasks or submissions change." />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {reports.length === 0 ? (
          <EmptyState title="No progress reports yet" description="Assign tasks to enrolled students to generate progress records." icon="monitoring" />
        ) : (
          <div className="wc-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-primary">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Tasks</th>
                    <th className="px-4 py-3">Avg Score</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {reports.map((report) => (
                    <motion.tr key={report.id} whileHover={{ backgroundColor: "rgba(0, 33, 110, 0.02)" }} className="transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-on-surface">{studentById.get(report.student_id)?.full_name ?? "Unknown student"}</p>
                        <p className="text-[11px] text-on-surface-variant">{studentById.get(report.student_id)?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{courseById.get(report.course_id)?.title ?? "Unknown course"}</td>
                      <td className="px-4 py-3">
                        <div className="min-w-36">
                          <div className="mb-1 flex justify-between text-xs font-bold text-primary">
                            <span>{report.progress_percentage}%</span>
                            <span>{report.completed_tasks}/{report.total_tasks}</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface-container">
                            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${report.progress_percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{report.completed_tasks} done · {report.pending_tasks} pending</td>
                      <td className="px-4 py-3 text-sm font-bold text-on-surface">{report.average_score}</td>
                      <td className="px-4 py-3 text-[11px] text-on-surface-variant">{formatDateTime(report.updated_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
