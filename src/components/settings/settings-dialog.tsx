import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import { useSettings } from '@/hooks/use-settings'
import { Monitor, Moon, Sun, Volume2, VolumeX } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Size</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => 
                updateSettings({ fontSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Voice Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Voice Input</Label>
              <Switch
                checked={settings.voiceInput}
                onCheckedChange={(checked) => 
                  updateSettings({ voiceInput: checked })
                }
              />
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Sound Effects</Label>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => 
                  updateSettings({ soundEnabled: checked })
                }
              />
            </div>
            
            {settings.soundEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Volume</Label>
                  <div className="flex items-center gap-2">
                    {settings.volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground w-8">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[settings.volume]}
                  onValueChange={(value) => 
                    updateSettings({ volume: value[0] })
                  }
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Animation Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Animations</Label>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => 
                  updateSettings({ animations: checked })
                }
              />
            </div>
          </div>

          {/* Auto-scroll Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Auto-scroll to new messages</Label>
              <Switch
                checked={settings.autoScroll}
                onCheckedChange={(checked) => 
                  updateSettings({ autoScroll: checked })
                }
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
