"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course, CourseCategory, CourseStatus } from "@/lib/supabase/types";

const categoryInitial = { name: "", description: "" };
const courseInitial = { title: "", description: "", duration: "", level: "", category_id: "", status: "active" as CourseStatus };

export function CoursesManager() {
  const supabase = createSupabaseBrowserClient();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryForm, setCategoryForm] = useState(categoryInitial);
  const [courseForm, setCourseForm] = useState(courseInitial);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [categoryResult, courseResult] = await Promise.all([
      supabase.from("course_categories").select("*").order("created_at", { ascending: true }),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
    ]);
    if (categoryResult.error ?? courseResult.error) setToast({ type: "error", message: (categoryResult.error ?? courseResult.error)?.message ?? "Failed to load catalog." });
    setCategories(categoryResult.data ?? []);
    setCourses(courseResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      setToast({ type: "error", message: "Category name is required." });
      return;
    }
    setSaving(true);
    const payload = { name: categoryForm.name.trim(), description: categoryForm.description.trim() || null };
    const result = editingCategoryId
      ? await supabase.from("course_categories").update(payload).eq("id", editingCategoryId)
      : await supabase.from("course_categories").insert(payload);
    setSaving(false);
    if (result.error) {
      setToast({ type: "error", message: result.error.message });
      return;
    }
    setToast({ type: "success", message: editingCategoryId ? "Category updated." : "Category created." });
    setCategoryForm(categoryInitial);
    setEditingCategoryId(null);
    await loadData();
  }

  async function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseForm.title.trim()) {
      setToast({ type: "error", message: "Course title is required." });
      return;
    }
    setSaving(true);
    const payload = {
      title: courseForm.title.trim(),
      description: courseForm.description.trim() || null,
      duration: courseForm.duration.trim() || null,
      level: courseForm.level.trim() || null,
      category_id: courseForm.category_id || null,
      status: courseForm.status,
    };
    const result = editingCourseId ? await supabase.from("courses").update(payload).eq("id", editingCourseId) : await supabase.from("courses").insert(payload);
    setSaving(false);
    if (result.error) {
      setToast({ type: "error", message: result.error.message });
      return;
    }
    setToast({ type: "success", message: editingCourseId ? "Course updated." : "Course created." });
    setCourseForm(courseInitial);
    setEditingCourseId(null);
    await loadData();
  }

  async function deleteRow(table: "course_categories" | "courses", id: string) {
    const confirmed = window.confirm("Delete this record? Related records may prevent deletion.");
    if (!confirmed) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }
    setToast({ type: "success", message: "Record deleted." });
    await loadData();
  }

  function editCategory(category: CourseCategory) {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, description: category.description ?? "" });
  }

  function editCourse(course: Course) {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description ?? "",
      duration: course.duration ?? "",
      level: course.level ?? "",
      category_id: course.category_id ?? "",
      status: course.status,
    });
  }

  if (loading) return <LoadingState label="Loading course catalog..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Catalog" title="Courses and categories" description="Create, edit, deactivate, and delete course categories and courses shown on the public landing page." />

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <section className="space-y-6">
          <form onSubmit={saveCategory} className="wc-card space-y-4 p-6">
            <h2 className="text-title-lg text-on-surface">{editingCategoryId ? "Edit category" : "Create category"}</h2>
            <label className="block">
              <span className="wc-label">Name</span>
              <input className="wc-input mt-2" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="block">
              <span className="wc-label">Description</span>
              <textarea className="wc-input mt-2 min-h-24" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="flex gap-3">
              <button disabled={saving} className="wc-primary-btn flex-1">{editingCategoryId ? "Update" : "Create"}</button>
              {editingCategoryId ? <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(categoryInitial); }} className="wc-secondary-btn">Cancel</button> : null}
            </div>
          </form>

          <form onSubmit={saveCourse} className="wc-card space-y-4 p-6">
            <h2 className="text-title-lg text-on-surface">{editingCourseId ? "Edit course" : "Create course"}</h2>
            <label className="block">
              <span className="wc-label">Title</span>
              <input className="wc-input mt-2" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} required />
            </label>
            <label className="block">
              <span className="wc-label">Category</span>
              <select className="wc-input mt-2" value={courseForm.category_id} onChange={(event) => setCourseForm((current) => ({ ...current, category_id: event.target.value }))}>
                <option value="">No category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="wc-label">Duration</span>
                <input className="wc-input mt-2" value={courseForm.duration} onChange={(event) => setCourseForm((current) => ({ ...current, duration: event.target.value }))} />
              </label>
              <label className="block">
                <span className="wc-label">Level</span>
                <input className="wc-input mt-2" value={courseForm.level} onChange={(event) => setCourseForm((current) => ({ ...current, level: event.target.value }))} />
              </label>
            </div>
            <label className="block">
              <span className="wc-label">Status</span>
              <select className="wc-input mt-2" value={courseForm.status} onChange={(event) => setCourseForm((current) => ({ ...current, status: event.target.value as CourseStatus }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className="wc-label">Description</span>
              <textarea className="wc-input mt-2 min-h-28" value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="flex gap-3">
              <button disabled={saving} className="wc-primary-btn flex-1">{editingCourseId ? "Update" : "Create"}</button>
              {editingCourseId ? <button type="button" onClick={() => { setEditingCourseId(null); setCourseForm(courseInitial); }} className="wc-secondary-btn">Cancel</button> : null}
            </div>
          </form>
        </section>

        <section className="space-y-8">
          <div className="wc-card overflow-hidden">
            <div className="border-b border-outline-variant/70 p-6"><h2 className="text-title-lg text-on-surface">Categories</h2></div>
            {categories.length === 0 ? <div className="p-6"><EmptyState title="No categories" description="Create a course category to organize the catalog." /></div> : (
              <div className="divide-y divide-outline-variant/70">
                {categories.map((category) => (
                  <div key={category.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-on-surface">{category.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{category.description ?? "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editCategory(category)} className="rounded-lg bg-surface-container p-2 text-primary"><Icon name="edit" /></button>
                      <button onClick={() => deleteRow("course_categories", category.id)} className="rounded-lg bg-error-container p-2 text-error"><Icon name="delete" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="wc-card overflow-hidden">
            <div className="border-b border-outline-variant/70 p-6"><h2 className="text-title-lg text-on-surface">Courses</h2></div>
            {courses.length === 0 ? <div className="p-6"><EmptyState title="No courses" description="Create a course to show it publicly and enroll students." icon="school" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-surface-container-low text-label-sm uppercase tracking-widest text-primary">
                    <tr><th className="p-5">Course</th><th className="p-5">Category</th><th className="p-5">Duration</th><th className="p-5">Status</th><th className="p-5 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/70">
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td className="p-5"><p className="font-bold text-on-surface">{course.title}</p><p className="max-w-md text-body-sm text-on-surface-variant">{course.description}</p></td>
                        <td className="p-5 text-on-surface-variant">{course.category_id ? categoryById.get(course.category_id)?.name ?? "Unknown" : "None"}</td>
                        <td className="p-5 text-on-surface-variant">{course.duration ?? "Not set"}</td>
                        <td className="p-5"><StatusPill value={course.status} /></td>
                        <td className="p-5"><div className="flex justify-end gap-2"><button onClick={() => editCourse(course)} className="rounded-lg bg-surface-container p-2 text-primary"><Icon name="edit" /></button><button onClick={() => deleteRow("courses", course.id)} className="rounded-lg bg-error-container p-2 text-error"><Icon name="delete" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
