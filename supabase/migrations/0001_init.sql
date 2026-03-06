-- ============================================================
-- Profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  graduation_year int not null,
  target_industries text[] not null default '{}',
  target_companies text[] not null default '{}',
  university_name text null,
  bio text null,
  is_verified_student boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone authenticated can view profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================
-- Practice Requests
-- ============================================================
create table public.practice_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_company text not null,
  target_role text null,
  interview_stage text not null,
  practice_type text not null,
  description text null,
  duration_minutes int not null default 45,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practice_requests enable row level security;

create policy "Anyone authenticated can view practice requests"
  on public.practice_requests for select to authenticated using (true);

create policy "Users can insert own practice requests"
  on public.practice_requests for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Owners can update own practice requests"
  on public.practice_requests for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Practice Request Slots (available time windows)
-- ============================================================
create table public.practice_request_slots (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.practice_requests(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.practice_request_slots enable row level security;

create policy "Anyone authenticated can view slots"
  on public.practice_request_slots for select to authenticated using (true);

create policy "Request owner can insert slots"
  on public.practice_request_slots for insert to authenticated
  with check (
    request_id in (
      select id from public.practice_requests where user_id = auth.uid()
    )
  );

-- ============================================================
-- Practice Applications
-- ============================================================
create table public.practice_applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.practice_requests(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text null,
  selected_slot_ids uuid[] not null default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(request_id, applicant_id)
);

alter table public.practice_applications enable row level security;

create policy "Request owner and applicant can view applications"
  on public.practice_applications for select to authenticated
  using (
    applicant_id = auth.uid()
    or request_id in (
      select id from public.practice_requests where user_id = auth.uid()
    )
  );

create policy "Authenticated users can insert own applications"
  on public.practice_applications for insert to authenticated
  with check (auth.uid() = applicant_id);

create policy "Applicant can update own application"
  on public.practice_applications for update to authenticated
  using (auth.uid() = applicant_id);

create policy "Request owner can update applications"
  on public.practice_applications for update to authenticated
  using (
    request_id in (
      select id from public.practice_requests where user_id = auth.uid()
    )
  );

-- ============================================================
-- Sessions
-- ============================================================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.practice_requests(id) on delete cascade,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  guest_user_id uuid not null references public.profiles(id) on delete cascade,
  chosen_slot_id uuid null references public.practice_request_slots(id),
  starts_at timestamptz not null,
  duration_minutes int not null default 45,
  status text not null default 'scheduled',
  meeting_status text not null default 'pending',
  meeting_provider text not null default 'google_meet',
  calendar_event_id text null,
  meet_url text null,
  completed_by uuid null references public.profiles(id),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Host and guest can view sessions"
  on public.sessions for select to authenticated
  using (auth.uid() = host_user_id or auth.uid() = guest_user_id);

create policy "Participants can update sessions"
  on public.sessions for update to authenticated
  using (auth.uid() = host_user_id or auth.uid() = guest_user_id);

create policy "Service can insert sessions"
  on public.sessions for insert to authenticated
  with check (auth.uid() = host_user_id);

-- ============================================================
-- Session Messages (chat after matching)
-- ============================================================
create table public.session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.session_messages enable row level security;

create policy "Session participants can view messages"
  on public.session_messages for select to authenticated
  using (
    session_id in (
      select id from public.sessions
      where host_user_id = auth.uid() or guest_user_id = auth.uid()
    )
  );

create policy "Session participants can insert messages"
  on public.session_messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and session_id in (
      select id from public.sessions
      where host_user_id = auth.uid() or guest_user_id = auth.uid()
    )
  );

-- ============================================================
-- Session Reviews
-- ============================================================
create table public.session_reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text null,
  created_at timestamptz not null default now(),
  unique(session_id, reviewer_id, reviewee_id)
);

alter table public.session_reviews enable row level security;

create policy "Session participants can view reviews"
  on public.session_reviews for select to authenticated
  using (
    session_id in (
      select id from public.sessions
      where host_user_id = auth.uid() or guest_user_id = auth.uid()
    )
  );

create policy "Session participants can insert reviews"
  on public.session_reviews for insert to authenticated
  with check (
    auth.uid() = reviewer_id
    and session_id in (
      select id from public.sessions
      where host_user_id = auth.uid() or guest_user_id = auth.uid()
    )
  );

-- ============================================================
-- Reports
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Authenticated users can insert reports"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

-- ============================================================
-- Updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.practice_requests
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.sessions
  for each row execute function public.handle_updated_at();
