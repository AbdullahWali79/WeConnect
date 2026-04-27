import Link from "next/link";
import { ApplicationForm } from "@/components/public/application-form";
import { CourseCard } from "@/components/public/course-card";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { formatDate } from "@/lib/utils";
import { getLatestNews, type AINews } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = createSupabasePublicClient();
  const [{ data: categories }, { data: courses }, { data: completedStudents }, newsData] = await Promise.all([
    supabase.from("course_categories").select("*").order("created_at", { ascending: true }),
    supabase.from("courses").select("*").eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("completed_student_showcase").select("*").order("completed_at", { ascending: false }).limit(6),
    getLatestNews(),
  ]);

  const activeCourses = courses ?? [];
  const news = (newsData as (AINews & { id: string })[]) ?? [];
  const contactPhone = "03046983794";
  const contactHref = "tel:+923046983794";
  const marketingTracks = [
    "Digital Marketing",
    "Client Hunting",
    "Web Development (WordPress)",
    "App Development",
    "MERN Stack Development",
  ];

  return (
    <main className="bg-background text-on-background">
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-container-max items-center justify-between px-5 py-4 md:px-margin-page">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Icon name="hub" />
            </div>
            <div className="text-xl font-extrabold tracking-tighter text-blue-800">WeConnect</div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
            <a className="border-b-2 border-blue-700 pb-1 text-blue-700" href="#overview">Overview</a>
            <a className="text-slate-600 transition-colors hover:text-blue-800" href="#courses">Courses</a>
            <a className="text-slate-600 transition-colors hover:text-blue-800" href="#news">News</a>
            <a className="text-slate-600 transition-colors hover:text-blue-800" href="#completed">Completed</a>
            <a className="text-slate-600 transition-colors hover:text-blue-800" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-bold text-primary md:inline-flex">Login</Link>
            <Link href="/apply" className="wc-primary-btn px-6 py-2">Apply Now</Link>
          </div>
        </div>
      </header>

      <section id="overview" className="relative isolate min-h-[760px] overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(0,51,160,0.18),transparent_32%),radial-gradient(circle_at_85%_30%,rgba(254,214,91,0.35),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f0f3ff_55%,#d8e3fb_100%)]" />
        <div className="absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-secondary-container/70 blur-3xl" />
        <div className="mx-auto grid max-w-container-max items-center gap-12 px-5 py-24 md:px-margin-page lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
              <Icon name="rocket_launch" className="text-base" /> Your skills today, your success tomorrow
            </div>
            <h1 className="max-w-[9ch] text-[clamp(3.4rem,6.5vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-primary">
              <span className="block">Training</span>
              <span className="block">Program</span>
            </h1>
            <div className="mt-4 flex max-w-2xl items-center gap-4 text-primary">
              <span className="h-px flex-1 bg-primary/25" />
              <p className="text-[clamp(1.35rem,2.5vw,2rem)] font-black uppercase tracking-[0.28em] text-primary/85">Leading To</p>
              <span className="h-px flex-1 bg-primary/25" />
            </div>
            <p className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] font-extrabold uppercase leading-none tracking-[-0.05em] text-blue-700">
              Internship
            </p>
            <p className="mt-8 max-w-[42rem] text-[clamp(1.08rem,1.8vw,1.35rem)] leading-[1.7] text-on-surface-variant">
              Learn in-demand skills and start your career through structured software house training, practical assignments,
              client-focused practice, reviews, and measurable progress.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/apply" className="wc-primary-btn px-8 py-4 text-lg shadow-lg">Enroll Now</Link>
              <a href="#courses" className="wc-secondary-btn px-8 py-4 text-lg">View Courses</a>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {marketingTracks.map((track) => (
                <div key={track} className="rounded-xl border border-primary/10 bg-white/90 px-4 py-3 text-sm font-bold text-on-surface shadow-card">
                  {track}
                </div>
              ))}
            </div>
            <div className="mt-8 flex max-w-2xl flex-col gap-4 rounded-2xl bg-secondary px-6 py-5 text-primary shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-primary/70">Limited Seats</p>
                <p className="mt-1 text-3xl font-extrabold uppercase tracking-[-0.04em]">Only 10 Students</p>
              </div>
              <a href={contactHref} className="inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-lg font-black text-white">
                <Icon name="call" /> {contactPhone}
              </a>
            </div>
          </div>
          <div className="wc-card overflow-hidden p-5">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-inner ring-1 ring-primary/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-primary/70">WeConnect</p>
                  <h2 className="mt-2 text-3xl font-extrabold uppercase leading-none tracking-[-0.05em] text-primary">Software House Training</h2>
                </div>
                <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-on-surface-variant">Duration</p>
                  <p className="mt-1 text-3xl font-extrabold leading-none text-blue-700">3 Months</p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-wide text-on-surface-variant">Program</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 rounded-2xl border border-primary/10 bg-surface-container-lowest p-5">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-primary/70">Courses</p>
                  <div className="grid gap-3">
                    {marketingTracks.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                          <Icon name="school" className="text-lg" />
                        </div>
                        <span className="font-bold text-on-surface">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-primary/10 bg-surface-container-lowest p-5">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-on-surface-variant">Certificate By</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-blue-700">WeConnect</p>
                    <p className="mt-1 font-bold uppercase tracking-wide text-on-surface">(Software House)</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-surface-container-lowest p-5">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-on-surface-variant">Career Track</p>
                    <p className="mt-2 text-lg font-extrabold leading-tight text-primary">Learn practical software house skills</p>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">Build your internship-ready portfolio through real tasks and reviews.</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-primary p-5 text-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-100">Contact</p>
                      <p className="mt-1 text-4xl font-extrabold tracking-[-0.05em]">{contactPhone}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-blue-50">
                      Learn practical skills, build confidence, get internship exposure, and launch your career.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <div className="mb-12 max-w-3xl">
            <p className="text-label-sm uppercase tracking-widest text-primary">Why WeConnect?</p>
            <h2 className="mt-3 text-headline-lg text-primary">Built for practical training operations</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["fact_check", "Reviewed Tasks", "Every student submission can be scored and returned with clear feedback."],
              ["linked_services", "Rich Resources", "Tasks support video, Google Docs, Sheets, images, GitHub, and custom links."],
              ["monitoring", "Progress Reports", "Progress updates automatically from reviewed course tasks."],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-7 shadow-card">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary"><Icon name={icon} /></div>
                <h3 className="text-title-lg text-on-surface">{title}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="bg-surface-container-low py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-label-sm uppercase tracking-widest text-primary">Course Catalog</p>
              <h2 className="mt-3 text-headline-lg text-primary">Choose your pathway</h2>
              <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">Courses are fetched from Supabase and only active courses are shown publicly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-primary px-5 py-2.5 text-label-md text-on-primary shadow-md">All</span>
              {(categories ?? []).slice(0, 4).map((category) => (
                <span key={category.id} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-label-md text-on-surface-variant">{category.name}</span>
              ))}
            </div>
          </div>
          {activeCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activeCourses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <EmptyState title="No active courses yet" description="Run the Supabase seed file or create courses from the admin dashboard." icon="school" />
          )}
        </div>
      </section>

      <section id="completed" className="bg-white py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-label-sm uppercase tracking-widest text-primary">Student Outcomes</p>
              <h2 className="mt-3 text-headline-lg text-primary">Completed students</h2>
            </div>
            <p className="max-w-xl text-body-md text-on-surface-variant">This section is populated from `completed_students` after an admin marks an enrollment completed.</p>
          </div>
          {(completedStudents ?? []).length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-card">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-surface-container-low text-label-sm uppercase tracking-widest text-primary">
                  <tr>
                    <th className="p-5">Student</th>
                    <th className="p-5">Course Pathway</th>
                    <th className="p-5">Progress</th>
                    <th className="p-5">Final Score</th>
                    <th className="p-5">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/70">
                  {(completedStudents ?? []).map((student) => (
                    <tr key={student.id}>
                      <td className="p-5 font-bold text-on-surface">{student.student_name ?? "Student"}</td>
                      <td className="p-5 text-on-surface-variant">{student.course_name ?? "Course"}</td>
                      <td className="p-5 font-bold text-primary">{student.progress_percentage ?? 100}%</td>
                      <td className="p-5 font-bold text-on-surface">{student.final_score ?? 0}</td>
                      <td className="p-5 text-on-surface-variant">{formatDate(student.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No public completions yet" description="Completed students will appear here after admin publishes a course completion." icon="workspace_premium" />
          )}
        </div>
      </section>

      <section id="news" className="bg-surface-container-lowest py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <div className="mb-10 text-center">
            <p className="text-label-sm uppercase tracking-widest text-primary">Daily Pulse</p>
            <h2 className="mt-3 text-headline-lg text-primary">Latest in AI & Tech</h2>
            <p className="mx-auto mt-3 max-w-2xl text-body-lg text-on-surface-variant">Stay updated with top AI news, refreshed daily to keep our systems active and your mind sharp.</p>
          </div>
          {news.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {news.map((item) => (
                <div key={item.id} className="wc-card group flex flex-col p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm text-on-secondary-fixed">{item.source}</span>
                    <Icon name="newspaper" className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-title-lg font-bold leading-tight text-on-surface line-clamp-2">{item.title}</h3>
                  <p className="mt-3 flex-1 text-body-md text-on-surface-variant line-clamp-3">{item.summary}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline">
                    Read Story <Icon name="arrow_forward" className="text-sm" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
              <p className="text-on-surface-variant">News is being fetched. Refresh the page in a moment.</p>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="bg-primary-container py-xxl text-white">
        <div className="mx-auto grid max-w-container-max gap-10 px-5 md:px-margin-page lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-label-sm uppercase tracking-widest text-blue-100">Admissions</p>
            <h2 className="mt-3 text-headline-lg">Start with an application</h2>
            <p className="mt-4 text-lg leading-8 text-blue-100">Submit your details, and your application will appear immediately in the admin dashboard as pending.</p>
            <div className="mt-8 space-y-4 text-blue-50">
              <a href={contactHref} className="flex items-center gap-3 text-xl font-black text-white"><Icon name="call" /> {contactPhone}</a>
              <p className="flex items-center gap-3"><Icon name="location_on" /> Remote and software house training tracks</p>
            </div>
          </div>
          <ApplicationForm courses={activeCourses} />
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-container-max flex-col gap-4 px-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-margin-page">
          <div className="font-black text-blue-900">WeConnect</div>
          <p>© 2026 WeConnect Training Portal. Contact {contactPhone} for admissions and internship training.</p>
          <div className="flex gap-4">
            <Link href="/login" className="underline hover:text-blue-600">Portal Login</Link>
            <Link href="/apply" className="underline hover:text-blue-600">Apply</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
