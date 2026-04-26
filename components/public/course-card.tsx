import Link from "next/link";
import type { Course } from "@/lib/supabase/types";
import { Icon } from "@/components/icon";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group wc-card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="h-2 bg-primary" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
            <Icon name="school" />
          </div>
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-fixed">{course.level ?? "Open"}</span>
        </div>
        <h3 className="text-title-lg text-on-surface">{course.title}</h3>
        <p className="mt-3 flex-1 text-body-md text-on-surface-variant">{course.description ?? "A practical WeConnect course with guided tasks and mentor review."}</p>
        <div className="mt-6 flex items-center justify-between text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><Icon name="schedule" className="text-base" /> {course.duration ?? "Self paced"}</span>
          <span className="flex items-center gap-1"><Icon name="verified" className="text-base" /> Certificate</span>
        </div>
        <Link href={`/apply?course=${course.id}`} className="wc-primary-btn mt-6 w-full">
          Apply Now
        </Link>
      </div>
    </article>
  );
}
