-- WARNING: LEGACY FILE - DO NOT EXECUTE.
-- The authoritative schema is supabase/migrations/0001 through 0009.
-- This file is retained only to document the earlier prototype model.
-- It conflicts with the current role, member and payment column names.

-- Supabase Structure for Diving Ecology Education Frosta
-- This file contains table creation scripts and Row Level Security (RLS) policies.

-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------------
-- 1. PROFILES
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  language text DEFAULT 'no',
  role text DEFAULT 'guest' CHECK (role IN ('admin', 'board', 'member', 'volunteer', 'guest')),
  membership_status text DEFAULT 'pending' CHECK (membership_status IN ('active', 'pending', 'suspended', 'removed')),
  created_at timestamp WITH TIME ZONE DEFAULT now(),
  updated_at timestamp WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
-- Admin and board can view all profiles
CREATE POLICY "Admin and board can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin and board can update profiles
CREATE POLICY "Admin and board can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );

-- Users can update some fields on their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-----------------------------------------------------------
-- 2. MEMBERS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  joined_at date,
  membership_status text CHECK (membership_status IN ('active', 'pending', 'suspended', 'removed')),
  organization_role text,
  gdpr_consent boolean DEFAULT false,
  notes text,
  created_at timestamp WITH TIME ZONE DEFAULT now(),
  updated_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and board can manage members" ON public.members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );

CREATE POLICY "Members can view their own member record" ON public.members
  FOR SELECT USING (
    profile_id = auth.uid()
  );


-----------------------------------------------------------
-- 3. MEMBERSHIP_FEES
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_fees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  year integer,
  amount numeric,
  paid_amount numeric DEFAULT 0,
  status text CHECK (status IN ('paid', 'unpaid', 'partially_paid', 'exempt')),
  paid_at date,
  payment_method text,
  admin_comment text,
  created_at timestamp WITH TIME ZONE DEFAULT now(),
  updated_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.membership_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and board can manage fees" ON public.membership_fees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );

CREATE POLICY "Members can view their own fees" ON public.membership_fees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members WHERE members.id = membership_fees.member_id AND members.profile_id = auth.uid())
  );


-----------------------------------------------------------
-- 4. DOCUMENTS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text,
  language text,
  visibility text CHECK (visibility IN ('public', 'members', 'board')),
  file_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents visible based on role" ON public.documents
  FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'members' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board', 'member'))) OR
    (visibility = 'board' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board')))
  );

CREATE POLICY "Admin and board can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );


-----------------------------------------------------------
-- 5. ANNOUNCEMENTS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  body text NOT NULL,
  language text,
  category text,
  visibility text CHECK (visibility IN ('public', 'members', 'board')),
  published_at timestamp WITH TIME ZONE DEFAULT now(),
  expires_at timestamp WITH TIME ZONE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements visible based on role" ON public.announcements
  FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'members' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board', 'member'))) OR
    (visibility = 'board' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board')))
  );

CREATE POLICY "Admin and board can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );


-----------------------------------------------------------
-- 6. EVENTS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  event_type text,
  visibility text CHECK (visibility IN ('public', 'members', 'board')),
  max_participants integer,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events visible based on role" ON public.events
  FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'members' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board', 'member'))) OR
    (visibility = 'board' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board')))
  );

CREATE POLICY "Admin and board can manage events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );


-----------------------------------------------------------
-- 7. EVENT_PARTICIPANTS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  status text CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and board can manage event participants" ON public.event_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );

CREATE POLICY "Members can view and manage their own participation" ON public.event_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.members WHERE members.id = event_participants.member_id AND members.profile_id = auth.uid())
  );


-----------------------------------------------------------
-- 8. PROJECTS
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  goal text,
  target_group text,
  status text CHECK (status IN ('idea', 'preparation', 'submitted', 'funded', 'active', 'completed', 'reported')),
  budget numeric,
  funding_source text,
  partners text,
  responsible_person text,
  created_at timestamp WITH TIME ZONE DEFAULT now(),
  updated_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects visible to members" ON public.projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board', 'member'))
  );

CREATE POLICY "Admin and board can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );


-----------------------------------------------------------
-- 9. MESSAGES
-----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject text,
  body text NOT NULL,
  category text,
  status text CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own messages" ON public.messages
  FOR ALL USING (
    sender_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'board'))
  );
