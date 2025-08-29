import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './use-auth'
import { Profile } from '@/types/user'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false)
      setProfile(null)
      return
    }
    
    setLoading(true)
    // Use .maybeSingle() to prevent error when no profile exists yet for a new user.
    // It returns null instead of throwing an error if no row is found.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      toast.error('Could not load user profile.')
      setProfile(null)
    } else if (data) {
      setProfile(data)
      // Set the theme based on the user's saved preference
      if (data.theme) {
        setTheme(data.theme)
      }
    } else {
      // Handle case where profile is not yet created by the trigger
      setProfile(null)
    }
    setLoading(false)
  }, [user, setTheme])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      toast.error("You must be logged in to update your profile.")
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update profile.')
      console.error('Error updating profile:', error)
    } else {
      setProfile(data)
      // If the theme was updated, apply it globally
      if (updates.theme) {
        setTheme(updates.theme)
      }
      toast.success('Profile updated!')
    }
  }

  const value = {
    profile,
    loading,
    updateProfile,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
