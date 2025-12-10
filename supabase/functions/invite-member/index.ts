// Supabase Edge Function: invite-member
// This function handles workspace member invitations using the Supabase Admin API
// Deploy with: supabase functions deploy invite-member

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string
  role: 'admin' | 'member' | 'viewer'
  workspaceId: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client for checking the user's permissions (uses their JWT)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Admin client for creating users (uses service role key)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: InviteRequest = await req.json()
    const { email, role, workspaceId } = body

    // Validate input
    if (!email || !role || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, role, workspaceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be: admin, member, or viewer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the inviter has permission to invite (must be owner or admin of workspace)
    const { data: inviterMembership, error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .select('role, status')
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .single()

    if (memberError || !inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not have permission to invite members to this workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    // Check if user is already a workspace member
    if (existingUser) {
      const { data: existingMember } = await supabaseAdmin
        .from('workspace_members')
        .select('id, status')
        .eq('user_id', existingUser.id)
        .eq('workspace_id', workspaceId)
        .single()

      if (existingMember) {
        if (existingMember.status === 'active') {
          return new Response(
            JSON.stringify({ error: 'This user is already a member of the workspace' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        // If they were removed/suspended, we could reactivate them
        // For now, just inform the user
        return new Response(
          JSON.stringify({ error: 'This user was previously a member. Contact support to reactivate.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check if there's already a pending invite for this email
    const { data: existingInvite } = await supabaseAdmin
      .from('workspace_invites')
      .select('id')
      .eq('email', email)
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return new Response(
        JSON.stringify({ error: 'There is already a pending invitation for this email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a secure invite token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID()

    // Create the invite record
    const { data: invite, error: inviteDbError } = await supabaseAdmin
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

    if (inviteDbError) {
      console.error('Database error creating invite:', inviteDbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Option 1: If the user doesn't exist, invite them via Supabase Auth
    // This sends them an email to create an account
    if (!existingUser) {
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
      
      const { data: authInvite, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${appUrl}/join-team?token=${token}`,
          data: {
            workspace_id: workspaceId,
            role: role,
            invited_by: user.id,
            invite_token: token,
          },
        }
      )

      if (authError) {
        console.error('Auth invite error:', authError)
        // Clean up the invite record if auth invite fails
        await supabaseAdmin.from('workspace_invites').delete().eq('id', invite.id)
        
        return new Response(
          JSON.stringify({ error: `Failed to send invitation email: ${authError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation sent to ${email}. They will receive an email to create their account.`,
          inviteId: invite.id,
          userId: authInvite?.user?.id,
          type: 'new_user',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Option 2: User exists, just create the invite record
    // In a production app, you might want to send them a custom email here
    // using a service like Resend, SendGrid, etc.
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation created for ${email}. They can accept the invite at their convenience.`,
        inviteId: invite.id,
        userId: existingUser.id,
        type: 'existing_user',
        inviteLink: `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/join-team?token=${token}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

