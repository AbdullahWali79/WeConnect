# WeConnect Training Portal

Full-stack Next.js App Router application connected to Supabase Auth, Supabase Database, and Row Level Security.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Vercel-ready environment variables

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

This project expects the public Supabase browser key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A current Supabase publishable key works there as well. Do not hardcode keys inside components.

## Supabase Setup

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run the migration file:

```text
supabase/migrations/20260426000000_init_weconnect.sql
```

4. Run seed data:

```text
supabase/seed.sql
```

5. In `Authentication > URL Configuration`, set:

```text
Site URL: https://your-production-domain
Redirect URL: https://your-production-domain/auth/callback
Redirect URL: http://localhost:3000/auth/callback
```

The migration creates:

- `profiles`
- `course_categories`
- `courses`
- `applications`
- `enrollments`
- `tasks`
- `task_resources`
- `submissions`
- `progress_reports`
- `completed_students`
- `completed_student_showcase` public view
- RLS policies
- Auth profile trigger
- Application approval/rejection RPCs
- Student task submission RPC
- Automatic progress recalculation triggers
- Course completion RPC

## First Admin Setup

1. Start the app locally.
2. Open `/login`.
3. Use `Student Sign Up` with the email you want as admin.
4. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where lower(email) = lower('ADMIN_EMAIL_HERE');
```

A helper file is also included:

```text
supabase/admin-setup.sql
```

Replace `ADMIN_EMAIL_HERE` before running it.

## Student Approval Flow

- Public user submits `/apply`.
- Admin approves the application from `/admin/applications`.
- Approved students use email-only access from `/login` under `Student Email Login`.
- The app sends a Supabase magic link to the approved email address.
- If the student has not been created in Auth yet, the magic link request creates the Auth user and the trigger creates the approved profile and enrollment from the application email.
- Student then lands on `/student` and sees only their own dashboard data.

## Local Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quality Commands

```bash
npm run lint
npm run build
```

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

4. Deploy.

No server-only Supabase service role key is required for the implemented approval flow. Admin creation is intentionally handled through SQL so service keys are not exposed to the app.

## Routes

Public:

- `/` landing page with live courses and completed students
- `/apply` public course application form
- `/login` admin sign in and approved-student email login

Admin:

- `/admin` dashboard stats and recent applications
- `/admin/applications` approve/reject applications
- `/admin/courses` category/course CRUD
- `/admin/students` enrolled student list
- `/admin/tasks` assign tasks and resources
- `/admin/submissions` score submissions and request revision
- `/admin/progress` progress reports
- `/admin/completions` mark course completed and publish to landing page

Student:

- `/student` assigned tasks
- `/student/tasks/[taskId]/submit` submit task work
- `/student/progress` own progress report

## Notes

- All protected routes use Supabase Auth and role checks.
- RLS is enabled on all tables.
- Public users can only read active courses/categories and insert pending applications.
- Students can only read their own profile/enrollments/tasks/resources/submissions/progress.
- Students submit tasks through the `submit_task` RPC, which validates task ownership and prevents score/feedback tampering.
- Approved student login requests are validated through the `can_request_student_access` security-definer function before a magic link is sent.
- Admins can manage all operational tables through RLS-backed policies.
