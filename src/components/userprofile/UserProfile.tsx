import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useProfile } from '@/hooks/use-profile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  LogOut, 
  Settings, 
  ChevronsUpDown, 
  Info, 
  Globe, 
  Bell, 
  Clock, 
  UserCheck, 
  FileText 
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UserProfileProps {
  isCompact?: boolean
}

export function UserProfile({ isCompact = false }: UserProfileProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-2 ${isCompact ? 'justify-center' : ''}`}>
        <Skeleton className="h-9 w-9 rounded-full" />
        {!isCompact && (
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </div>
    )
  }

  // If not loading and we have no user, don't render anything
  if (!user) return null

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }
  
  // Use profile data if available, otherwise fall back to auth user data
  const displayName = profile?.name || user.email?.split('@')[0] || 'User'
  const email = profile?.email || user.email || 'No email'
  const avatarUrl = profile?.avatar_url || ''
  const subscriptionPlan = profile?.subscription_plan || 'Free Plan'
  const userInitials = (profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : displayName.charAt(0)).toUpperCase()


  // Compact version for collapsed sidebar
  if (isCompact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="end" side="right">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{subscriptionPlan}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Profile Details (only show if profile is loaded) */}
              {profile && (
                <>
                  <div className="flex flex-col px-4 py-2 space-y-2 text-xs text-muted-foreground">
                    {profile.role && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        <span>{profile.role}</span>
                      </div>
                    )}
                    {profile.bio && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{profile.bio}</span>
                      </div>
                    )}
                    {profile.language && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{profile.language}</span>
                      </div>
                    )}
                    {profile.theme && (
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>{profile.theme}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>{profile.notifications_enabled ? 'Notifications On' : 'Notifications Off'}</span>
                    </div>
                    {profile.last_active && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Last active: {formatDate(profile.last_active)}</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent side="right">
            <p>{displayName}</p>
            <p className="text-xs opacity-75">{subscriptionPlan}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full version for expanded sidebar
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between h-auto p-3 hover:bg-accent/50">
          <div className="flex items-center gap-3 text-left min-w-0 flex-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {subscriptionPlan}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 max-h-80 overflow-y-auto" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        
        {/* Enhanced Profile Fields (only show if profile is loaded) */}
        {profile && (
          <>
            <div className="px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {profile.role && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{profile.role}</span>
                  </div>
                )}
                {profile.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.language}</span>
                  </div>
                )}
                {profile.theme && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.theme}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.notifications_enabled ? 'On' : 'Off'}</span>
                </div>
              </div>
              
              {profile.bio && (
                <div className="flex items-start gap-2 text-xs">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">{profile.bio}</span>
                </div>
              )}
              
              {profile.last_active && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last active: {formatDate(profile.last_active)}</span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
