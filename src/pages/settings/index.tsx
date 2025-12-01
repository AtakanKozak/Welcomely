import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Settings,
  Bell,
  CreditCard,
  ShieldAlert,
  Upload,
  Copy,
  LogOut,
  Building,
  Check,
  Laptop,
  Smartphone,
  Menu,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'
import { useProfile } from '@/hooks/use-auth'
import { BILLING_HISTORY, ACTIVE_SESSIONS, USAGE_SUMMARY } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Validation Schemas
const generalSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  brandColor: z.string(),
})

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SettingsPage() {
  const { toast } = useToast()
  const { logout } = useAuthStore()
  const profile = useProfile()
  const [activeTab, setActiveTab] = useState('general')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Forms
  const generalForm = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      workspaceName: profile?.company_name || 'My Workspace',
      brandColor: '#0f172a',
    },
  })

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Handlers
  const onGeneralSubmit = (data: any) => {
    console.log(data)
    toast({
      title: 'Settings updated',
      description: 'General settings have been saved successfully.',
    })
  }

  const onProfileSubmit = (data: any) => {
    console.log(data)
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated.',
    })
  }

  const onPasswordSubmit = (data: any) => {
    console.log(data)
    toast({
      title: 'Password updated',
      description: 'Your password has been changed successfully.',
    })
    passwordForm.reset()
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(`https://welcomely.app/${generalForm.getValues('workspaceName').toLowerCase().replace(/\s+/g, '-')}`)
    toast({
      title: 'Copied to clipboard',
      description: 'Public share URL copied to clipboard.',
    })
  }

  const handleDeleteWorkspace = () => {
    toast({
      title: 'Workspace deleted',
      description: 'Your workspace has been permanently deleted.',
      variant: 'destructive',
    })
  }

  const menuItems = [
    { id: 'general', label: 'General & Branding', icon: Building },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert, variant: 'destructive' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your workspace settings and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form id="general-form" onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName">Workspace Name</Label>
                    <Input id="workspaceName" {...generalForm.register('workspaceName')} />
                    {generalForm.formState.errors.workspaceName && (
                      <p className="text-sm text-destructive">{generalForm.formState.errors.workspaceName.message as string}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Workspace Logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {generalForm.watch('workspaceName')?.[0]?.toUpperCase() || 'W'}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" type="button">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Brand Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded border shadow-sm" 
                        style={{ backgroundColor: generalForm.watch('brandColor') }}
                      />
                      <Input 
                        id="brandColor" 
                        type="color" 
                        className="w-24 h-10 p-1"
                        {...generalForm.register('brandColor')} 
                      />
                      <Input 
                        value={generalForm.watch('brandColor')}
                        readOnly
                        className="w-32 font-mono"
                      />
                    </div>
                  </div>
                </form>

                <Separator />

                <div className="space-y-4">
                  <Label>Public Share URL Preview</Label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={`https://welcomely.app/${generalForm.watch('workspaceName').toLowerCase().replace(/\s+/g, '-')}`} 
                      className="bg-muted"
                    />
                    <Button variant="outline" size="icon" onClick={copyShareUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is how your public checklists will appear to others.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="general-form">Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...profileForm.register('fullName')} />
                      {profileForm.formState.errors.fullName && (
                        <p className="text-sm text-destructive">{profileForm.formState.errors.fullName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" {...profileForm.register('email')} />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{profileForm.formState.errors.email.message as string}</p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="profile-form">Save Profile</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password securely.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="password-form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message as string}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message as string}</p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="password-form" variant="outline">Update Password</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active sessions across devices.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ACTIVE_SESSIONS.map((session) => (
                    <div key={session.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                          {session.device.toLowerCase().includes('phone') ? (
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Laptop className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {session.device}
                            {session.isCurrent && (
                              <Badge variant="secondary" className="text-[10px] h-5">Current</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.location} • {session.lastActive}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button variant="ghost" size="sm">Log out</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => toast({ title: 'Logged out all other devices' })}>
                  Log out all other devices
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>Set your language and regional preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">EST (GMT-5)</SelectItem>
                        <SelectItem value="pst">PST (GMT-8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summaries and important updates.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Checklist Completed</Label>
                    <p className="text-sm text-muted-foreground">Get notified when a checklist is 100% complete.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Client Opened Checklist</Label>
                    <p className="text-sm text-muted-foreground">Get notified when a client views a shared checklist.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              {USAGE_SUMMARY.map((item) => (
                <Card key={item.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.title}
                    </CardTitle>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <p className="text-xs text-muted-foreground">
                      of {item.limit} limit used
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Manage your subscription and billing.</CardDescription>
                  </div>
                  <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    Pro Plan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
                  <div>
                    <p className="font-medium">Pro Plan ($29/month)</p>
                    <p className="text-sm text-muted-foreground">Next invoice: Nov 1, 2023</p>
                  </div>
                  <Button>Manage Subscription</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BILLING_HISTORY.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{invoice.date}</p>
                          <p className="text-xs text-muted-foreground">{invoice.invoice}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{invoice.amount}</p>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'danger':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Workspace</CardTitle>
                <CardDescription className="text-destructive/80">
                  Permanently delete your workspace and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will delete all checklists, templates, and team member data associated with <strong>{generalForm.watch('workspaceName')}</strong>.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Workspace</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. Please type your password to confirm deletion.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="confirm-password">Password</Label>
                      <Input id="confirm-password" type="password" className="mt-2" />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteWorkspace}>Confirm Deletion</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col lg:flex-row lg:gap-10">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0 hidden lg:block">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start gap-3',
                  activeTab === item.id && 'bg-secondary font-medium',
                  item.variant === 'destructive' && 'text-destructive hover:text-destructive hover:bg-destructive/10'
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Select setting" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{menuItems.find(i => i.id === activeTab)?.label}</h1>
            <p className="text-muted-foreground">
              Manage your workspace settings and preferences.
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

