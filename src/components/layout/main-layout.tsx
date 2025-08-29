import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { SettingsProvider } from '@/hooks/use-settings'
import { ChatProvider } from '@/hooks/use-chat'

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // This component is not currently used in the main application flow.
  // It has been patched to fix compilation errors.
  // The main layout is now handled by `ChatPage.tsx` with resizable panels.

  return (
    <SettingsProvider>
      <ChatProvider>
        <div className="flex h-screen bg-background">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
          />
          <main className="flex-1 flex flex-col overflow-hidden" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <ChatInterface />
          </main>
        </div>
      </ChatProvider>
    </SettingsProvider>
  )
}
