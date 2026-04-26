"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, ProgressReport, Submission, Task, TaskResource } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

export function StudentDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<TaskResource[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [taskResult, resourceResult, submissionResult, courseResult, reportResult] = await Promise.all([
      supabase.from("tasks").select("*").order("deadline", { ascending: true, nullsFirst: false }),
      supabase.from("task_resources").select("*").order("created_at", { ascending: true }),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("courses").select("*").order("title"),
      supabase.from("progress_reports").select("*").order("updated_at", { ascending: false }),
    ]);
    const error = taskResult.error ?? resourceResult.error ?? submissionResult.error ?? courseResult.error ?? reportResult.error;
    if (error) setToast({ type: "error", message: error.message });
    setTasks(taskResult.data ?? []);
    setResources(resourceResult.data ?? []);
    setSubmissions(submissionResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setReports(reportResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const submissionByTaskId = useMemo(() => new Map(submissions.map((submission) => [submission.task_id, submission])), [submissions]);
  const totalTasks = tasks.length;
  const submittedTasks = tasks.filter((task) => task.status === "submitted" || task.status === "reviewed" || task.status === "revision_required").length;
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "in_progress").length;
  const progress = reports.length > 0 ? Math.round(reports.reduce((sum, report) => sum + report.progress_percentage, 0) / reports.length) : 0;

  if (loading) return <LoadingState label="Loading student dashboard..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Student Hub" title="My assigned tasks" description="View assigned work, open resources, and submit task proof. RLS limits this page to your own rows." action={<Link href="/student/progress" className="wc-secondary-btn">View Progress</Link>} />

      <div className="mb-8 grid gap-5 md:grid-cols-4">
        <Stat label="Overall Progress" value={`${progress}%`} icon="donut_large" dark />
        <Stat label="Total Tasks" value={totalTasks} icon="assignment" />
        <Stat label="Pending Tasks" value={pendingTasks} icon="pending_actions" />
        <Stat label="Submitted" value={submittedTasks} icon="upload_file" />
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No assigned tasks yet" description="Your tasks will appear here after admin assigns them." icon="assignment" />
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => {
            const taskResources = resources.filter((resource) => resource.task_id === task.id);
            const submission = submissionByTaskId.get(task.id);
            const disabled = task.status === "reviewed" || task.status === "submitted";
            return (
              <article key={task.id} className="wc-card p-6 transition hover:-translate-y-0.5 hover:shadow-2xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-title-lg text-on-surface">{task.title}</h2>
                      <StatusPill value={task.status} />
                    </div>
                    <p className="text-body-md text-on-surface-variant">{task.description ?? "No description"}</p>
                    <div className="mt-4 grid gap-2 text-body-sm text-on-surface-variant md:grid-cols-3">
                      <span>Course: {courseById.get(task.course_id)?.title ?? "Unknown"}</span>
                      <span>Deadline: {formatDateTime(task.deadline)}</span>
                      <span>Max score: {task.max_score}</span>
                    </div>
                    {submission ? <p className="mt-3 text-body-sm text-on-surface-variant">Latest submission: {submission.status.replaceAll("_", " ")} · Score {submission.score}</p> : null}
                  </div>
                  <Link href={`/student/tasks/${task.id}/submit`} className={disabled ? "wc-secondary-btn pointer-events-none opacity-50" : "wc-primary-btn"}>
                    <Icon name="upload_file" /> {task.status === "revision_required" ? "Resubmit" : "Submit Task"}
                  </Link>
                </div>
                {taskResources.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {taskResources.map((resource) => (
                      <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-primary">
                        {resource.title ?? resource.resource_type.replaceAll("_", " ")}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function Stat({ label, value, icon, dark }: { label: string; value: string | number; icon: string; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-xl bg-primary p-5 text-white shadow-card" : "wc-card p-5"}>
      <div className={dark ? "mb-5 inline-flex rounded-xl bg-white/15 p-3" : "mb-5 inline-flex rounded-xl bg-surface-container p-3 text-primary"}><Icon name={icon} /></div>
      <p className={dark ? "text-sm font-bold text-blue-100" : "text-sm font-bold text-on-surface-variant"}>{label}</p>
      <p className={dark ? "text-4xl font-black text-white" : "text-4xl font-black text-primary"}>{value}</p>
    </div>
  );
}
