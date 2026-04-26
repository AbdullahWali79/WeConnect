"use client";

import { useCallback, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Course } from "@/lib/supabase/types";
import { Toast, type ToastState } from "@/components/toast";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  course_id: "",
  message: "",
};

export function ApplicationForm({ courses, selectedCourseId }: { courses: Course[]; selectedCourseId?: string }) {
  const supabase = createSupabaseBrowserClient();
  const [form, setForm] = useState({ ...initialForm, course_id: selectedCourseId ?? courses[0]?.id ?? "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const selectedCourse = useMemo(() => courses.find((course) => course.id === form.course_id), [courses, form.course_id]);
  const clearToast = useCallback(() => setToast(null), []);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.course_id) {
      setToast({ type: "error", message: "Full name, email, phone, and course are required." });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setToast({ type: "error", message: "Enter a valid email address." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("applications").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      course_id: form.course_id,
      message: form.message.trim() || null,
    });

    setLoading(false);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    setForm({ ...initialForm, course_id: selectedCourseId ?? courses[0]?.id ?? "" });
    setToast({ type: "success", message: "Application submitted. Admin will review it from the dashboard." });
  }

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <form onSubmit={submit} className="wc-card space-y-5 p-6 md:p-8">
        <div>
          <p className="wc-label">Selected Course</p>
          <select value={form.course_id} onChange={(event) => updateField("course_id", event.target.value)} className="wc-input mt-2" required>
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          {selectedCourse?.description ? <p className="mt-2 text-body-sm text-on-surface-variant">{selectedCourse.description}</p> : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="wc-label">Full Name</span>
            <input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} className="wc-input mt-2" placeholder="Your full name" required />
          </label>
          <label className="block">
            <span className="wc-label">Email</span>
            <input value={form.email} onChange={(event) => updateField("email", event.target.value)} className="wc-input mt-2" placeholder="you@example.com" type="email" required />
          </label>
          <label className="block">
            <span className="wc-label">Phone / WhatsApp</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="wc-input mt-2" placeholder="+92 300 0000000" required />
          </label>
          <label className="block">
            <span className="wc-label">Message</span>
            <input value={form.message} onChange={(event) => updateField("message", event.target.value)} className="wc-input mt-2" placeholder="Tell us your goal" />
          </label>
        </div>

        <button disabled={loading || courses.length === 0} className="wc-primary-btn w-full py-4 text-lg">
          {loading ? "Submitting..." : "Send Application Interest"}
        </button>
      </form>
    </>
  );
}
