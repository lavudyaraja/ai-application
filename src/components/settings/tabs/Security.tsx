import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { ChangePasswordDialog } from '../ChangePasswordDialog'

export function Security() {
  const { logout } = useAuth()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  const menuItems = [
    { label: 'Change Password', onClick: () => setIsPasswordDialogOpen(true) },
    { label: 'Two-Factor Authentication', onClick: () => toast.info('2FA is a premium feature coming soon!') },
    { label: 'Logout', onClick: () => logout() },
  ]

  return (
    <>
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
      <div className="space-y-8">
        <SettingsSection
          title="Security & Login"
          subtitle="Manage your security and login preferences"
          menuItems={menuItems}
        />
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>It's a good idea to use a strong password that you're not using elsewhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('2FA is a premium feature coming soon!')}>Enable 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
