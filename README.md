# Sun, Sand & Blossoms: IIITA Freshers 2026 Best Outfit

Next.js (App Router) + TypeScript + Tailwind + Framer Motion + Supabase.

> **Status:** the source was written without being able to install packages, so it has **not** been
> linted, type-checked, built or run. Run the checks below first and fix anything they report.

## 1. Local setup

```bash
npm install
cp .env.example .env.local     # then fill in values
npm run typecheck && npm run lint && npm run build   # verify
npm run dev                    # http://localhost:3000
```

Without Supabase variables the site still renders, `/submit` shows a "not open yet" error on submit, and
`/admin` redirects to a login page that says the backend is not configured.

## 2. Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon key (RLS blocks it from every table) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_EVENT_DATE` / `_VENUE` / `_SUBMISSION_DEADLINE` | public | Optional. Defaults: 25 October 2026, Auditorium IIIT Allahabad, 3:00 PM |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` | public | Default `iiita.ac.in` |

## 3. Supabase setup

1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/migrations/0001_init.sql`. It creates the tables, RLS policies,
   the private `submissions` storage bucket and the (unused) `judge_scores` table.
3. Authentication → Users → **Add user** for each organizer (email + password, auto-confirm).
4. Authorize them: `insert into public.admin_users (email) values ('organizer@iiita.ac.in');`
5. Authentication → disable public sign-ups (Providers → Email → "Allow new users to sign up" off).
6. Copy the URL, anon key and service-role key into `.env.local`.

## 4. Entering the admin dashboard and viewing submissions

- URL: `/admin` (locally http://localhost:3000/admin; also linked as "Organizer sign-in" in the footer).
- You are sent to `/admin/login`. Sign in with an organizer email + password created in Supabase
  (Authentication → Users) **and** added to `admin_users` (step 3 above). Any other account is refused.
- The dashboard at `/admin` lists **all submissions** (newest first) with photos, name, enrollment, branch, email, caption
  and consent. Use search and the status filter, approve/reject each entry, and see live Total/Pending/Approved/Rejected counts.
- **Export CSV** (top right) downloads every submission. You can also browse the raw table in Supabase → Table Editor → `submissions`,
  and photos in Storage → `submissions`.

## 5. How privacy is enforced

- `submissions` has RLS on; `anon` has **no** grants. Only authenticated users listed in `admin_users` can read or moderate.
- Inserts run server-side with the service role. There is no public gallery or any public endpoint that reads
  submissions back, so names, emails, enrollment numbers and photos are visible to organizers only.
- The storage bucket is private; only admins can read objects, and uploads happen only through the server.
- `/admin/*` is checked in middleware, again in each page/action/CSV route via `is_admin()`, and again by RLS.
- Duplicates are blocked by unique indexes on enrollment number and email (case-insensitive).
- Uploads are validated by size, declared type **and** magic bytes. Photos are resized in the browser to stay under host body limits (2 MB each).

## 6. Deploy (Vercel)

Import the repo, add the environment variables above, deploy. Add the production URL to Supabase
Authentication → URL Configuration.

## 7. Organizer to-do

- Edit copy, rules and limits in `src/lib/config.ts`.
- **Photography:** the hero uses original SVG botanical art because no stock photos could be fetched. To add real
  photography, drop licensed images in `public/images/` and use them in `src/components/Hero.tsx`.
- Confirm eligibility wording and judging criteria before launch.
- Add rate limiting at your host or WAF. The built-in throttle is per-instance and best-effort.

## 8. Judging & voting

Collection is separate from judging. `judgingMode` in `src/lib/config.ts` is `"off"`; the `judge_scores` table
(admin-only RLS) is ready for private scoring. Public voting is deliberately not implemented. It needs an
identity system to enforce one vote per person.

## Key files

`src/app/page.tsx` landing · `src/components/SubmitForm.tsx` 3-step form · `src/app/api/submit/route.ts` ·
`src/app/admin/*` · `src/middleware.ts` · `supabase/migrations/0001_init.sql`
