import Link from "next/link";
import { ApplicationForm } from "@/components/public/application-form";
import { Icon } from "@/components/icon";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  const supabase = createSupabasePublicClient();
  const { data: courses } = await supabase.from("courses").select("*").eq("status", "active").order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,51,160,0.18),transparent_34%),linear-gradient(135deg,#ffffff,#f0f3ff_60%,#d8e3fb)] px-5 py-8 md:px-margin-page">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-label-md text-primary">
          <Icon name="arrow_back" className="text-lg" /> Back to WeConnect
        </Link>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl bg-primary p-8 text-white shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
              <Icon name="assignment" />
            </div>
            <p className="mt-10 text-label-sm uppercase tracking-widest text-blue-100">Student Application</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight">Apply for a practical course pathway.</h1>
            <p className="mt-5 text-lg leading-8 text-blue-100">Your application will be stored in Supabase, reviewed by admin, and used to create your enrollment after approval.</p>
            <div className="mt-10 grid gap-4">
              {["Submit details", "Admin approves", "Create student login", "Start assigned tasks"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-sm font-black text-on-secondary-fixed">{index + 1}</span>
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </section>
          <ApplicationForm courses={courses ?? []} selectedCourseId={course} />
        </div>
      </div>
    </main>
  );
}
