import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useSettings } from '@/hooks/use-settings'
import { useProfile } from '@/hooks/use-profile'
import { Monitor, Moon, Sun } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog'

export function Personalization() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()
  const { profile, updateProfile } = useProfile()
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    if (profile) {
      updateProfile({ theme: newTheme })
    }
  }
  
  const handleLanguageChange = (newLanguage: string) => {
    if (profile) {
      updateProfile({ language: newLanguage });
    }
  };

  const handleReset = () => {
    // Reset local settings
    updateSettings({
      fontSize: 'medium',
      animations: true,
    })
    // Reset theme and language in profile
    handleThemeChange('system')
    handleLanguageChange('en-US')
    toast.success("Personalization settings have been reset.")
    setIsResetConfirmOpen(false)
  }

  const menuItems = [
    { label: 'Adjust Layout', onClick: () => toast.info('Layout settings are coming soon!') },
    { label: 'Reset Preferences', onClick: () => setIsResetConfirmOpen(true) },
  ]

  return (
    <>
      <ConfirmationDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        onConfirm={handleReset}
        title="Reset personalization settings?"
        description="This will reset your theme and appearance settings to their default values."
      />
      <div className="space-y-8">
        <SettingsSection
          title="Personalization"
          subtitle="Customize your experience"
          menuItems={menuItems}
        />

        <Card>
          <CardHeader>
            <CardTitle>Theme & Language</CardTitle>
            <CardDescription>Select a theme and language. This will be saved to your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex items-center justify-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex items-center justify-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex items-center justify-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
             <div>
              <Label htmlFor="language-select">Speech Language</Label>
              <Select
                value={profile?.language || 'en-US'}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language-select" className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                  <SelectItem value="te-IN">Telugu (India)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Adjust other visual settings (saved locally).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="font-size">Font Size</Label>
                <p className="text-sm text-muted-foreground">Adjust the font size for readability.</p>
              </div>
              <Select
                value={settings.fontSize}
                onValueChange={(value: 'small' | 'medium' | 'large') =>
                  updateSettings({ fontSize: value })
                }
              >
                <SelectTrigger id="font-size" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-muted-foreground">Enable or disable UI animations.</p>
              </div>
              <Switch
                id="animations"
                checked={settings.animations}
                onCheckedChange={(checked) => updateSettings({ animations: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
