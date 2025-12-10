import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Mail,
  MoreVertical,
  Clock,
  Shield,
  User,
  Copy,
  UserMinus,
  Crown,
  Users,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useTeamMembers,
  useTeamInvites,
  useInviteTeamMemberWithEmail,
  useRemoveTeamMember,
  useCancelInvite,
  useUpdateMemberRole,
  useCurrentUserRole,
} from '@/hooks/use-team'
import { useAuthStore } from '@/stores/auth-store'
import { getRolePermissions, type InviteRole } from '@/types/database'
import { cn, getInitials } from '@/lib/utils'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
})

type InviteFormValues = z.infer<typeof inviteSchema>

// Role badge color helper
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'owner':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'admin':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'member':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'viewer':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default:
      return ''
  }
}

// Role icon helper
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner':
      return Crown
    case 'admin':
      return Shield
    case 'member':
      return User
    case 'viewer':
      return Users
    default:
      return User
  }
}

export default function TeamPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
  const [inviteToCancel, setInviteToCancel] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const { toast } = useToast()
  
  // Get user and profile from auth store
  const { profile, user, isLoading: authLoading } = useAuthStore()
  
  // Create a user info object that works even without profile
  const userInfo = {
    id: user?.id || '',
    email: profile?.email || user?.email || '',
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || null,
  }
  
  const { data: members, isLoading: _isLoadingMembers } = useTeamMembers()
  const { data: invites, isLoading: _isLoadingInvites } = useTeamInvites()
  const { data: currentUserRole } = useCurrentUserRole()
  
  const inviteMember = useInviteTeamMemberWithEmail()
  const removeMember = useRemoveTeamMember()
  const cancelInviteMutation = useCancelInvite()
  const updateRole = useUpdateMemberRole()

  // Get current user permissions
  const permissions = getRolePermissions(currentUserRole)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  const handleInvite = async (values: InviteFormValues) => {
    setIsSendingInvite(true)
    try {
      await inviteMember.mutateAsync(values)
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${values.email}`,
      })
      setIsInviteDialogOpen(false)
      form.reset()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return
    
    try {
      await removeMember.mutateAsync(memberToRemove)
      toast({
        title: 'Member removed',
        description: 'The team member has been removed successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member.',
        variant: 'destructive',
      })
    } finally {
      setMemberToRemove(null)
    }
  }

  const handleCancelInvite = async () => {
    if (!inviteToCancel) return
    
    try {
      await cancelInviteMutation.mutateAsync(inviteToCancel)
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel invitation.',
        variant: 'destructive',
      })
    } finally {
      setInviteToCancel(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: InviteRole) => {
    try {
      await updateRole.mutateAsync({ memberId, role: newRole })
      toast({
        title: 'Role updated',
        description: 'Team member role has been updated.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role.',
        variant: 'destructive',
      })
    }
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/join-team?token=${token}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link copied',
      description: 'Invite link copied to clipboard',
    })
  }

  // Only show loading when auth is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // If no user is logged in, show error
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <Shield className="h-10 w-10 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">Not authenticated</h2>
          <p className="text-muted-foreground">Please log in to access team settings.</p>
        </div>
        <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their permissions.
          </p>
        </div>
        {permissions.canInvite && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new team member. They will receive a link to join your team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="colleague@company.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    defaultValue="member"
                    onValueChange={(value: InviteRole) =>
                      form.setValue('role', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-400" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-400" />
                          <span>Member</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Viewer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
                    <p><strong>Admin:</strong> Full access to manage team and content</p>
                    <p><strong>Member:</strong> Can create and edit checklists</p>
                    <p><strong>Viewer:</strong> Can only view checklists</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMember.isPending || isSendingInvite}>
                    {inviteMember.isPending || isSendingInvite ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {/* Current Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Team Members
              {members && members.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {members.length + 1}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              People who have access to your checklists and team resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show current user first (Owner) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-500/20">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 border-2 border-yellow-500/30">
                    <AvatarImage src={userInfo.avatar_url || undefined} />
                    <AvatarFallback className="bg-yellow-500/20 text-yellow-400">
                      {getInitials(userInfo.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-none">
                        {userInfo.full_name}
                      </p>
                      <Badge className={cn('capitalize', getRoleBadgeClass('owner'))}>
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{userInfo.email}</p>
                  </div>
                </div>
              </div>

              {members && members.length > 0 && <Separator />}

              {/* Team members */}
              {members?.map((member) => {
                const RoleIcon = getRoleIcon(member.role)
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={member.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profile.full_name?.charAt(0) || member.profile.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium leading-none">
                            {member.profile.full_name || member.profile.email}
                          </p>
                          <Badge className={cn('capitalize', getRoleBadgeClass(member.role))}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {member.profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {permissions.canChangeRoles && (
                        <Select
                          value={member.role}
                          onValueChange={(value: InviteRole) => handleRoleChange(member.id, value)}
                        >
                          <SelectTrigger className="w-28 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {permissions.canRemoveMembers && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setMemberToRemove(member.id)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                )
              })}

              {(!members || members.length === 0) && (
                <div className="text-center py-10 space-y-3">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No team members yet</p>
                    <p className="text-sm text-muted-foreground">
                      Invite someone to start collaborating!
                    </p>
                  </div>
                  {permissions.canInvite && (
                    <Button
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Invite your first member
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {invites && invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                Pending Invitations
                <Badge variant="secondary" className="ml-2">
                  {invites.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invites.map((invite) => {
                  const isExpiringSoon = new Date(invite.expires_at).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
                  
                  return (
                    <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium leading-none">{invite.email}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Expires {format(new Date(invite.expires_at), 'MMM d, yyyy')}
                            {isExpiringSoon && (
                              <span className="text-yellow-500 flex items-center gap-1 ml-2">
                                <AlertTriangle className="h-3 w-3" />
                                Soon
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn('capitalize', getRoleBadgeClass(invite.role))}>
                          {invite.role}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(invite.token)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setInviteToCancel(invite.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Understanding what each role can do in your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Owner */}
              <div className="p-4 rounded-lg border bg-yellow-500/5 border-yellow-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">Owner</span>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Full access</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Manage billing</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Delete team</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Transfer ownership</li>
                </ul>
              </div>
              
              {/* Admin */}
              <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-purple-400">Admin</span>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Invite members</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Remove members</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Manage content</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Change roles</li>
                </ul>
              </div>
              
              {/* Member */}
              <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-blue-400">Member</span>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Create checklists</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Edit content</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Complete tasks</li>
                  <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-400" /> Cannot manage team</li>
                </ul>
              </div>
              
              {/* Viewer */}
              <div className="p-4 rounded-lg border bg-gray-500/5 border-gray-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="font-semibold text-gray-400">Viewer</span>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> View checklists</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> View progress</li>
                  <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-400" /> Cannot edit</li>
                  <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-400" /> Read-only access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from your team? 
              They will lose access to all shared checklists and resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invite Confirmation Dialog */}
      <AlertDialog open={!!inviteToCancel} onOpenChange={() => setInviteToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? 
              The invite link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
