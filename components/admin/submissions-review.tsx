"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, Profile, Submission, SubmissionStatus, Task } from "@/lib/supabase/types";
import { formatDateTime, toNumber } from "@/lib/utils";

type ReviewForm = { score: string; feedback: string; status: SubmissionStatus };

export function SubmissionsReview() {
  const supabase = createSupabaseBrowserClient();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [forms, setForms] = useState<Record<string, ReviewForm>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [submissionResult, taskResult, profileResult, courseResult] = await Promise.all([
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student"),
      supabase.from("courses").select("*"),
    ]);
    const error = submissionResult.error ?? taskResult.error ?? profileResult.error ?? courseResult.error;
    if (error) setToast({ type: "error", message: error.message });
    const loadedSubmissions = submissionResult.data ?? [];
    setSubmissions(loadedSubmissions);
    setTasks(taskResult.data ?? []);
    setStudents(profileResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setForms(Object.fromEntries(loadedSubmissions.map((submission) => [submission.id, {
      score: String(submission.score ?? 0),
      feedback: submission.feedback ?? "",
      status: submission.status,
    }])));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  function updateForm(submissionId: string, patch: Partial<ReviewForm>) {
    setForms((current) => ({ ...current, [submissionId]: { ...current[submissionId], ...patch } }));
  }

  async function saveReview(submission: Submission, forcedStatus?: SubmissionStatus) {
    const form = forms[submission.id];
    if (!form) return;
    const status = forcedStatus ?? form.status;
    const score = status === "reviewed" ? toNumber(form.score, 0) : 0;

    setBusyId(submission.id);
    const { error } = await supabase
      .from("submissions")
      .update({
        status,
        score,
        feedback: form.feedback.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
    setBusyId(null);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    setToast({ type: "success", message: status === "reviewed" ? "Submission scored." : "Revision requested." });
    await loadData();
  }

  if (loading) return <LoadingState label="Loading submissions..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Submission Review" title="Review and score submissions" description="Score submissions, add feedback, or request revision. Saving updates task status and progress reports automatically." />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {submissions.length === 0 ? (
          <EmptyState title="No submissions yet" description="Student submissions will appear here after assigned tasks are submitted." icon="rate_review" />
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => {
              const task = taskById.get(submission.task_id);
              const form = forms[submission.id] ?? { score: "0", feedback: "", status: submission.status };
              return (
                <article key={submission.id} className="wc-card overflow-hidden">
                  <div className="grid gap-0 xl:grid-cols-[1fr_340px]">
                    <div className="p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-on-surface">{task?.title ?? "Unknown task"}</h2>
                        <StatusPill value={submission.status} />
                      </div>
                      <p className="text-sm text-on-surface-variant">{submission.explanation || "No explanation provided."}</p>
                      <div className="mt-3 grid gap-2 text-xs text-on-surface-variant md:grid-cols-2">
                        <p><b>Student:</b> {studentById.get(submission.student_id)?.full_name ?? "Unknown"}</p>
                        <p><b>Course:</b> {task ? courseById.get(task.course_id)?.title ?? "Unknown" : "Unknown"}</p>
                        <p><b>Submitted:</b> {formatDateTime(submission.submitted_at)}</p>
                        <p><b>Max score:</b> {task?.max_score ?? 100}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <ResourceLink label="GitHub" url={submission.github_url} />
                        <ResourceLink label="Google Doc" url={submission.google_doc_url} />
                        <ResourceLink label="Google Sheet" url={submission.google_sheet_url} />
                        <ResourceLink label="Image" url={submission.image_url} />
                        <ResourceLink label="Proof" url={submission.proof_url} />
                      </div>
                    </div>
                    <form className="space-y-3 border-t border-outline-variant bg-surface-container-lowest p-4 xl:border-l xl:border-t-0" onSubmit={(event) => { event.preventDefault(); void saveReview(submission, "reviewed"); }}>
                      <label className="block">
                        <span className="wc-label">Review Status</span>
                        <select className="wc-input mt-2" value={form.status} onChange={(event) => updateForm(submission.id, { status: event.target.value as SubmissionStatus })}>
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="revision_required">Revision Required</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="wc-label">Score</span>
                        <input className="wc-input mt-2" type="number" min="0" max={task?.max_score ?? 100} value={form.score} onChange={(event) => updateForm(submission.id, { score: event.target.value })} />
                      </label>
                      <label className="block">
                        <span className="wc-label">Feedback</span>
                        <textarea className="wc-input mt-2 min-h-20" value={form.feedback} onChange={(event) => updateForm(submission.id, { feedback: event.target.value })} placeholder="Give actionable feedback..." />
                      </label>
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                        <button disabled={busyId === submission.id} className="wc-primary-btn py-2.5 text-sm">Save Score</button>
                        <button type="button" disabled={busyId === submission.id} onClick={() => saveReview(submission, "revision_required")} className="wc-secondary-btn border-orange-500 py-2.5 text-sm text-orange-700 hover:bg-orange-50">Request Revision</button>
                      </div>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}

function ResourceLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  return <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-bold text-primary">{label}</a>;
}
