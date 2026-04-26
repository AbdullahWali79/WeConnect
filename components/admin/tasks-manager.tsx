"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, Enrollment, Profile, ResourceType, Task, TaskResource } from "@/lib/supabase/types";
import { formatDateTime, toNumber } from "@/lib/utils";

const taskInitial = { student_id: "", course_id: "", title: "", description: "", deadline: "", max_score: "100" };
type ResourceForm = { resource_type: ResourceType; title: string; url: string };
const emptyResource: ResourceForm = { resource_type: "custom", title: "", url: "" };

export function TasksManager() {
  const supabase = createSupabaseBrowserClient();
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<TaskResource[]>([]);
  const [form, setForm] = useState(taskInitial);
  const [resourceForms, setResourceForms] = useState<ResourceForm[]>([{ ...emptyResource }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [studentResult, courseResult, enrollmentResult, taskResult, resourceResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "student").eq("status", "approved").order("full_name"),
      supabase.from("courses").select("*").order("title"),
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("task_resources").select("*").order("created_at", { ascending: true }),
    ]);
    const error = studentResult.error ?? courseResult.error ?? enrollmentResult.error ?? taskResult.error ?? resourceResult.error;
    if (error) setToast({ type: "error", message: error.message });
    setStudents(studentResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setEnrollments(enrollmentResult.data ?? []);
    setTasks(taskResult.data ?? []);
    setResources(resourceResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const enrollmentOptions = enrollments.filter((enrollment) => enrollment.status === "active" || enrollment.status === "completed");

  function updateResource(index: number, patch: Partial<ResourceForm>) {
    setResourceForms((current) => current.map((resource, itemIndex) => itemIndex === index ? { ...resource, ...patch } : resource));
  }

  async function assignTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.student_id || !form.course_id || !form.title.trim()) {
      setToast({ type: "error", message: "Student, course, and task title are required." });
      return;
    }

    const isEnrolled = enrollments.some((enrollment) => enrollment.student_id === form.student_id && enrollment.course_id === form.course_id);
    if (!isEnrolled) {
      setToast({ type: "error", message: "Selected student is not enrolled in this course." });
      return;
    }

    setSaving(true);
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        student_id: form.student_id,
        course_id: form.course_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        max_score: toNumber(form.max_score, 100),
      })
      .select("*")
      .single();

    if (error || !task) {
      setSaving(false);
      setToast({ type: "error", message: error?.message ?? "Failed to create task." });
      return;
    }

    const cleanResources = resourceForms.filter((resource) => resource.url.trim());
    if (cleanResources.length > 0) {
      const { error: resourceError } = await supabase.from("task_resources").insert(cleanResources.map((resource) => ({
        task_id: task.id,
        resource_type: resource.resource_type,
        title: resource.title.trim() || resource.resource_type.replaceAll("_", " "),
        url: resource.url.trim(),
      })));
      if (resourceError) {
        setSaving(false);
        setToast({ type: "error", message: resourceError.message });
        return;
      }
    }

    setSaving(false);
    setToast({ type: "success", message: "Task assigned with resources." });
    setForm(taskInitial);
    setResourceForms([{ ...emptyResource }]);
    await loadData();
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this task and its resources/submission?");
    if (!confirmed) return;
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }
    setToast({ type: "success", message: "Task deleted." });
    await loadData();
  }

  if (loading) return <LoadingState label="Loading task manager..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Task Assignment" title="Assign tasks with resources" description="Create a task for an enrolled student and attach video, Google Docs, Sheets, images, GitHub, or custom resource links." />

      <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
        <form onSubmit={assignTask} className="wc-card space-y-5 p-6">
          <h2 className="text-title-lg text-on-surface">New task</h2>
          <label className="block">
            <span className="wc-label">Enrolled Student</span>
            <select className="wc-input mt-2" value={form.student_id} onChange={(event) => setForm((current) => ({ ...current, student_id: event.target.value, course_id: "" }))} required>
              <option value="">Choose student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.full_name ?? student.email}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="wc-label">Course Enrollment</span>
            <select className="wc-input mt-2" value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))} required>
              <option value="">Choose course</option>
              {enrollmentOptions.filter((enrollment) => !form.student_id || enrollment.student_id === form.student_id).map((enrollment) => (
                <option key={enrollment.id} value={enrollment.course_id}>{courseById.get(enrollment.course_id)?.title ?? "Unknown course"}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="wc-label">Title</span>
            <input className="wc-input mt-2" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          </label>
          <label className="block">
            <span className="wc-label">Description</span>
            <textarea className="wc-input mt-2 min-h-28" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="wc-label">Deadline</span>
              <input className="wc-input mt-2" type="datetime-local" value={form.deadline} onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))} />
            </label>
            <label className="block">
              <span className="wc-label">Max Score</span>
              <input className="wc-input mt-2" type="number" min="1" value={form.max_score} onChange={(event) => setForm((current) => ({ ...current, max_score: event.target.value }))} />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface">Resources</h3>
              <button type="button" onClick={() => setResourceForms((current) => [...current, { ...emptyResource }])} className="text-label-md text-primary">Add link</button>
            </div>
            {resourceForms.map((resource, index) => (
              <div key={index} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <select className="wc-input" value={resource.resource_type} onChange={(event) => updateResource(index, { resource_type: event.target.value as ResourceType })}>
                    <option value="video">Video</option>
                    <option value="google_doc">Google Doc</option>
                    <option value="google_sheet">Google Sheet</option>
                    <option value="image">Image</option>
                    <option value="github">GitHub</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input className="wc-input" placeholder="Resource title" value={resource.title} onChange={(event) => updateResource(index, { title: event.target.value })} />
                </div>
                <input className="wc-input mt-3" placeholder="https://..." value={resource.url} onChange={(event) => updateResource(index, { url: event.target.value })} />
                {resourceForms.length > 1 ? <button type="button" onClick={() => setResourceForms((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 text-sm font-bold text-error">Remove</button> : null}
              </div>
            ))}
          </div>

          <button disabled={saving} className="wc-primary-btn w-full">{saving ? "Assigning..." : "Assign Task"}</button>
        </form>

        <section className="wc-card overflow-hidden">
          <div className="border-b border-outline-variant/70 p-6"><h2 className="text-title-lg text-on-surface">Assigned tasks</h2></div>
          {tasks.length === 0 ? <div className="p-6"><EmptyState title="No tasks assigned" description="Create a task for an enrolled student." icon="assignment" /></div> : (
            <div className="divide-y divide-outline-variant/70">
              {tasks.map((task) => {
                const taskResources = resources.filter((resource) => resource.task_id === task.id);
                return (
                  <article key={task.id} className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3"><h3 className="text-title-lg text-on-surface">{task.title}</h3><StatusPill value={task.status} /></div>
                        <p className="text-body-md text-on-surface-variant">{task.description ?? "No description"}</p>
                        <p className="mt-3 text-body-sm text-on-surface-variant">{studentById.get(task.student_id)?.full_name ?? "Unknown student"} · {courseById.get(task.course_id)?.title ?? "Unknown course"} · Deadline {formatDateTime(task.deadline)}</p>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="rounded-lg bg-error-container p-2 text-error"><Icon name="delete" /></button>
                    </div>
                    {taskResources.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {taskResources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-primary">{resource.title ?? resource.resource_type}</a>)}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
