import Link from "next/link";
import { ApplicationForm } from "@/components/public/application-form";
import { CourseCard } from "@/components/public/course-card";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { formatDate } from "@/lib/utils";
import { getLatestNews, type AINews } from "@/lib/news";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  FloatingOrbs,
  GradientText,
  ScrollProgress,
} from "@/components/public/animations";
import { PromoPopup } from "@/components/public/promo-popup";

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
  const workflowSteps = [
    "Student submits a course application",
    "Admin reviews and approves enrollment",
    "Approved student creates account and signs in",
    "Tasks are assigned with learning resources",
    "Submission is reviewed with score and feedback",
    "Progress updates automatically until completion",
  ];

  return (
    <main className="bg-background text-on-background">
      <ScrollProgress />
      <PromoPopup context="landing" />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-container-max items-center justify-between px-5 py-4 md:px-margin-page">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
              <Icon name="hub" />
            </div>
            <div className="text-xl font-extrabold tracking-tighter text-[#0a2363]">
              WeConnect<span className="text-primary">-Inovation</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
            <a className="border-b-2 border-blue-700 pb-1 text-blue-700" href="#overview">Overview</a>
            <a className="text-[#31446f] transition-colors hover:text-[#0a2363]" href="#courses">Courses</a>
            <a className="text-[#31446f] transition-colors hover:text-[#0a2363]" href="#news">News</a>
            <a className="text-[#31446f] transition-colors hover:text-[#0a2363]" href="#completed">Completed</a>
            <a className="text-[#31446f] transition-colors hover:text-[#0a2363]" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-bold text-primary transition hover:text-primary-container md:inline-flex">
              Login
            </Link>
            <Link href="/apply" className="wc-primary-btn px-6 py-2 shadow-glow transition-all hover:shadow-glow-lg">
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative isolate min-h-[840px] overflow-hidden bg-surface-container-lowest">
        <FloatingOrbs />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(0,51,160,0.12),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(254,214,91,0.25),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f0f3ff_55%,#d8e3fb_100%)]" />

        <div className="mx-auto grid max-w-container-max items-center gap-12 px-5 py-24 md:px-margin-page lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div>
            <FadeIn delay={0}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-primary/25">
                <Icon name="rocket_launch" className="text-base" /> Your skills today, your success tomorrow
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="max-w-[10ch] text-[clamp(3.4rem,6.5vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-primary">
                <span className="block">Training</span>
                <span className="block">Program</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-4 flex max-w-2xl items-center gap-4 text-primary">
                <span className="h-px flex-1 bg-primary/25" />
                <p className="text-[clamp(1.35rem,2.5vw,2rem)] font-black uppercase tracking-[0.28em] text-primary/85">
                  Leading To
                </p>
                <span className="h-px flex-1 bg-primary/25" />
              </div>
            </FadeIn>

            <StaggerContainer className="mt-6 space-y-3" staggerDelay={0.2}>
              {/* Stage 1: Internship */}
              <StaggerItem>
                <div className="group flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                    <Icon name="workspace_premium" className="text-lg" />
                  </div>
                  <p className="text-[clamp(2.2rem,4vw,3.8rem)] font-extrabold uppercase leading-none tracking-[-0.05em]">
                    <GradientText>Internship</GradientText>
                  </p>
                </div>
              </StaggerItem>

              {/* Connector */}
              <div className="ml-5 flex h-6 w-0.5 bg-gradient-to-b from-primary to-primary/30" />

              {/* Stage 2: Paid Internship */}
              <StaggerItem>
                <div className="group flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/80 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
                    <Icon name="payments" className="text-lg" />
                  </div>
                  <p className="text-[clamp(1.8rem,3.5vw,3.2rem)] font-extrabold uppercase leading-none tracking-[-0.04em] text-primary/80 transition-colors group-hover:text-primary">
                    Paid Internship
                  </p>
                </div>
              </StaggerItem>

              {/* Connector */}
              <div className="ml-5 flex h-6 w-0.5 bg-gradient-to-b from-primary/50 to-secondary/50" />

              {/* Stage 3: Job 99% Guarantee */}
              <StaggerItem>
                <div className="group flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-secondary/30 transition-all duration-300 group-hover:scale-110 animate-pulse-glow">
                    <Icon name="verified" className="text-lg" />
                  </div>
                  <p className="text-[clamp(1.6rem,3vw,2.8rem)] font-extrabold uppercase leading-none tracking-[-0.03em] text-primary/60">
                    Job{" "}
                    <span className="relative inline-block text-secondary">
                      <span className="relative z-10">99%</span>
                      <span className="absolute inset-0 -z-10 animate-pulse-glow rounded-lg bg-secondary/10" />
                    </span>{" "}
                    <span className="relative">
                      Guarantee
                      <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-x" />
                    </span>
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <p className="mt-8 max-w-[42rem] text-[clamp(1.08rem,1.8vw,1.35rem)] leading-[1.7] text-on-surface-variant">
                Learn in-demand skills and start your career through structured software house training, practical assignments,
                client-focused practice, reviews, and measurable progress.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/apply" className="wc-primary-btn px-8 py-4 text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-glow-lg">
                  Enroll Now
                </Link>
                <a href="#courses" className="wc-secondary-btn px-8 py-4 text-lg transition-all hover:bg-primary/5 hover:shadow-md">
                  View Courses
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
                {marketingTracks.map((track) => (
                  <div
                    key={track}
                    className="group flex items-center gap-3 rounded-xl border border-primary/10 bg-white/90 px-4 py-3 text-sm font-bold text-on-surface shadow-card transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      ✓
                    </span>
                    {track}
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <div className="mt-8 flex max-w-2xl flex-col gap-4 rounded-2xl bg-secondary px-6 py-5 text-primary shadow-lg shadow-secondary/20 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-primary/70">Limited Seats</p>
                  <p className="mt-1 text-3xl font-extrabold uppercase tracking-[-0.04em]">Only 10 Students</p>
                </div>
                <a
                  href={contactHref}
                  className="inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition-all hover:shadow-glow hover:scale-105"
                >
                  <Icon name="call" /> {contactPhone}
                </a>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} direction="left">
            <div className="wc-card animate-float overflow-hidden p-5 shadow-card-hover">
              <div className="rounded-[1.75rem] bg-white p-6 shadow-inner ring-1 ring-primary/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-primary/70">WeConnect-Inovation</p>
                    <h2 className="mt-2 text-2xl font-extrabold uppercase leading-none tracking-[-0.05em] text-primary">
                      Training → Job
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-right shadow-inner">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-on-surface-variant">Duration</p>
                    <p className="mt-1 text-3xl font-extrabold leading-none text-blue-700">3 Months</p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-wide text-on-surface-variant">Program</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-3 rounded-2xl border border-primary/10 bg-surface-container-lowest p-5">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-primary/70">Platform Workflow</p>
                    <div className="grid gap-3">
                      {workflowSteps.map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md hover:-translate-x-0.5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-glow">
                            <span className="text-sm font-black">{index + 1}</span>
                          </div>
                          <span className="font-bold text-on-surface">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-primary/10 bg-surface-container-lowest p-5 transition-all hover:shadow-md hover:border-primary/20">
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-on-surface-variant">Approval Flow</p>
                      <p className="mt-2 text-lg font-extrabold leading-tight text-blue-700">Application first</p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        Student access starts only after admin approval, matching the real onboarding flow used in this portal.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-surface-container-lowest p-5 transition-all hover:shadow-md hover:border-primary/20">
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-on-surface-variant">Progress System</p>
                      <p className="mt-2 text-lg font-extrabold leading-tight text-primary">Review-driven growth</p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        Tasks, submissions, scores, and completion records stay connected across the whole training cycle.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-primary p-5 text-white shadow-lg shadow-primary/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-100">Contact</p>
                        <p className="mt-1 text-4xl font-extrabold tracking-[-0.05em]">{contactPhone}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-blue-50 backdrop-blur-sm">
                        Training → Internship → Paid Internship → Job 99%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden border-y border-outline-variant/30 bg-white py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,33,110,0.03),transparent_70%)]" />
        <div className="relative mx-auto max-w-container-max px-5 md:px-margin-page">
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.15}>
            {[
              { value: 500, suffix: "+", label: "Students Trained" },
              { value: 25, suffix: "+", label: "Expert Mentors" },
              { value: 98, suffix: "%", label: "Success Rate" },
              { value: 10, suffix: "+", label: "Industry Partners" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight text-primary">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <FadeIn>
            <div className="mb-12 max-w-3xl">
              <div className="wc-section-label mb-4">
                <Icon name="auto_awesome" className="text-sm" /> Why WeConnect-Inovation?
              </div>
              <h2 className="text-headline-lg text-primary">Built for practical training operations</h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            {[
              ["fact_check", "Reviewed Tasks", "Every student submission can be scored and returned with clear feedback."],
              ["linked_services", "Rich Resources", "Tasks support video, Google Docs, Sheets, images, GitHub, and custom links."],
              ["monitoring", "Progress Reports", "Progress updates automatically from reviewed course tasks."],
            ].map(([icon, title, text]) => (
              <StaggerItem key={title}>
                <div className="group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-7 shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner-light transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-glow">
                    <Icon name={icon} />
                  </div>
                  <h3 className="text-title-lg text-on-surface transition-colors group-hover:text-primary">{title}</h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="relative bg-surface-container-low py-xxl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,51,160,0.05),transparent_50%)]" />
        <div className="relative mx-auto max-w-container-max px-5 md:px-margin-page">
          <FadeIn>
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="wc-section-label mb-4">
                  <Icon name="school" className="text-sm" /> Course Catalog
                </div>
                <h2 className="text-headline-lg text-primary">Choose your pathway</h2>
                <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
                  Courses are fetched from Supabase and only active courses are shown publicly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-primary px-5 py-2.5 text-label-md text-on-primary shadow-md shadow-primary/20">
                  All
                </span>
                {(categories ?? []).slice(0, 4).map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-label-md text-on-surface-variant transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {activeCourses.length > 0 ? (
            <StaggerContainer className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" staggerDelay={0.1}>
              {activeCourses.map((course) => (
                <StaggerItem key={course.id}>
                  <CourseCard course={course} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <FadeIn>
              <EmptyState
                title="No active courses yet"
                description="Run the Supabase seed file or create courses from the admin dashboard."
                icon="school"
              />
            </FadeIn>
          )}
        </div>
      </section>

      {/* Completed Students Section */}
      <section id="completed" className="bg-white py-xxl">
        <div className="mx-auto max-w-container-max px-5 md:px-margin-page">
          <FadeIn>
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="wc-section-label mb-4">
                  <Icon name="workspace_premium" className="text-sm" /> Student Outcomes
                </div>
                <h2 className="text-headline-lg text-primary">Completed students</h2>
              </div>
              <p className="max-w-xl text-body-md text-on-surface-variant">
                This section is populated from `completed_students` after an admin marks an enrollment completed.
              </p>
            </div>
          </FadeIn>

          {(completedStudents ?? []).length > 0 ? (
            <FadeIn>
              <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-card transition-shadow hover:shadow-card-hover">
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
                  <tbody className="divide-y divide-outline-variant/50">
                    {(completedStudents ?? []).map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-surface-container-lowest/80"
                      >
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
            </FadeIn>
          ) : (
            <FadeIn>
              <EmptyState
                title="No public completions yet"
                description="Completed students will appear here after admin publishes a course completion."
                icon="workspace_premium"
              />
            </FadeIn>
          )}
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="relative bg-surface-container-lowest py-xxl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(254,214,91,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-container-max px-5 md:px-margin-page">
          <FadeIn>
            <div className="mb-10 text-center">
              <div className="wc-section-label mx-auto mb-4">
                <Icon name="newspaper" className="text-sm" /> Daily Pulse
              </div>
              <h2 className="text-headline-lg text-primary">Latest in AI & Tech</h2>
              <p className="mx-auto mt-3 max-w-2xl text-body-lg text-on-surface-variant">
                Stay updated with top AI news, refreshed daily to keep our systems active and your mind sharp.
              </p>
            </div>
          </FadeIn>

          {news.length > 0 ? (
            <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
              {news.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="wc-card group flex flex-col p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-1">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm text-on-secondary-fixed">
                        {item.source}
                      </span>
                      <Icon
                        name="newspaper"
                        className="text-primary opacity-20 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="text-title-lg font-bold leading-tight text-on-surface line-clamp-2 transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-body-md text-on-surface-variant line-clamp-3">{item.summary}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-3"
                    >
                      Read Story <Icon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <FadeIn>
              <div className="rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <p className="text-on-surface-variant">News is being fetched. Refresh the page in a moment.</p>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative overflow-hidden bg-primary-container py-xxl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-white/5 blur-[100px]" />
        <div className="relative mx-auto grid max-w-container-max gap-10 px-5 md:px-margin-page lg:grid-cols-[0.85fr_1.15fr]">
          <FadeIn direction="right">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-label-sm uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                <Icon name="send" className="text-sm" /> Admissions
              </div>
              <h2 className="text-headline-lg">Start with an application</h2>
              <p className="mt-4 text-lg leading-8 text-blue-100">
                Submit your details, and your application will appear immediately in the admin dashboard as pending.
              </p>
              <div className="mt-8 space-y-4 text-blue-50">
                <a
                  href={contactHref}
                  className="group flex items-center gap-3 text-xl font-black text-white transition-all hover:gap-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                    <Icon name="call" />
                  </span>
                  {contactPhone}
                </a>
                <p className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Icon name="location_on" />
                  </span>
                  Remote and software house training tracks
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.2}>
            <ApplicationForm courses={activeCourses} />
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-outline-variant/30 bg-white py-8">
        <div className="mx-auto flex max-w-container-max flex-col gap-4 px-5 text-sm text-[#31446f] md:flex-row md:items-center md:justify-between md:px-margin-page">
          <div className="font-black text-[#081735]">
            WeConnect<span className="text-primary">-Inovation</span>
          </div>
          <p>© 2026 WeConnect-Inovation Training Portal. Contact {contactPhone} for admissions and internship training.</p>
          <div className="flex gap-4">
            <Link href="/login" className="font-bold underline transition hover:text-blue-600">
              Portal Login
            </Link>
            <Link href="/apply" className="font-bold underline transition hover:text-blue-600">
              Apply
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
