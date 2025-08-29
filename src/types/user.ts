export interface Profile {
  id: string; // This is the user_id from auth.users
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  theme: 'light' | 'dark' | 'system';
  language: string;
  settings: {
    api_keys?: {
      openai?: string;
      claude?: string;
      gemini?: string;
      grok?: string;
    }
  };
  notifications_enabled: boolean;
  subscription_plan: 'free' | 'pro';
  last_active: string;
}
