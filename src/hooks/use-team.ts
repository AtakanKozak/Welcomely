import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeamMembers,
  getTeamInvites,
  inviteTeamMember,
  removeTeamMember,
  cancelInvite,
} from '@/lib/api/team'

export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
  invites: () => [...teamKeys.all, 'invites'] as const,
}

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: getTeamMembers,
  })
}

export function useTeamInvites() {
  return useQuery({
    queryKey: teamKeys.invites(),
    queryFn: getTeamInvites,
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: 'admin' | 'member' | 'viewer' }) =>
      inviteTeamMember(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() })
    },
  })
}

export function useCancelInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() })
    },
  })
}

