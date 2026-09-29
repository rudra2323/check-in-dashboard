# Check-In Desk

A real-time check-in dashboard for physician events, built with Next.js (App Router), Tailwind CSS, and Supabase.

## What it does

- One toggle at the top switches between your two events — **Liaison Lunch** and **Speed Mentoring** — each with its own roster and fields.
- **Liaison Lunch** fields: name (all "Dr."), designated seat (their one home table/seat), rotation tables (the tables they circulate through).
- **Speed Mentoring** fields: name, specialty, specialty table.
- Both events also carry: a free-text **descriptor** (notes to identify someone later — "navy blazer, glasses"), an optional **photo**, a check-in flag, and a **thank-you card** flag.
- The list sorts so **unchecked-in physicians stay at the top** and **checked-in ones sink to the bottom**, re-sorting instantly on every device via Supabase Realtime.
- A **Give card** toggle per row, tracked separately from check-in, so you can mark thank-you cards as distributed in real time without affecting sort order.
- **Add physician** form for last-minute arrivals — pick the event, fill in the fields, optionally attach a photo.
- Search across name, specialty, table, and descriptor.
- Placeholder seed data for both events (6 liaisons, 6 speed-mentoring physicians) — replace with your real roster once you run the schema.

## About the photo feature

Supabase includes file storage (Storage buckets) alongside its database. The schema below creates a `physician-photos` bucket; the Add Physician form uploads there and stores the resulting public URL on the row. Photos are more sensitive than name/specialty — the bucket is public/open here to match the rest of this demo's permissive setup, but restrict it (private bucket + signed URLs, or staff auth) before using this with real attendee photos at a real event.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the `physicians` table, enables Realtime, sets permissive RLS policies for this demo, creates the photo storage bucket, and and creates the photo storage bucket. Then open a second query, paste `supabase/roster.sql`, and run it to load your real Liaison Lunch and Speed Mentoring rosters.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.

> The seed data's table/seat numbers are illustrative placeholders — swap in your real roster (via SQL or the Add Physician form) once you have it.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Open it in two tabs/devices and check someone in on one — the other updates instantly.

## Project structure

```
app/
  layout.js          Root layout, fonts, metadata
  page.js             Entry point, renders <Dashboard />
  globals.css          Tailwind entry
components/
  Dashboard.jsx        Data loading, realtime subscription, event toggle, sorting, search
  AttendeeRow.jsx       One row: avatar, event fields, descriptor, check-in + thank-you toggle
  AddAttendeeForm.jsx   Modal form for adding a physician to either event, with photo upload
lib/
  supabaseClient.js     Supabase client + storage bucket name
supabase/
  schema.sql            Table, indexes, RLS policies, storage bucket, seed data
```

## Notes

- A physician attending both events gets two separate rows (one per event_type), since the fields differ between them.
- Check-in and thank-you-card updates are optimistic (the UI updates instantly) and reconciled by both the direct response and the Realtime broadcast, so it stays correct if two people tap at once.
- Before deploying, run `npm audit` — the pinned dependency versions are current as of writing, but Next.js and its dependencies ship frequent security patches worth picking up.

## 4. Share it with your team (deploy to Vercel)

1. Push this folder to a GitHub repo (`.env.local` is gitignored, so your keys stay out of it).
2. Go to vercel.com, sign in with GitHub, click **Add New → Project**, and import the repo.
3. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `EVENT_PASSCODE`.
4. Click **Deploy**. You get a link like `https://checkin-dashboard.vercel.app`. Send it to every volunteer; all devices stay in sync live.

With `EVENT_PASSCODE` set, the browser asks for a login once: any username, passcode as the password.
