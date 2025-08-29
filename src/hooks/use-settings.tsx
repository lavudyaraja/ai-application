import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Settings {
  fontSize: 'small' | 'medium' | 'large'
  voiceInput: boolean
  soundEnabled: boolean
  volume: number
  animations: boolean
  autoScroll: boolean
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  fontSize: 'medium',
  voiceInput: false,
  soundEnabled: true,
  volume: 0.5,
  animations: true,
  autoScroll: true
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grok-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsedSettings })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('grok-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [settings])

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
