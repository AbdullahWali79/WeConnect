"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Toast, type ToastState } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Application, Course } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils";

export function ApplicationsManager() {
  const supabase = createSupabaseBrowserClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [apps, courseResult] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("title"),
    ]);
    if (apps.error ?? courseResult.error) setToast({ type: "error", message: (apps.error ?? courseResult.error)?.message ?? "Failed to load data." });
    setApplications(apps.data ?? []);
    setCourses(courseResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const filtered = status === "all" ? applications : applications.filter((application) => application.status === status);

  async function updateApplication(applicationId: string, action: "approve_application" | "reject_application") {
    setBusyId(applicationId);
    const { error } =
      action === "approve_application"
        ? await supabase.rpc("approve_application", { application_id: applicationId })
        : await supabase.rpc("reject_application", { application_id: applicationId });
    setBusyId(null);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    setToast({ type: "success", message: action === "approve_application" ? "Application approved." : "Application rejected." });
    await loadData();
  }

  if (loading) return <LoadingState label="Loading applications..." />;

  return (
    <>
      <Toast toast={toast} onClear={clearToast} />
      <PageHeader eyebrow="Applications" title="Student applications" description="Review public course applications and approve or reject them. Approved students can then access the portal using their email-only login link." />

      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "pending", "approved", "rejected"].map((item) => (
          <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-5 py-2.5 text-label-md ${status === item ? "bg-primary text-white" : "border border-outline-variant bg-white text-on-surface-variant"}`}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No applications found" description="Change the filter or submit a public application from the landing page." icon="pending_actions" />
      ) : (
        <div className="wc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-widest text-primary">
                <tr>
                  <th className="p-5">Applicant</th>
                  <th className="p-5">Course</th>
                  <th className="p-5">Phone</th>
                  <th className="p-5">Message</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Submitted</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/70">
                {filtered.map((application) => (
                  <tr key={application.id}>
                    <td className="p-5">
                      <p className="font-bold text-on-surface">{application.full_name}</p>
                      <p className="text-body-sm text-on-surface-variant">{application.email}</p>
                    </td>
                    <td className="p-5 text-on-surface-variant">{application.course_id ? courseById.get(application.course_id)?.title ?? "Unknown" : "Not selected"}</td>
                    <td className="p-5 text-on-surface-variant">{application.phone}</td>
                    <td className="max-w-sm p-5 text-body-sm text-on-surface-variant">{application.message || "No message"}</td>
                    <td className="p-5"><StatusPill value={application.status} /></td>
                    <td className="p-5 text-body-sm text-on-surface-variant">{formatDateTime(application.created_at)}</td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button disabled={application.status !== "pending" || busyId === application.id} onClick={() => updateApplication(application.id, "approve_application")} className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-40"><Icon name="check" /></button>
                        <button disabled={application.status !== "pending" || busyId === application.id} onClick={() => updateApplication(application.id, "reject_application")} className="rounded-lg bg-error-container p-2 text-error hover:bg-red-100 disabled:opacity-40"><Icon name="close" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
