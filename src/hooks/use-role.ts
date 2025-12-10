import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrentUserRole, useUserTeamRole } from '@/hooks/use-team'
import { 
  getRolePermissions, 
  type WorkspaceRole as TeamRole, 
  type RolePermissions 
} from '@/types/database'

/**
 * Hook to get current user's role and permissions in their own team
 * Use this for most cases when checking if user can perform actions
 */
export function useRole() {
  const { data: role, isLoading } = useCurrentUserRole()
  
  const permissions = useMemo(() => {
    return getRolePermissions(role)
  }, [role])
  
  return {
    role: role || 'viewer' as TeamRole,
    permissions,
    isLoading,
    
    // Convenience methods
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    canManage: permissions.canManageTeam,
    canEdit: permissions.canEditContent,
    canInvite: permissions.canInvite,
    canView: permissions.canViewContent,
  }
}

/**
 * Hook to get user's role and permissions in a specific team
 * Use this when checking permissions for a team other than the user's own
 */
export function useRoleInTeam(teamId: string | undefined) {
  const { data: role, isLoading } = useUserTeamRole(teamId)
  const user = useAuthStore((state) => state.user)
  
  // If teamId matches user's id, they are the owner
  const effectiveRole = useMemo(() => {
    if (teamId && user?.id === teamId) {
      return 'owner' as TeamRole
    }
    return role || null
  }, [teamId, user?.id, role])
  
  const permissions = useMemo(() => {
    return getRolePermissions(effectiveRole)
  }, [effectiveRole])
  
  return {
    role: effectiveRole,
    permissions,
    isLoading,
    isMember: !!effectiveRole,
    
    // Convenience methods
    isOwner: effectiveRole === 'owner',
    isAdmin: effectiveRole === 'admin' || effectiveRole === 'owner',
    canManage: permissions.canManageTeam,
    canEdit: permissions.canEditContent,
    canInvite: permissions.canInvite,
    canView: permissions.canViewContent,
  }
}

/**
 * Hook to check if current user has specific permission
 */
export function usePermission(permission: keyof RolePermissions): boolean {
  const { permissions, isLoading } = useRole()
  
  if (isLoading) return false
  return permissions[permission]
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(permissionKeys: (keyof RolePermissions)[]): Record<string, boolean> {
  const { permissions, isLoading } = useRole()
  
  return useMemo(() => {
    const result: Record<string, boolean> = {}
    for (const key of permissionKeys) {
      result[key] = isLoading ? false : permissions[key]
    }
    return result
  }, [permissions, permissionKeys, isLoading])
}

/**
 * Hook to check if user can perform a specific action
 * Returns loading state for better UX
 */
export function useCanDo(action: keyof RolePermissions) {
  const { permissions, isLoading } = useRole()
  
  return {
    allowed: isLoading ? false : permissions[action],
    isLoading,
  }
}

/**
 * Higher-order component helper - check if user has required role
 */
export function useRequireRole(requiredRole: TeamRole): {
  hasAccess: boolean
  isLoading: boolean
  userRole: TeamRole | null
} {
  const { role, isLoading } = useRole()
  
  const roleHierarchy: Record<TeamRole, number> = {
    viewer: 0,
    member: 1,
    admin: 2,
    owner: 3,
  }
  
  const hasAccess = useMemo(() => {
    if (!role) return false
    const userRoleLevel = roleHierarchy[role as TeamRole] ?? 0
    const requiredRoleLevel = roleHierarchy[requiredRole]
    return userRoleLevel >= requiredRoleLevel
  }, [role, requiredRole])
  
  return {
    hasAccess,
    isLoading,
    userRole: role,
  }
}

/**
 * Component-level access control hook
 * Returns whether to render/enable a component based on permission
 */
export function useAccessControl(
  permission: keyof RolePermissions,
  options?: {
    fallback?: boolean
    showDisabled?: boolean
  }
) {
  const { permissions, isLoading } = useRole()
  
  return {
    // Whether to show the component at all
    show: isLoading ? (options?.fallback ?? false) : permissions[permission],
    
    // Whether to show as disabled (for showing but not enabling)
    disabled: isLoading || !permissions[permission],
    
    // Loading state
    isLoading,
    
    // Whether user has the permission
    hasPermission: permissions[permission],
  }
}

