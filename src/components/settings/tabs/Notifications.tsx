import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../SettingsSection'
import { toast } from 'sonner'
import { useProfile } from '@/hooks/use-profile'

export function Notifications() {
  const { profile, updateProfile, loading } = useProfile()

  const handleToggleNotifications = (enabled: boolean) => {
    updateProfile({ notifications_enabled: enabled })
  }

  const menuItems = [
    { label: 'Mark all read', onClick: () => toast.success('All notifications marked as read.') },
    { label: 'Mute All', onClick: () => handleToggleNotifications(false) },
    { label: 'Unmute All', onClick: () => handleToggleNotifications(true) },
  ]

  return (
    <div className="space-y-8">
      <SettingsSection
        title="Notifications"
        subtitle="Manage your notifications"
        menuItems={menuItems}
      />
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Receive updates and summaries via push notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="all-notifications">Enable All Notifications</Label>
            <Switch
              id="all-notifications"
              checked={profile?.notifications_enabled ?? false}
              onCheckedChange={handleToggleNotifications}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <Label htmlFor="weekly-summary">Weekly Summary</Label>
            <Switch id="weekly-summary" disabled />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <Label htmlFor="product-updates">Product Updates</Label>
            <Switch id="product-updates" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
