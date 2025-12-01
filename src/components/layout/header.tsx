import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Logo } from '@/components/shared/logo'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklists } from '@/hooks/use-checklists'
import { CHECKLIST_TEMPLATES } from '@/lib/templates-data'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { data: checklistData, isLoading: isLoadingChecklists } = useChecklists()

  const checklists = checklistData || []
  const normalizedQuery = searchTerm.trim().toLowerCase()

  const checklistResults = useMemo(() => {
    if (!normalizedQuery) return []
    return checklists
      .filter((checklist) => {
        const haystack = `${checklist.title} ${checklist.description ?? ''} ${checklist.category ?? ''}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
      .slice(0, 5)
  }, [checklists, normalizedQuery])

  const templateResults = useMemo(() => {
    if (!normalizedQuery) return []
    return CHECKLIST_TEMPLATES.filter((template) => {
      const haystack = `${template.name} ${template.description} ${template.category} ${template.tasks
        .map((task) => task.title)
        .join(' ')}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    }).slice(0, 5)
  }, [normalizedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current) return
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultSelect = (path: string) => {
    navigate(path)
    setSearchTerm('')
    setIsSearchActive(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setIsSearchActive(false)
  }

  const showResults = isSearchActive && normalizedQuery.length > 0
  const hasResults = checklistResults.length > 0 || templateResults.length > 0

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile logo */}
      <div className="lg:hidden">
        <Logo showText={false} size="sm" />
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center gap-4 lg:gap-6">
        <div ref={searchContainerRef} className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchTerm}
            onFocus={() => setIsSearchActive(true)}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                handleClearSearch()
              }
            }}
            placeholder="Search checklists, templates..."
            className="pl-10 pr-10 bg-muted/50"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showResults && (
            <div className="absolute left-0 right-0 mt-2 rounded-lg border bg-popover shadow-xl z-50">
              {isLoadingChecklists ? (
                <div className="p-4 text-sm text-muted-foreground">Searching...</div>
              ) : hasResults ? (
                <>
                  {checklistResults.length > 0 && (
                    <div className="py-2 border-b last:border-b-0">
                      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Checklists
                      </p>
                      <div className="space-y-1">
                        {checklistResults.map((checklist) => (
                          <button
                            key={checklist.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleResultSelect(`/checklists/${checklist.id}`)}
                            className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent rounded-md transition-colors"
                          >
                            <p className="text-sm font-medium truncate">{checklist.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {checklist.category && (
                                <span className="uppercase tracking-wide text-[10px] text-primary">
                                  {checklist.category}
                                </span>
                              )}
                              <span className="truncate">
                                {checklist.description || 'No description'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {templateResults.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Templates
                      </p>
                      <div className="space-y-1">
                        {templateResults.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleResultSelect(`/templates#${template.id}`)}
                            className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent rounded-md transition-colors"
                          >
                            <p className="text-sm font-medium truncate">{template.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="uppercase tracking-wide text-[10px] text-primary">
                                {template.category}
                              </span>
                              <span className="truncate">{template.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

