import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { ProfileProvider } from '@/hooks/use-profile'
import { ChatProvider } from '@/hooks/use-chat'
import { SettingsProvider } from '@/hooks/use-settings'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ChatPage } from '@/pages/ChatPage'
import { LoginPage } from '@/pages/LoginPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { KnowledgeExtractorPage } from '@/pages/KnowledgeExtractorPage'
// import { ResearchAssistantPage } from '@/pages/ResearchAssistantPage'
// import { CitationFormatterPage } from '@/pages/CitationFormatterPage'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="grok-ui-theme">
        <SettingsProvider>
          <AuthProvider>
            <ProfileProvider>
              <ChatProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<ChatPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/knowledge-extractor" element={<KnowledgeExtractorPage />} />
                    {/* <Route path="/research-assistant" element={<ResearchAssistantPage />} /> */}
                    {/* <Route path="/citation-formatter" element={<CitationFormatterPage />} /> */}
                  </Route>
                </Routes>
                <Toaster />
              </ChatProvider>
            </ProfileProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
