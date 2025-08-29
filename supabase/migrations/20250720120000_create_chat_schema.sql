/*
          # Create Chat Schema
          This migration sets up the core tables for storing chat conversations and messages, enabling persistent chat history for users. It includes tables for conversations and their corresponding messages, with appropriate foreign keys and row-level security policies to ensure users can only access their own data.

          ## Query Description: 
          This operation creates two new tables: `conversations` and `messages`. It is a non-destructive, structural change. Existing data will not be affected as these tables are new. No backup is required for this initial setup.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by dropping the tables)

          ## Structure Details:
          - **Table `conversations`**: Stores conversation metadata.
            - `id`: Unique identifier for the conversation.
            - `user_id`: Links to the user who owns the conversation.
            - `title`: A title for the conversation.
            - `created_at`, `updated_at`: Timestamps for tracking.
          - **Table `messages`**: Stores individual chat messages.
            - `id`: Unique identifier for the message.
            - `conversation_id`: Links to the parent conversation.
            - `user_id`: Links to the user who sent the message.
            - `role`: Indicates if the message is from the 'user' or 'assistant'.
            - `content`: The text content of the message.
            - `created_at`: Timestamp for the message.

          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Policies are tied to `auth.uid()`, ensuring users can only access their own conversations and messages.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: None.
          - Estimated Impact: Low. The schema is designed for efficient querying of chat data.
          */

-- Create conversations table
CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    title text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations (id) ON DELETE CASCADE,
    CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Allow select for own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow update for own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow delete for own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Allow select for messages in own conversations" ON public.messages FOR SELECT USING (
    auth.uid() = user_id AND
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Allow insert for messages in own conversations" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Allow update for messages in own conversations" ON public.messages FOR UPDATE USING (
    auth.uid() = user_id AND
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
) WITH CHECK (
    auth.uid() = user_id AND
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Allow delete for messages in own conversations" ON public.messages FOR DELETE USING (
    auth.uid() = user_id AND
    conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
);
