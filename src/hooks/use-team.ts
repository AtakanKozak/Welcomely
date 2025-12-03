import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeamMembers,
  getTeamInvites,
  inviteTeamMember,
  removeTeamMember,
  cancelInvite,
} from '@/lib/api/team'
import type { TeamMemberWithProfile, TeamInvite } from '@/types/database'

export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
  invites: () => [...teamKeys.all, 'invites'] as const,
}

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: getTeamMembers,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useTeamInvites() {
  return useQuery({
    queryKey: teamKeys.invites(),
    queryFn: getTeamInvites,
    staleTime: 1000 * 60 * 2,
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: 'admin' | 'member' | 'viewer' }) =>
      inviteTeamMember(email, role),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.invites() })
      
      const previousInvites = queryClient.getQueryData<TeamInvite[]>(teamKeys.invites())
      
      // Create optimistic invite
      if (previousInvites) {
        const optimisticInvite: TeamInvite = {
          id: `temp-${Date.now()}`,
          email: variables.email,
          role: variables.role || 'member',
          team_id: 'pending',
          token: 'pending',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<TeamInvite[]>(
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
      queryClient.setQueryData<TeamInvite[]>(
        teamKeys.invites(),
        (old) => {
          if (!old) return [newInvite]
          return old.filter(invite => !invite.id.startsWith('temp-')).concat(newInvite)
        }
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeTeamMember,
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members() })
      
      const previousMembers = queryClient.getQueryData<TeamMemberWithProfile[]>(teamKeys.members())
      
      // Optimistically remove member
      if (previousMembers) {
        queryClient.setQueryData<TeamMemberWithProfile[]>(
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

export function useCancelInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInvite,
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.invites() })
      
      const previousInvites = queryClient.getQueryData<TeamInvite[]>(teamKeys.invites())
      
      // Optimistically remove invite
      if (previousInvites) {
        queryClient.setQueryData<TeamInvite[]>(
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
