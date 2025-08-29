import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProfile } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsSection } from '../SettingsSection'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { toast } from 'sonner'

const apiKeysSchema = z.object({
  openai: z.string().optional(),
  claude: z.string().optional(),
  gemini: z.string().optional(),
  grok: z.string().optional(),
})

type ApiKeysFormValues = z.infer<typeof apiKeysSchema>

export function DeveloperKeys() {
  const { profile, updateProfile, loading } = useProfile()

  const defaultValues = {
    openai: profile?.settings?.api_keys?.openai || '',
    claude: profile?.settings?.api_keys?.claude || '',
    gemini: profile?.settings?.api_keys?.gemini || '',
    grok: profile?.settings?.api_keys?.grok || '',
  }

  const form = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues,
    values: defaultValues, // ensures form updates when profile loads
  })

  const onSubmit = async (data: ApiKeysFormValues) => {
    if (!profile) {
      toast.error("Profile not loaded yet. Please wait a moment and try again.")
      return
    }
    
    const newSettings = {
      ...profile.settings,
      api_keys: data,
    }
    
    await updateProfile({ settings: newSettings })
  }
  
  const menuItems = [
    { label: 'API Documentation', onClick: () => window.open('https://alpha.dualite.dev/docs', '_blank') },
    { label: 'Clear All Keys', onClick: () => {
        form.reset({ openai: '', claude: '', gemini: '', grok: '' })
        toast.info("Fields cleared. Click 'Save Keys' to confirm.")
    }},
  ]

  return (
    <div className="space-y-8">
      <SettingsSection
        title="Developer Keys"
        subtitle="Provide your own API keys to use different models."
        menuItems={menuItems}
      />

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Handle with care!</AlertTitle>
        <AlertDescription>
          Your API keys are stored in your user profile in the database. While we take precautions, never share your keys publicly.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Enter your personal API keys below. The application's default keys will be used if a field is left empty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="openai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>For models like GPT-4 Turbo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anthropic (Claude) API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-ant-..." {...field} />
                    </FormControl>
                    <FormDescription>For models like Claude 3 Opus.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gemini"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google (Gemini) API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="AIzaSy..." {...field} />
                    </FormControl>
                    <FormDescription>Overrides the default app key for Gemini models.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grok API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Grok API Key (when available)" {...field} />
                    </FormControl>
                    <FormDescription>For xAI's Grok model (not yet public).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Keys'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
