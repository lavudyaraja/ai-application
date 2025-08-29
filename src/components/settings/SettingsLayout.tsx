import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Palette,
  Fingerprint,
  Link,
  Database,
  User,
  Shield,
  ArrowLeft,
  KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { General } from './tabs/General'
import { Notifications } from './tabs/Notifications'
import { Personalization } from './tabs/Personalization'
import { ConnectedApps } from './tabs/ConnectedApps'
import { DataControls } from './tabs/DataControls'
import { Security } from './tabs/Security'
import { Account } from './tabs/Account'
import { DeveloperKeys } from './tabs/DeveloperKeys'

const navItems = [
  { id: 'general', label: 'General', icon: User, component: General },
  { id: 'personalization', label: 'Personalization', icon: Palette, component: Personalization },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: Notifications },
  { id: 'security', label: 'Security & Login', icon: Shield, component: Security },
  { id: 'account', label: 'Account', icon: Fingerprint, component: Account },
  { id: 'connected-apps', label: 'Connected Apps', icon: Link, component: ConnectedApps },
  { id: 'data-controls', label: 'Data Controls', icon: Database, component: DataControls },
  { id: 'developer-keys', label: 'Developer Keys', icon: KeyRound, component: DeveloperKeys },
]

export function SettingsLayout() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || General

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col w-full">
        <header className="flex items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-border p-4 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </aside>
          <main className="flex-1 p-8 overflow-y-auto">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </div>
  )
}
