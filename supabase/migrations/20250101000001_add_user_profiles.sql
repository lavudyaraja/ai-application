/*
# [Create User Profiles Table and Function]
This migration creates a `profiles` table to store user-specific data that is not included in the default `auth.users` table. It also sets up a trigger to automatically create a new profile when a user signs up.

## Query Description: [This operation creates a new `profiles` table to store user data like name, theme, and settings. It is a non-destructive, structural change. An automated trigger is added to populate this table upon new user creation, ensuring data consistency between authentication and user profiles. Existing users will not have a profile created automatically by this script; this would need to be backfilled manually if required.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (requires dropping the table, trigger, and function)

## Structure Details:
- **Tables Created:**
  - `public.profiles`
- **Columns Added to `profiles`:**
  - `id` (uuid, pk, fk to auth.users)
  - `updated_at` (timestamptz)
  - `name` (text)
  - `email` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `role` (text)
  - `theme` (text)
  - `language` (text)
  - `settings` (jsonb)
  - `notifications_enabled` (boolean)
  - `subscription_plan` (text)
  - `last_active` (timestamptz)
- **Functions Created:**
  - `public.handle_new_user()`
- **Triggers Created:**
  - `on_auth_user_created` on `auth.users`

## Security Implications:
- RLS Status: Enabled for `profiles`.
- Policy Changes: Yes, new policies are created for the `profiles` table.
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: A primary key index is created on `profiles.id`.
- Triggers: A new trigger is added to `auth.users`, which will have a negligible performance impact on user creation.
- Estimated Impact: Low.
*/

-- 1. Create the profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  name text,
  email text,
  avatar_url text,
  bio text,
  "role" text default 'user'::text,
  theme text default 'system'::text,
  language text default 'en'::text,
  settings jsonb,
  notifications_enabled boolean default true,
  subscription_plan text default 'free'::text,
  last_active timestamp with time zone,

  primary key (id)
);

-- 2. Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- 3. Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- 4. Create a trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Re-affirm policies on existing tables to ensure correctness
-- These may already exist, but running them again ensures they are set correctly.

-- Policies for `conversations`
drop policy if exists "Users can insert their own conversations." on public.conversations;
create policy "Users can insert their own conversations." on public.conversations
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view their own conversations." on public.conversations;
create policy "Users can view their own conversations." on public.conversations
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own conversations." on public.conversations;
create policy "Users can update their own conversations." on public.conversations
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own conversations." on public.conversations;
create policy "Users can delete their own conversations." on public.conversations
  for delete using (auth.uid() = user_id);


-- Policies for `messages`
drop policy if exists "Users can insert their own messages." on public.messages;
create policy "Users can insert their own messages." on public.messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view messages in their conversations." on public.messages;
create policy "Users can view messages in their conversations." on public.messages
  for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id and conversations.user_id = auth.uid()
    )
  );
