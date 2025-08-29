import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Chrome } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { toast } from 'sonner'

export function ConnectedApps() {
  const menuItems = [
    { label: 'Add App', onClick: () => toast.info('Action: Add App') },
    { label: 'Remove App', onClick: () => toast.error('Action: Remove App') },
    { label: 'App Settings', onClick: () => toast.info('Action: App Settings') },
  ]

  return (
    <div className="space-y-8">
      <SettingsSection
        title="Connected Apps"
        subtitle="Manage your connected applications"
        menuItems={menuItems}
      />
      <Card>
        <CardHeader>
          <CardTitle>OAuth Connections</CardTitle>
          <CardDescription>These applications have access to your basic profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Github className="h-8 w-8" />
              <div>
                <p className="font-semibold">GitHub</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
            <Button variant="outline" disabled>Disconnect</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Chrome className="h-8 w-8" />
              <div>
                <p className="font-semibold">Google</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
            <Button variant="outline" disabled>Disconnect</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
