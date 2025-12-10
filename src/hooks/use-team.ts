import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeamMembers,
  getTeamInvites,
  getMyInvites,
  inviteTeamMember,
  inviteTeamMemberWithEmail,
  removeTeamMember,
  suspendTeamMember,
  reactivateTeamMember,
  updateMemberRole,
  cancelInvite,
  deleteInvite,
  acceptInvite,
  declineInvite,
  getUserTeamRole,
  getCurrentUserRole,
  getInviteByToken,
} from '@/lib/api/team'
import type { 
  WorkspaceMemberWithProfile, 
  WorkspaceInviteWithInviter,
  WorkspaceRole,
  InviteRole 
} from '@/types/database'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// QUERY KEYS
// ============================================

export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
  invites: () => [...teamKeys.all, 'invites'] as const,
  myInvites: () => [...teamKeys.all, 'my-invites'] as const,
  role: (teamId: string) => [...teamKeys.all, 'role', teamId] as const,
  currentRole: () => [...teamKeys.all, 'current-role'] as const,
  invite: (token: string) => [...teamKeys.all, 'invite', token] as const,
}

// ============================================
// TEAM MEMBERS HOOKS
// ============================================

/**
 * Hook to fetch team members
 */
export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: getTeamMembers,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to get user's role in a workspace
 */
export function useUserTeamRole(workspaceId: string | undefined) {
  return useQuery({
    queryKey: teamKeys.role(workspaceId || ''),
    queryFn: () => getUserTeamRole(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to get current user's role (always owner of their own team)
 */
export function useCurrentUserRole() {
  const user = useAuthStore((state) => state.user)
  
  return useQuery({
    queryKey: teamKeys.currentRole(),
    queryFn: getCurrentUserRole,
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData: 'owner' as WorkspaceRole, // Default workspace owner
  })
}

// ============================================
// TEAM INVITES HOOKS
// ============================================

/**
 * Hook to fetch team invites (sent by current user)
 */
export function useTeamInvites() {
  return useQuery({
    queryKey: teamKeys.invites(),
    queryFn: getTeamInvites,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook to fetch invites received by current user
 */
export function useMyInvites() {
  return useQuery({
    queryKey: teamKeys.myInvites(),
    queryFn: getMyInvites,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook to fetch a specific invite by token
 */
export function useInviteByToken(token: string | undefined) {
  return useQuery({
    queryKey: teamKeys.invite(token || ''),
    queryFn: () => getInviteByToken(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

// ============================================
// INVITE MUTATIONS
// ============================================

/**
 * Hook to invite a team member (without email)
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: InviteRole }) =>
      inviteTeamMember(email, role),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.invites() })
      
      const previousInvites = queryClient.getQueryData<WorkspaceInviteWithInviter[]>(teamKeys.invites())
      
      // Create optimistic invite
      if (previousInvites) {
        const optimisticInvite: WorkspaceInviteWithInviter = {
          id: `temp-${Date.now()}`,
          email: variables.email,
          role: variables.role || 'member',
          workspace_id: 'pending',
          token: 'pending',
          status: 'pending',
          invited_by: null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<WorkspaceInviteWithInviter[]>(
          teamKeys.invites(),
          [...previousInvites, optimisticInvite]
        )
      }
      
      return { previousInvites }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInvites) {
        queryClient.setQueryData(teamKeys.invites(), context.previousInvites)
      }
    },
    onSuccess: (newInvite) => {
      // Replace optimistic invite with real one
      queryClient.setQueryData<WorkspaceInviteWithInviter[]>(
        teamKeys.invites(),
        (old) => {
          if (!old) return [{ ...newInvite, inviter: undefined }]
          return old
            .filter(invite => !invite.id.startsWith('temp-'))
            .concat({ ...newInvite, inviter: undefined })
        }
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

/**
 * Hook to invite a team member with email (using Edge Function)
 */
export function useInviteTeamMemberWithEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: InviteRole }) =>
      inviteTeamMemberWithEmail(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

// ============================================
// MEMBER MANAGEMENT MUTATIONS
// ============================================

/**
 * Hook to remove a team member
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeTeamMember,
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members() })
      
      const previousMembers = queryClient.getQueryData<WorkspaceMemberWithProfile[]>(teamKeys.members())
      
      // Optimistically remove member
      if (previousMembers) {
        queryClient.setQueryData<WorkspaceMemberWithProfile[]>(
          teamKeys.members(),
          previousMembers.filter(member => member.id !== memberId)
        )
      }
      
      return { previousMembers }
    },
    onError: (_error, _memberId, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(teamKeys.members(), context.previousMembers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() })
    },
  })
}

/**
 * Hook to suspend a team member
 */
export function useSuspendTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: suspendTeamMember,
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members() })
      
      const previousMembers = queryClient.getQueryData<WorkspaceMemberWithProfile[]>(teamKeys.members())
      
      if (previousMembers) {
        queryClient.setQueryData<WorkspaceMemberWithProfile[]>(
          teamKeys.members(),
          previousMembers.map(member => 
            member.id === memberId 
              ? { ...member, status: 'suspended' as const }
              : member
          )
        )
      }
      
      return { previousMembers }
    },
    onError: (_error, _memberId, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(teamKeys.members(), context.previousMembers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() })
    },
  })
}

/**
 * Hook to reactivate a suspended team member
 */
export function useReactivateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reactivateTeamMember,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() })
    },
  })
}

/**
 * Hook to update a team member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: InviteRole }) =>
      updateMemberRole(memberId, role),
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members() })
      
      const previousMembers = queryClient.getQueryData<WorkspaceMemberWithProfile[]>(teamKeys.members())
      
      if (previousMembers) {
        queryClient.setQueryData<WorkspaceMemberWithProfile[]>(
          teamKeys.members(),
          previousMembers.map(member =>
            member.id === memberId
              ? { ...member, role }
              : member
          )
        )
      }
      
      return { previousMembers }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(teamKeys.members(), context.previousMembers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() })
    },
  })
}

// ============================================
// INVITE MANAGEMENT MUTATIONS
// ============================================

/**
 * Hook to cancel an invite
 */
export function useCancelInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInvite,
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.invites() })
      
      const previousInvites = queryClient.getQueryData<WorkspaceInviteWithInviter[]>(teamKeys.invites())
      
      // Optimistically remove invite
      if (previousInvites) {
        queryClient.setQueryData<WorkspaceInviteWithInviter[]>(
          teamKeys.invites(),
          previousInvites.filter(invite => invite.id !== inviteId)
        )
      }
      
      return { previousInvites }
    },
    onError: (_error, _inviteId, context) => {
      if (context?.previousInvites) {
        queryClient.setQueryData(teamKeys.invites(), context.previousInvites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

/**
 * Hook to delete an invite (hard delete)
 */
export function useDeleteInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvite,
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.invites() })
      
      const previousInvites = queryClient.getQueryData<WorkspaceInviteWithInviter[]>(teamKeys.invites())
      
      if (previousInvites) {
        queryClient.setQueryData<WorkspaceInviteWithInviter[]>(
          teamKeys.invites(),
          previousInvites.filter(invite => invite.id !== inviteId)
        )
      }
      
      return { previousInvites }
    },
    onError: (_error, _inviteId, context) => {
      if (context?.previousInvites) {
        queryClient.setQueryData(teamKeys.invites(), context.previousInvites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

/**
 * Hook to accept an invite
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Hook to decline an invite
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: declineInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myInvites() })
    },
  })
}
