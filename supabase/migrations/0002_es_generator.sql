-- ============================================================
-- User Experiences (ガクチカ・経験談)
-- ============================================================
create table public.user_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,                    -- 例: 「テニスサークルで部長を務め、〇〇を成し遂げた」
  category text not null default 'other', -- 'club', 'internship', 'volunteer', 'research', 'part_time', 'other'
  description text not null,              -- 状況・課題・行動・結果 (STAR法の詳細)
  skills text[] not null default '{}',    -- 発揮した強み例: ['リーダーシップ', '課題解決']
  is_default boolean not null default false, -- ES生成時にデフォルトで使用するか
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_experiences enable row level security;

create policy "Users can view own experiences"
  on public.user_experiences for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own experiences"
  on public.user_experiences for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own experiences"
  on public.user_experiences for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own experiences"
  on public.user_experiences for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- ES Generations (生成履歴)
-- ============================================================
create table public.es_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,               -- 志望企業名
  question_text text not null,              -- 設問本文
  char_limit int not null default 400,      -- 文字数制限
  experience_ids uuid[] not null default '{}', -- 使用した user_experiences の ID 一覧
  generated_text text not null,             -- LLM が生成したテキスト
  is_starred boolean not null default false,-- お気に入り保存フラグ
  created_at timestamptz not null default now()
);

alter table public.es_generations enable row level security;

create policy "Users can view own generations"
  on public.es_generations for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.es_generations for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.es_generations for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own generations"
  on public.es_generations for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Trigger: updated_at auto-update for user_experiences
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_user_experiences_updated_at
  before update on public.user_experiences
  for each row execute procedure public.handle_updated_at();
