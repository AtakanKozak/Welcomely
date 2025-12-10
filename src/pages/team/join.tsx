import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  Shield, 
  Loader2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/shared/logo'
import { useToast } from '@/hooks/use-toast'
import { useInviteByToken, useAcceptInvite, useDeclineInvite } from '@/hooks/use-team'
import { useAuthStore } from '@/stores/auth-store'
import { getTeamInfo } from '@/lib/api/team'
import { cn } from '@/lib/utils'

interface WorkspaceInfo {
  id: string
  name: string
  owner_id: string
  plan_type: string
  slug?: string | null
}

export default function JoinTeamPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  
  const token = searchParams.get('token')
  
  const { data: invite, isLoading: inviteLoading, error: inviteError } = useInviteByToken(token || undefined)
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()
  
  const [teamInfo, setTeamInfo] = useState<WorkspaceInfo | null>(null)
  const [loadingTeam, setLoadingTeam] = useState(false)
  
  // Fetch team info when invite is loaded
  useEffect(() => {
    if (invite?.workspace_id) {
      setLoadingTeam(true)
      getTeamInfo(invite.workspace_id)
        .then(setTeamInfo)
        .catch(console.error)
        .finally(() => setLoadingTeam(false))
    }
  }, [invite?.workspace_id])

  // Check if token is valid
  const isInvalidToken = !token || inviteError
  const isExpired = invite && new Date(invite.expires_at) < new Date()
  const isAccepted = invite?.status === 'accepted'
  const isCancelled = invite?.status === 'cancelled'

  const handleAccept = async () => {
    if (!token) return
    
    try {
      await acceptInvite.mutateAsync(token)
      toast({
        title: 'Welcome to the team!',
        description: 'You have successfully joined the team.',
      })
      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Failed to join team',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDecline = async () => {
    if (!token) return
    
    try {
      await declineInvite.mutateAsync(token)
      toast({
        title: 'Invitation declined',
        description: 'You have declined the invitation.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'member':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to manage team and content'
      case 'member':
        return 'Can view and edit content, create new items'
      case 'viewer':
        return 'Can only view content'
      default:
        return ''
    }
  }

  // Loading state
  if (authLoading || inviteLoading || loadingTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400">Loading invitation...</p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (isInvalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Expired invitation
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <CardTitle className="text-white">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please ask the team admin to send a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Already accepted
  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-white">Already Accepted</CardTitle>
            <CardDescription>
              You have already accepted this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Cancelled invitation
  if (isCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-white">Invitation Cancelled</CardTitle>
            <CardDescription>
              This invitation has been cancelled by the team admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-4" size="lg" />
            <CardTitle className="text-white">Join Team</CardTitle>
            <CardDescription>
              You need to sign in or create an account to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invitation Details */}
            {invite && teamInfo && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {teamInfo.name || 'A workspace'}
                    </p>
                    <p className="text-sm text-gray-400">invited you to join</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Role:</span>
                  <Badge className={cn('capitalize', getRoleBadgeColor(invite.role))}>
                    {invite.role}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to={`/login?redirect=/join-team?token=${token}`}>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/signup?redirect=/join-team?token=${token}`}>
                  Create Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authenticated - show accept/decline options
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <Card className="max-w-md w-full bg-[#0f1419] border-white/10">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-4" size="lg" />
          <CardTitle className="text-white text-2xl">Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team on Welcomely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          {invite && teamInfo && (
            <div className="bg-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-500/30 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    {teamInfo.name || 'Workspace'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Workspace invitation
                  </p>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Your email</span>
                  <span className="text-sm text-white">{invite.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Role</span>
                  <Badge className={cn('capitalize', getRoleBadgeColor(invite.role))}>
                    {invite.role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 pt-2">
                  {getRoleDescription(invite.role)}
                </p>
              </div>
            </div>
          )}

          {/* Email mismatch warning */}
          {invite && user && user.email !== invite.email && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium">Email mismatch</p>
                  <p className="text-yellow-400/80 mt-1">
                    This invitation was sent to <strong>{invite.email}</strong>, 
                    but you're signed in as <strong>{user.email}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              disabled={acceptInvite.isPending || declineInvite.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
            >
              {acceptInvite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept & Join
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={acceptInvite.isPending || declineInvite.isPending}
              className="flex-1"
            >
              {declineInvite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

