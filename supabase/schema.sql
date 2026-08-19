-- ==============================================================================
-- AI Voice Assistant - Unified Production Schema (7 Tables + RLS + Triggers)
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- Table 1: Profiles
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 2: Conversations
-- ------------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New Conversation',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 3: Messages
-- ------------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 4: Memories
-- ------------------------------------------------------------------------------
create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  memory text not null,
  category text default 'general' not null,
  importance integer default 1 check (importance between 1 and 5) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 5: Reminders
-- ------------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  reminder_time timestamptz not null,
  timezone text default 'UTC' not null,
  completed boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 6: Tool Executions
-- ------------------------------------------------------------------------------
create table if not exists public.tool_executions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  conversation_id uuid references public.conversations on delete set null,
  tool_name text not null,
  input jsonb default '{}'::jsonb not null,
  output jsonb default '{}'::jsonb not null,
  status text not null default 'completed' check (status in ('pending', 'running', 'completed', 'failed')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Table 7: User Settings
-- ------------------------------------------------------------------------------
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  voice text default 'alloy' not null,
  speaking_speed numeric default 1.0 check (speaking_speed >= 0.5 and speaking_speed <= 2.0) not null,
  auto_play boolean default true not null,
  memory_enabled boolean default true not null,
  theme text default 'dark' not null,
  language text default 'en' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Indexes for High Performance
-- ------------------------------------------------------------------------------
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);

create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);

create index if not exists idx_memories_user_id on public.memories(user_id);
create index if not exists idx_memories_category on public.memories(category);

create index if not exists idx_reminders_user_id on public.reminders(user_id);
create index if not exists idx_reminders_reminder_time on public.reminders(reminder_time asc);
create index if not exists idx_reminders_completed on public.reminders(completed);

create index if not exists idx_tool_executions_user_id on public.tool_executions(user_id);
create index if not exists idx_tool_executions_conversation_id on public.tool_executions(conversation_id);
create index if not exists idx_tool_executions_status on public.tool_executions(status);

create index if not exists idx_user_settings_user_id on public.user_settings(user_id);

-- ------------------------------------------------------------------------------
-- Enable Row Level Security (RLS) on ALL Tables
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.reminders enable row level security;
alter table public.tool_executions enable row level security;
alter table public.user_settings enable row level security;

-- ------------------------------------------------------------------------------
-- RLS Policies: Profiles
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RLS Policies: Conversations
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own conversations" on public.conversations;
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own conversations" on public.conversations;
create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own conversations" on public.conversations;
create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own conversations" on public.conversations;
create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS Policies: Messages (Enforce Conversation Ownership)
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view messages in own conversations" on public.messages;
create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages into own conversations" on public.messages;
create policy "Users can insert messages into own conversations"
  on public.messages for insert
  with check (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

drop policy if exists "Users can update messages in own conversations" on public.messages;
create policy "Users can update messages in own conversations"
  on public.messages for update
  using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete messages in own conversations" on public.messages;
create policy "Users can delete messages in own conversations"
  on public.messages for delete
  using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- RLS Policies: Memories
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own memories" on public.memories;
create policy "Users can view own memories"
  on public.memories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own memories" on public.memories;
create policy "Users can insert own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own memories" on public.memories;
create policy "Users can update own memories"
  on public.memories for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own memories" on public.memories;
create policy "Users can delete own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS Policies: Reminders
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own reminders" on public.reminders;
create policy "Users can view own reminders"
  on public.reminders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own reminders" on public.reminders;
create policy "Users can insert own reminders"
  on public.reminders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own reminders" on public.reminders;
create policy "Users can update own reminders"
  on public.reminders for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own reminders" on public.reminders;
create policy "Users can delete own reminders"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS Policies: Tool Executions
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own tool executions" on public.tool_executions;
create policy "Users can view own tool executions"
  on public.tool_executions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tool executions" on public.tool_executions;
create policy "Users can insert own tool executions"
  on public.tool_executions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tool executions" on public.tool_executions;
create policy "Users can update own tool executions"
  on public.tool_executions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own tool executions" on public.tool_executions;
create policy "Users can delete own tool executions"
  on public.tool_executions for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS Policies: User Settings
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own settings" on public.user_settings;
create policy "Users can delete own settings"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Automatic User Profile & Settings Initialization Trigger
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 1. Initialize Profile
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  -- 2. Initialize Default User Settings
  insert into public.user_settings (user_id, voice, speaking_speed, auto_play, memory_enabled, theme, language)
  values (
    new.id,
    'alloy',
    1.0,
    true,
    true,
    'dark',
    'en'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();
