-- Team Members and Collaboration Schema

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The "team" is effectively the user account of the admin/owner
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- Team invites table
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  team_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Users can view their own team memberships" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = team_id);

CREATE POLICY "Team owners can manage members" ON public.team_members
  FOR ALL USING (auth.uid() = team_id);

-- RLS Policies for team_invites
CREATE POLICY "Team owners can manage invites" ON public.team_invites
  FOR ALL USING (auth.uid() = team_id);

CREATE POLICY "Users can view invites sent to their email" ON public.team_invites
  FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Update checklists RLS to include team access
-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Users can view their own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can create their own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can update their own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can delete their own checklists" ON public.checklists;

-- Create new RLS policies for checklists that include team access
CREATE POLICY "Users can view own or team checklists" ON public.checklists
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = checklists.user_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklists" ON public.checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or team checklists" ON public.checklists
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = checklists.user_id AND user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can delete own checklists" ON public.checklists
  FOR DELETE USING (auth.uid() = user_id);

-- Update checklist_items RLS to include team access
DROP POLICY IF EXISTS "Users can view items of their checklists" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can create items in their checklists" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can update items in their checklists" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can delete items in their checklists" ON public.checklist_items;

CREATE POLICY "Users can view items of accessible checklists" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND (
        checklists.user_id = auth.uid() OR 
        checklists.is_public = TRUE OR
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_id = checklists.user_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create items in accessible checklists" ON public.checklist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND (
        checklists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_id = checklists.user_id AND user_id = auth.uid() AND role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update items in accessible checklists" ON public.checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND (
        checklists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_id = checklists.user_id AND user_id = auth.uid() AND role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can delete items in accessible checklists" ON public.checklist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND (
        checklists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_id = checklists.user_id AND user_id = auth.uid() AND role IN ('admin', 'member')
        )
      )
    )
  );

