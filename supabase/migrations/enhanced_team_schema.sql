-- Enhanced Team Members and Collaboration Schema
-- Run this migration in your Supabase SQL Editor

-- ============================================
-- 1. ENHANCED TEAM_MEMBERS TABLE
-- ============================================

-- Drop old table if exists (backup data first if needed)
DROP TABLE IF EXISTS public.team_members CASCADE;

CREATE TABLE public.team_members (
  -- Primary Key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Team relationship (team_id is the owner's user_id)
  team_id UUID NOT NULL,
  
  -- Role management with owner role added
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  
  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, team_id)
);

-- Indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_invited_by ON team_members(invited_by);

-- ============================================
-- 2. ENHANCED TEAM_INVITES TABLE
-- ============================================

-- Drop old table if exists
DROP TABLE IF EXISTS public.team_invites CASCADE;

CREATE TABLE public.team_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Invite details
  email TEXT NOT NULL,
  team_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  
  -- Security token
  token TEXT NOT NULL UNIQUE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  
  -- Inviter info
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate pending invites
  UNIQUE(email, team_id, status)
);

-- Indexes
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_team_invites_status ON team_invites(status);

-- ============================================
-- 3. AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Trigger for team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at 
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for team_invites
DROP TRIGGER IF EXISTS update_team_invites_updated_at ON team_invites;
CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON team_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can view invites sent to their email" ON public.team_invites;

-- ============================================
-- TEAM_MEMBERS POLICIES
-- ============================================

-- Policy 1: Users can view members in teams they belong to
CREATE POLICY "Users can view team members"
ON public.team_members FOR SELECT
USING (
  -- User is a member of this team
  team_id IN (
    SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
  )
  OR
  -- User is the team owner (team_id = their user_id)
  team_id = auth.uid()
);

-- Policy 2: Team owners and admins can insert new members
CREATE POLICY "Admins can insert team members"
ON public.team_members FOR INSERT
WITH CHECK (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_members.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- Policy 3: Team owners and admins can update members (but not elevate beyond their role)
CREATE POLICY "Admins can update team members"
ON public.team_members FOR UPDATE
USING (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_members.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- Policy 4: Team owners and admins can delete members
CREATE POLICY "Admins can delete team members"
ON public.team_members FOR DELETE
USING (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_members.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- ============================================
-- TEAM_INVITES POLICIES
-- ============================================

-- Policy 1: Team owners and admins can view invites for their team
CREATE POLICY "Team admins can view invites"
ON public.team_invites FOR SELECT
USING (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_invites.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
  OR
  -- User can see invites sent to their email
  email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
);

-- Policy 2: Team owners and admins can create invites
CREATE POLICY "Team admins can create invites"
ON public.team_invites FOR INSERT
WITH CHECK (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_invites.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- Policy 3: Team owners and admins can update invites (cancel, etc)
CREATE POLICY "Team admins can update invites"
ON public.team_invites FOR UPDATE
USING (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_invites.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- Policy 4: Team owners and admins can delete invites
CREATE POLICY "Team admins can delete invites"
ON public.team_invites FOR DELETE
USING (
  -- User is the team owner
  team_id = auth.uid()
  OR
  -- User is an admin of this team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_id = team_invites.team_id
    AND tm.role IN ('owner', 'admin')
    AND tm.status = 'active'
  )
);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get user's role in a team
CREATE OR REPLACE FUNCTION public.get_user_team_role(p_user_id UUID, p_team_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if user is the team owner
  IF p_user_id = p_team_id THEN
    RETURN 'owner';
  END IF;
  
  -- Check team_members table
  SELECT role INTO v_role
  FROM team_members
  WHERE user_id = p_user_id AND team_id = p_team_id AND status = 'active';
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage team
CREATE OR REPLACE FUNCTION public.can_manage_team(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_team_role(p_user_id, p_team_id);
  RETURN v_role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can edit in team
CREATE OR REPLACE FUNCTION public.can_edit_in_team(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_team_role(p_user_id, p_team_id);
  RETURN v_role IN ('owner', 'admin', 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. UPDATE EXISTING POLICIES FOR TEAM ACCESS
-- ============================================

-- Update profiles policy to allow viewing team member profiles
DROP POLICY IF EXISTS "Users can view team member profiles" ON public.profiles;
CREATE POLICY "Users can view team member profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR
    id IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
    OR
    id IN (
      SELECT tm.user_id FROM team_members tm WHERE tm.team_id = auth.uid()
    )
  );

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.team_members TO authenticated;
GRANT INSERT ON public.team_members TO authenticated;
GRANT UPDATE ON public.team_members TO authenticated;
GRANT DELETE ON public.team_members TO authenticated;

GRANT SELECT ON public.team_invites TO authenticated;
GRANT INSERT ON public.team_invites TO authenticated;
GRANT UPDATE ON public.team_invites TO authenticated;
GRANT DELETE ON public.team_invites TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_team_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_team TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_in_team TO authenticated;

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.team_members IS 'Stores team membership relationships with role-based access';
COMMENT ON TABLE public.team_invites IS 'Stores pending team invitations';
COMMENT ON FUNCTION public.get_user_team_role IS 'Returns the role of a user in a specific team';
COMMENT ON FUNCTION public.can_manage_team IS 'Checks if a user has admin/owner privileges in a team';
COMMENT ON FUNCTION public.can_edit_in_team IS 'Checks if a user can edit content in a team';

