import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'
import type { TeamMemberWithProfile, TeamInvite } from '@/types/database'

// Get all team members
export async function getTeamMembers() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get members where I am the team owner
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('team_id', user.id)

  if (error) throw error
  return data as TeamMemberWithProfile[]
}

// Get all pending invites
export async function getTeamInvites() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('team_id', user.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  if (error) throw error
  return data as TeamInvite[]
}

// Invite a team member
export async function inviteTeamMember(email: string, role: 'admin' | 'member' | 'viewer' = 'member') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user is already a member
  // Note: In a real app we'd check by email, but profiles might not be public. 
  // For MVP, we'll just create the invite.

  const token = generateId()
  
  const { data, error } = await supabase
    .from('team_invites')
    .insert({
      email,
      team_id: user.id,
      role,
      token,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  
  // In a real app, you would send an email here with the link:
  // https://welcomely.app/join-team?token=${token}
  
  return data as TeamInvite
}

// Remove a team member
export async function removeTeamMember(id: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Cancel an invite
export async function cancelInvite(id: string) {
  const { error } = await supabase
    .from('team_invites')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Accept an invite (would be used on a join page)
export async function acceptInvite(token: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Find the invite
  const { data: invite, error: inviteError } = await supabase
    .from('team_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invite) throw new Error('Invalid or expired invite')

  // 2. Add to team_members
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      team_id: invite.team_id,
      role: invite.role,
    })

  if (memberError) throw memberError

  // 3. Update invite status
  await supabase
    .from('team_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)
}

