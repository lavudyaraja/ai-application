import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SettingsSection } from '../SettingsSection'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EditProfileDialog } from '../EditProfileDialog'
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog'

export function Account() {
  const { user } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const menuItems = [
    { label: 'Edit Profile', onClick: () => setIsEditOpen(true) },
    { label: 'Delete Account', onClick: () => setIsDeleteConfirmOpen(true) },
    { label: 'View Activity', onClick: () => toast.info('Activity log is a premium feature.') },
  ]

  const handleDeleteAccount = () => {
    toast.error("This is a critical action and is disabled in this demo.")
    setIsDeleteConfirmOpen(false)
  }

  return (
    <>
      <EditProfileDialog open={isEditOpen} onOpenChange={setIsEditOpen} />
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteAccount}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        confirmText="Yes, delete my account"
      />

      <div className="space-y-8">
        <SettingsSection
          title="Account"
          subtitle="Manage your account details"
          menuItems={menuItems}
        />
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your basic account information.</CardDescription>
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
                  Account created on: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all of your content. This action is not reversible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>Delete My Account</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
