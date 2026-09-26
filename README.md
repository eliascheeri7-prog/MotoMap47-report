# MotoMap47 Report — offline mobile reporting app

This is Outcome 1: an offline-capable form for officers and the public to
report fire incidents. It syncs into the **same Supabase table** that the
MotoMap47 dashboard (fire-dashboard-maplibre) reads from — that shared
table is the whole integration, no direct connection between the two apps.

## One-time setup: create the shared Supabase project

1. Go to [supabase.com](https://supabase.com), sign up free, create a new project
2. In the SQL Editor, run this to create the shared table:
   ```sql
   create table incidents (
     id uuid default gen_random_uuid() primary key,
     incident_type text,
     description text,
     status text default 'active',
     severity text,
     reported_by text,
     reporter_phone text,
     lat double precision,
     lng double precision,
     created_at timestamp default now()
   );

   alter table incidents enable row level security;
   create policy "Allow public insert" on incidents for insert with check (true);
   create policy "Allow public read" on incidents for select using (true);
   ```
   The two policies let this demo app write and read without requiring
   user accounts — fine for a prototype, not for production.
3. Go to **Project Settings → API** — copy the **Project URL** and the
   **anon public key**. You'll paste these into **both** apps' `.env` files.
4. Go to **Database → Replication** and turn on real-time for the
   `incidents` table — this is what makes the dashboard update live.

## Setup this app

```bash
cd motomap47-report
npm install
```
Copy `.env.example` to `.env` and paste in the URL/key from step 3 above.
```bash
npm run dev
```
Open `http://localhost:5173/` (or whatever port it prints — if the
dashboard is already running on 5173, this will pick 5174 automatically).

## Setup the dashboard to receive it

In `fire-dashboard-maplibre`, follow the matching instructions in *its*
README to add the same `.env` values and enable live mode.

## Testing the full sync

1. Run both apps at once (two terminal windows, two ports)
2. In this app, submit a report
3. Watch it appear on the dashboard's map within a couple seconds — that's
   Supabase's real-time subscription firing
4. Turn off your Wi-Fi, submit another report — you'll see "saved on this
   device," then reconnect and watch it sync automatically

## Alerts

The dashboard shows a browser notification when a new incident arrives,
if you've granted notification permission (there's a button for that in
the dashboard header). This only works while the dashboard tab is open —
real push-when-closed notifications need a service-worker push
subscription, which is a further step beyond this prototype.
