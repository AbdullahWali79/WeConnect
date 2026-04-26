"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, Enrollment, ProgressReport, Submission, Task } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

export function StudentProgress() {
  const supabase = createSupabaseBrowserClient();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [reportResult, courseResult, enrollmentResult, taskResult, submissionResult] = await Promise.all([
      supabase.from("progress_reports").select("*").order("updated_at", { ascending: false }),
      supabase.from("courses").select("*"),
      supabase.from("enrollments").select("*"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
    ]);
    setReports(reportResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setEnrollments(enrollmentResult.data ?? []);
    setTasks(taskResult.data ?? []);
    setSubmissions(submissionResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const submissionsByTask = useMemo(() => new Map(submissions.map((submission) => [submission.task_id, submission])), [submissions]);

  if (loading) return <LoadingState label="Loading your progress..." />;

  return (
    <>
      <PageHeader eyebrow="My Progress" title="Progress report" description="Scores and completion percentages update automatically after admin reviews your submissions." />
      {enrollments.length === 0 ? (
        <EmptyState title="No enrollments yet" description="Your enrollments will appear after admin approval." icon="monitoring" />
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => {
            const report = reports.find((item) => item.course_id === enrollment.course_id);
            const courseTasks = tasks.filter((task) => task.course_id === enrollment.course_id);
            const progress = report?.progress_percentage ?? enrollment.progress_percentage;
            return (
              <section key={enrollment.id} className="wc-card overflow-hidden">
                <div className="bg-primary p-6 text-white">
                  <p className="text-label-sm uppercase tracking-widest text-blue-100">{enrollment.status}</p>
                  <h2 className="mt-2 text-3xl font-extrabold">{courseById.get(enrollment.course_id)?.title ?? "Course"}</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <Metric label="Progress" value={`${progress}%`} />
                    <Metric label="Total Tasks" value={report?.total_tasks ?? courseTasks.length} />
                    <Metric label="Completed" value={report?.completed_tasks ?? courseTasks.filter((task) => task.status === "reviewed").length} />
                    <Metric label="Average Score" value={report?.average_score ?? enrollment.final_score} />
                  </div>
                  <div className="mt-6 h-3 rounded-full bg-white/20"><div className="h-3 rounded-full bg-secondary-container" style={{ width: `${progress}%` }} /></div>
                </div>

                <div className="divide-y divide-outline-variant/70">
                  {courseTasks.length === 0 ? (
                    <p className="p-6 text-body-md text-on-surface-variant">No tasks assigned for this course yet.</p>
                  ) : (
                    courseTasks.map((task) => {
                      const submission = submissionsByTask.get(task.id);
                      return (
                        <div key={task.id} className="grid gap-4 p-6 md:grid-cols-[1fr_180px_180px] md:items-center">
                          <div>
                            <p className="font-bold text-on-surface">{task.title}</p>
                            <p className="text-body-sm text-on-surface-variant">Deadline {formatDateTime(task.deadline)}</p>
                          </div>
                          <p className="text-body-sm font-bold uppercase tracking-wide text-primary">{task.status.replaceAll("_", " ")}</p>
                          <p className="text-body-sm text-on-surface-variant">Score {submission?.score ?? 0}/{task.max_score}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-100">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
