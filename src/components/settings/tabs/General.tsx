import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'
import { toast } from 'sonner'
import { EditProfileDialog } from '../EditProfileDialog'

export function General() {
  const { user, logout } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const menuItems = [
    { label: 'Edit Profile', onClick: () => setIsEditOpen(true) },
    { label: 'Reset to Defaults', onClick: () => toast.info('Action: Reset to Defaults') },
  ]

  return (
    <>
      <EditProfileDialog open={isEditOpen} onOpenChange={setIsEditOpen} />
      <div className="space-y-8">
        <SettingsSection
          title="General"
          subtitle="Manage your general preferences"
          menuItems={menuItems}
        />
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is your public presence on AGI AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-2xl">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  User since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Logout</CardTitle>
            <CardDescription>Sign out of your account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
