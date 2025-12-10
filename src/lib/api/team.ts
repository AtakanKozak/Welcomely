import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'
import { clearWorkspaceCache, getOrCreateDefaultWorkspace } from '@/lib/workspace'
import type {
  WorkspaceMemberWithProfile,
  WorkspaceInvite,
  WorkspaceInviteWithInviter,
  WorkspaceRole,
  InviteRole,
  Workspace,
} from '@/types/database'

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const INVITE_TIMEOUT_MS = 12_000

function assertBaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error('Supabase URL is not configured. Please set VITE_SUPABASE_URL.')
  }
  return url
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeout?: number } = {}
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), init.timeout ?? INVITE_TIMEOUT_MS)

  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    const json = await response.json().catch(() => ({}))

    // Debug log
    console.log('[invite-member] response', {
      url: typeof input === 'string' ? input : input.toString(),
      status: response.status,
      ok: response.ok,
      body: json,
    })

    if (!response.ok) {
      const message = json?.error || json?.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return json
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Invitation request timed out. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================
// WORKSPACE MEMBERS API
// ============================================

/**
 * Get all members for the active workspace
 */
export async function getTeamMembers(): Promise<WorkspaceMemberWithProfile[]> {
  const { workspaceId } = await getOrCreateDefaultWorkspace()

  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      inviter:invited_by (
        id,
        full_name,
        email
      )
    `)
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WorkspaceMemberWithProfile[]
}

/**
 * Get user's role in a specific workspace
 */
export async function getUserTeamRole(workspaceId: string): Promise<WorkspaceRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check workspace_members table
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .single()

  if (error || !data) return null
  return data.role as WorkspaceRole
}

/**
 * Get current user's role in the active workspace
 */
export async function getCurrentUserRole(): Promise<WorkspaceRole> {
  const { workspaceId } = await getOrCreateDefaultWorkspace()
  return (await getUserTeamRole(workspaceId)) ?? 'owner'
}

/**
 * Update a workspace member's role
 */
export async function updateMemberRole(memberId: string, newRole: InviteRole): Promise<void> {
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) throw error
}

/**
 * Suspend a workspace member (soft delete)
 */
export async function suspendTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'suspended' })
    .eq('id', memberId)

  if (error) throw error
}

/**
 * Reactivate a suspended workspace member
 */
export async function reactivateTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'active' })
    .eq('id', memberId)

  if (error) throw error
}

/**
 * Remove a workspace member (hard delete)
 */
export async function removeTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// WORKSPACE INVITES API
// ============================================

/**
 * Get all pending invites for workspaces current user can manage
 */
export async function getTeamInvites(): Promise<WorkspaceInviteWithInviter[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Determine workspaces current user can manage (owner or admin)
  const manageableWorkspaceIds = new Set<string>()

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  memberships
    ?.filter((m) => m.role === 'owner' || m.role === 'admin')
    .forEach((m) => manageableWorkspaceIds.add(m.workspace_id))

  if (manageableWorkspaceIds.size === 0) {
    // Ensure default workspace is available and included
    const { workspaceId } = await getOrCreateDefaultWorkspace()
    manageableWorkspaceIds.add(workspaceId)
  }

  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select(`
      *,
      inviter:invited_by (
        id,
        full_name,
        email
      )
    `)
    .in('workspace_id', Array.from(manageableWorkspaceIds))
    .eq('status', 'pending')
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WorkspaceInviteWithInviter[]
}

/**
 * Get invites sent to the current user's email
 */
export async function getMyInvites(): Promise<WorkspaceInvite[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('email', user.email)
    .eq('status', 'pending')
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WorkspaceInvite[]
}

/**
 * Invite a workspace member - creates a local invite record
 * For full email integration, use the Edge Function
 */
export async function inviteTeamMember(
  email: string, 
  role: InviteRole = 'member'
): Promise<WorkspaceInvite> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { workspaceId } = await getOrCreateDefaultWorkspace()

  // Prevent duplicate pending invites
  const { data: existingInvite } = await supabase
    .from('workspace_invites')
    .select('id, expires_at')
    .eq('email', email)
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (existingInvite) {
    throw new Error('There is already a pending invitation for this email.')
  }

  const token = generateId() + '-' + generateId()
  
  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      email,
      workspace_id: workspaceId,
      role,
      token,
      status: 'pending',
      invited_by: user.id,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint gracefully
    if ((error as any)?.code === '23505') {
      throw new Error('There is already a pending invitation for this email.')
    }
    throw error
  }
  return data as WorkspaceInvite
}

/**
 * Invite a workspace member using the Edge Function (with email)
 * This is the recommended way to invite members as it sends an email
 */
export async function inviteTeamMemberWithEmail(
  email: string,
  role: InviteRole = 'member'
): Promise<{ success: boolean; message: string; inviteId?: string; inviteLink?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { workspaceId } = await getOrCreateDefaultWorkspace()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active session')

  const baseUrl = assertBaseUrl()

  const body = {
    email,
    role,
    workspaceId,
  }

  return await fetchWithTimeout(`${baseUrl}/functions/v1/invite-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })
}

/**
 * Cancel a pending invite
 */
export async function cancelInvite(id: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_invites')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) throw error
}

/**
 * Delete an invite (hard delete)
 */
export async function deleteInvite(id: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_invites')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<WorkspaceInvite | null> {
  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error) return null
  return data as WorkspaceInvite
}

/**
 * Accept an invite
 */
export async function acceptInvite(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { workspaceId: activeWorkspaceId } = await getOrCreateDefaultWorkspace()

  // 1. Find the invite
  const { data: invite, error: inviteError } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invitation')
  }

  // 2. Check if already a member
  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('workspace_id', invite.workspace_id)
    .single()

  if (existingMember) {
    throw new Error('You are already a member of this workspace')
  }

  // 3. Add to workspace_members
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      user_id: user.id,
      workspace_id: invite.workspace_id,
      role: invite.role,
      invited_by: invite.invited_by,
      status: 'active',
      accepted_at: new Date().toISOString(),
    })

  if (memberError) throw memberError

  // 4. Update invite status
  await supabase
    .from('workspace_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  // 5. Update cache if invite points to a different workspace than cached one
  if (invite.workspace_id !== activeWorkspaceId) {
    clearWorkspaceCache()
  }
}

/**
 * Decline an invite
 */
export async function declineInvite(token: string): Promise<void> {
  const { error } = await supabase
    .from('workspace_invites')
    .update({ status: 'cancelled' })
    .eq('token', token)
    .eq('status', 'pending')

  if (error) throw error
}

// ============================================
// TEAM INFO API
// ============================================

/**
 * Get workspace info
 */
export async function getTeamInfo(workspaceId: string): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (error) throw error
  return data as Workspace
}

/**
 * Check if current user can manage a workspace
 */
export async function canManageTeam(workspaceId: string): Promise<boolean> {
  const role = await getUserTeamRole(workspaceId)
  return role === 'owner' || role === 'admin'
}

/**
 * Check if current user can edit content in a workspace
 */
export async function canEditInTeam(workspaceId: string): Promise<boolean> {
  const role = await getUserTeamRole(workspaceId)
  return role === 'owner' || role === 'admin' || role === 'member'
}
