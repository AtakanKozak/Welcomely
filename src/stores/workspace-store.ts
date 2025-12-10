import { create } from 'zustand'
import { getOrCreateDefaultWorkspace } from '@/lib/workspace'
import type { Workspace } from '@/types'

interface WorkspaceState {
  activeWorkspaceId: string | null
  workspace: Workspace | null
  isLoading: boolean
  error: string | null
  setActiveWorkspaceId: (id: string) => void
  initializeWorkspace: () => Promise<string>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeWorkspaceId: null,
  workspace: null,
  isLoading: false,
  error: null,

  setActiveWorkspaceId: (id: string) => set({ activeWorkspaceId: id }),

  initializeWorkspace: async () => {
    if (get().activeWorkspaceId) return get().activeWorkspaceId as string

    set({ isLoading: true, error: null })
    try {
      const { workspaceId, workspace } = await getOrCreateDefaultWorkspace()
      set({ activeWorkspaceId: workspaceId, workspace, isLoading: false })
      return workspaceId
    } catch (err: any) {
      console.error('[workspace-store] initialize failed', err)
      set({ error: err?.message || 'Failed to load workspace', isLoading: false })
      throw err
    }
  },
}))

