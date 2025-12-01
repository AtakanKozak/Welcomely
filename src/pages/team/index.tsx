import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Mail,
  MoreVertical,
  Trash2,
  Clock,
  Shield,
  User,
  Copy,
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
  useInviteTeamMember,
  useRemoveTeamMember,
  useCancelInvite,
} from '@/hooks/use-team'
import { useProfile } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export default function TeamPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const { toast } = useToast()
  const profile = useProfile()
  const authLoading = useAuthStore((state) => state.isLoading && !state.profile)
  
  const { data: members, isLoading: isLoadingMembers } = useTeamMembers()
  const { data: invites, isLoading: isLoadingInvites } = useTeamInvites()
  
  const inviteMember = useInviteTeamMember()
  const removeMember = useRemoveTeamMember()
  const cancelInviteMutation = useCancelInvite()

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  const handleInvite = async (values: InviteFormValues) => {
    try {
      await inviteMember.mutateAsync(values)
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${values.email}`,
      })
      setIsInviteDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (id: string) => {
    try {
      await removeMember.mutateAsync(id)
      toast({
        title: 'Member removed',
        description: 'The team member has been removed successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelInvite = async (id: string) => {
    try {
      await cancelInviteMutation.mutateAsync(id)
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation.',
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

  if (authLoading || isLoadingMembers || isLoadingInvites) {
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <Shield className="h-10 w-10 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">Loading profile</h2>
          <p className="text-muted-foreground">We couldn&apos;t load your profile information. Please refresh the page.</p>
        </div>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and permissions.
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member. They will receive an email
                with a link to join your team.
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
                  onValueChange={(value: 'admin' | 'member' | 'viewer') =>
                    form.setValue('role', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Admins can manage the team. Members can create and edit checklists.
                  Viewers can only view checklists.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteMember.isPending}>
                  {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Current Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              People who have access to your checklists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Show current user first */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium leading-none">
                      {profile?.full_name || 'You'} <Badge variant="secondary" className="ml-2">Owner</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {members && members.length > 0 && <Separator />}

              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profile.full_name?.charAt(0) || member.profile.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">
                        {member.profile.full_name || member.profile.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {(!members || members.length === 0) && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No team members yet. Invite someone to get started!
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
                <Mail className="h-5 w-5" />
                Pending Invites
              </CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium leading-none">{invite.email}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Expires {format(new Date(invite.expires_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="capitalize">
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
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

