/*
  # [Operation Name]
  Create User Profiles and Solidify Security Policies

  ## Query Description: [This script creates a new 'profiles' table to store detailed user information and links it to the authentication system. It also ensures that the security policies for conversations and messages are correctly configured to allow users to save their chat history. A trigger is added to automatically create a profile for new sign-ups. This is a foundational change for adding user profile features.]

  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Medium"]
  - Requires-Backup: [true]
  - Reversible: [false]

  ## Structure Details:
  - Tables Created: `profiles`
  - Tables Altered: `conversations`, `messages` (RLS policies)
  - Functions Created: `handle_new_user`
  - Triggers Created: `on_auth_user_created`

  ## Security Implications:
  - RLS Status: [Enabled]
  - Policy Changes: [Yes]
  - Auth Requirements: [Requires authenticated users for all operations]

  ## Performance Impact:
  - Indexes: [Primary key index on `profiles.id`]
  - Triggers: [Adds a trigger on `auth.users` table]
  - Estimated Impact: [Low. The trigger is lightweight and runs only on user creation.]
*/

-- 1. Create the 'profiles' table to store user data
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  bio text,
  role text DEFAULT 'user'::text,
  theme text DEFAULT 'system'::text,
  language text DEFAULT 'en'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  notifications_enabled boolean DEFAULT true,
  subscription_plan text DEFAULT 'free'::text,
  last_active timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Add comments to the new table and columns for clarity
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';
COMMENT ON COLUMN public.profiles.id IS 'References the user in auth.users.';

-- 3. Enable Row Level Security (RLS) for the 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the 'profiles' table
-- Users can view their own profile.
CREATE POLICY "Allow individual user access to their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile.
CREATE POLICY "Allow individual user to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Create a function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- 6. Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Re-verify and ensure correct RLS policies for existing tables
-- This ensures users can read and write their own conversations and messages, fixing the save error.

-- Policies for 'conversations'
DROP POLICY IF EXISTS "Users can view their own conversations." ON public.conversations;
CREATE POLICY "Users can view their own conversations."
ON public.conversations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create new conversations." ON public.conversations;
CREATE POLICY "Users can create new conversations."
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations." ON public.conversations;
CREATE POLICY "Users can delete their own conversations."
ON public.conversations FOR DELETE
USING (auth.uid() = user_id);

-- Policies for 'messages'
DROP POLICY IF EXISTS "Users can view their own messages." ON public.messages;
CREATE POLICY "Users can view their own messages."
ON public.messages FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create new messages." ON public.messages;
CREATE POLICY "Users can create new messages."
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = user_id);
