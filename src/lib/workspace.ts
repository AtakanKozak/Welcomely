import { supabase } from '@/lib/supabase'
import type { Workspace } from '@/types'

let cachedWorkspaceId: string | null = null
let cachedWorkspace: Workspace | null = null
let pendingPromise: Promise<{ workspaceId: string; workspace: Workspace }> | null = null

/**
 * Ensure the current user has at least one workspace.
 * Returns the active workspace id and metadata.
 * The result is cached to avoid repetitive queries per session.
 */
export async function getOrCreateDefaultWorkspace(): Promise<{ workspaceId: string; workspace: Workspace }> {
  if (cachedWorkspaceId && cachedWorkspace) {
    return { workspaceId: cachedWorkspaceId, workspace: cachedWorkspace }
  }

  if (!pendingPromise) {
    pendingPromise = (async (): Promise<{ workspaceId: string; workspace: Workspace }> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1) Try to fetch an existing active membership (simple select)
      const { data: memberships, error: membershipsError } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)

      if (membershipsError) {
        console.log('[workspace] membership lookup failed', JSON.stringify(membershipsError, null, 2))

        throw membershipsError
      }

      const membership = memberships?.[0] as { workspace_id: string } | undefined

      // 2) If membership exists, fetch workspace separately
      if (membership?.workspace_id) {
        const { data: workspace, error: workspaceFetchError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', membership.workspace_id)
          .single()

        if (workspaceFetchError) {
          console.error('[workspace] failed to load workspace for membership', workspaceFetchError)
        } else if (workspace) {
          cachedWorkspaceId = workspace.id
          cachedWorkspace = workspace as Workspace
          return { workspaceId: cachedWorkspaceId!, workspace: cachedWorkspace! }
        }
        // If workspace fetch failed or missing, fall through to create a new one
      }

      // 3) No workspace found; create a default one
      const defaultName = user.user_metadata?.company_name
        || user.user_metadata?.full_name
        || user.email
        || 'My Workspace'

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: defaultName,
          owner_id: user.id,
        })
        .select()
        .single()

      if (workspaceError || !workspace) {
        console.error('[workspace] failed to create default workspace', workspaceError)
        throw workspaceError || new Error('Failed to create workspace')
      }

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          invited_by: user.id,
          accepted_at: new Date().toISOString(),
        })

      if (memberError) {
        throw memberError
      }

      cachedWorkspaceId = workspace.id
      cachedWorkspace = workspace as Workspace
      return { workspaceId: cachedWorkspaceId!, workspace: cachedWorkspace! }
    })()
  }

  try {
    const result = await pendingPromise
    return result
  } finally {
    pendingPromise = null
  }
}

/**
 * Clears the cached workspace values. Useful after logout.
 */
export function clearWorkspaceCache() {
  cachedWorkspaceId = null
  cachedWorkspace = null
  pendingPromise = null
}

