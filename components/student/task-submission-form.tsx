"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Submission, Task, TaskResource } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

const initialForm = { explanation: "", github_url: "", google_doc_url: "", google_sheet_url: "", image_url: "", proof_url: "" };

export function TaskSubmissionForm({ taskId }: { taskId: string }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [resources, setResources] = useState<TaskResource[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [taskResult, resourceResult, submissionResult] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", taskId).maybeSingle(),
      supabase.from("task_resources").select("*").eq("task_id", taskId).order("created_at", { ascending: true }),
      supabase.from("submissions").select("*").eq("task_id", taskId).maybeSingle(),
    ]);
    const error = taskResult.error ?? resourceResult.error ?? submissionResult.error;
    if (error) setToast({ type: "error", message: error.message });
    setTask(taskResult.data ?? null);
    setResources(resourceResult.data ?? []);
    setSubmission(submissionResult.data ?? null);
    const existing = submissionResult.data;
    if (existing) {
      setForm({
        explanation: existing.explanation ?? "",
        github_url: existing.github_url ?? "",
        google_doc_url: existing.google_doc_url ?? "",
        google_sheet_url: existing.google_sheet_url ?? "",
        image_url: existing.image_url ?? "",
        proof_url: existing.proof_url ?? "",
      });
    }
    setLoading(false);
  }, [supabase, taskId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.explanation.trim()) {
      setToast({ type: "error", message: "Explanation is required." });
      return;
    }

    if (submission && submission.status !== "revision_required") {
      setToast({ type: "error", message: "This task already has a submission under review or reviewed." });
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("submit_task", {
      target_task_id: taskId,
      submission_explanation: form.explanation.trim(),
      submission_github_url: form.github_url.trim() || null,
      submission_google_doc_url: form.google_doc_url.trim() || null,
      submission_google_sheet_url: form.google_sheet_url.trim() || null,
      submission_image_url: form.image_url.trim() || null,
      submission_proof_url: form.proof_url.trim() || null,
    });
    setSaving(false);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    setToast({ type: "success", message: "Task submitted for admin review." });
    router.push("/student");
    router.refresh();
  }

  if (loading) return <LoadingState label="Loading task submission..." />;
  if (!task) return <EmptyState title="Task not found" description="The task either does not exist or is not assigned to your account." icon="assignment_late" />;

  const locked = submission?.status === "submitted" || submission?.status === "reviewed";

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Task Submission" title={task.title} description="Submit your explanation and proof links for admin review." action={<Link href="/student" className="wc-secondary-btn"><Icon name="arrow_back" /> Back</Link>} />
      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <form onSubmit={submit} className="wc-card space-y-5 p-6 md:p-8">
          {submission ? <div className="rounded-xl bg-surface-container-low p-4"><StatusPill value={submission.status} /><p className="mt-2 text-body-sm text-on-surface-variant">Submitted {formatDateTime(submission.submitted_at)}. {submission.feedback ? `Feedback: ${submission.feedback}` : ""}</p></div> : null}
          <label className="block">
            <span className="wc-label">Explanation</span>
            <textarea disabled={locked} className="wc-input mt-2 min-h-40" value={form.explanation} onChange={(event) => updateField("explanation", event.target.value)} placeholder="Explain your work, decisions, and how to review it." required />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <UrlInput label="GitHub Link" value={form.github_url} disabled={locked} onChange={(value) => updateField("github_url", value)} />
            <UrlInput label="Google Docs Link" value={form.google_doc_url} disabled={locked} onChange={(value) => updateField("google_doc_url", value)} />
            <UrlInput label="Google Sheet Link" value={form.google_sheet_url} disabled={locked} onChange={(value) => updateField("google_sheet_url", value)} />
            <UrlInput label="Image / Proof URL" value={form.image_url} disabled={locked} onChange={(value) => updateField("image_url", value)} />
            <UrlInput label="Additional Proof URL" value={form.proof_url} disabled={locked} onChange={(value) => updateField("proof_url", value)} />
          </div>
          <button disabled={saving || locked} className="wc-primary-btn w-full py-4 text-lg">
            {locked ? "Already submitted" : saving ? "Submitting..." : submission?.status === "revision_required" ? "Resubmit Task" : "Submit Task"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="wc-card p-6">
            <h2 className="text-title-lg text-on-surface">Task brief</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{task.description ?? "No task description provided."}</p>
            <div className="mt-5 space-y-2 text-body-sm text-on-surface-variant">
              <p>Deadline: {formatDateTime(task.deadline)}</p>
              <p>Max score: {task.max_score}</p>
              <p>Status: {task.status.replaceAll("_", " ")}</p>
            </div>
          </div>
          <div className="wc-card p-6">
            <h2 className="text-title-lg text-on-surface">Resources</h2>
            {resources.length === 0 ? <p className="mt-3 text-body-md text-on-surface-variant">No resources attached.</p> : (
              <div className="mt-4 space-y-3">
                {resources.map((resource) => (
                  <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-surface-container-low p-4 text-label-md text-primary">
                    <span>{resource.title ?? resource.resource_type.replaceAll("_", " ")}</span>
                    <Icon name="open_in_new" className="text-lg" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function UrlInput({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="wc-label">{label}</span>
      <input disabled={disabled} className="wc-input mt-2" type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
    </label>
  );
}
