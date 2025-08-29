import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@/hooks/use-chat'
import { UserProfile } from '@/components/userprofile/UserProfile'
import { 
  MessageSquare, 
  Plus,
  Trash2,
  Loader,
  Bot,
  X,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    selectConversation, 
    deleteConversation, 
    isLoadingHistory 
  } = useChat()

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close mobile menu when selecting conversation
  const handleSelectConversation = (id: string) => {
    selectConversation(id)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  const handleNewConversation = () => {
    createNewConversation()
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  // Mobile menu button (to be placed in your main layout/header)
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )

  // Mobile overlay
  const MobileOverlay = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    />
  )

  const SidebarContent = () => (
    <div className={cn(
      "bg-card flex flex-col h-full transition-all duration-300",
      // Mobile styles
      isMobile ? [
        "fixed top-0 left-0 z-50 w-80 transform transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      ] : [
        // Desktop styles
        "relative",
        isCollapsed ? "w-16" : "w-80"
      ]
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0 h-[69px] flex items-center">
        <div className={cn(
          "flex items-center gap-2 transition-all w-full",
          (!isMobile && isCollapsed) ? 'justify-center' : 'justify-between'
        )}>
          <div className="flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            {(isMobile || !isCollapsed) && (
              <>
                <h1 className="font-bold text-lg">AGI</h1>
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </>
            )}
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex-shrink-0 space-y-2">
        <Button 
          onClick={handleNewConversation}
          className={cn(
            "w-full gap-2 transition-all",
            (!isMobile && isCollapsed) ? "justify-center" : "justify-start"
          )}
          title="Start new conversation"
        >
          <Plus className="h-4 w-4" />
          {(isMobile || !isCollapsed) && "New Chat"}
        </Button>
      </div>

      {/* Conversations History */}
      {/* <Separator className="flex-shrink-0" /> */}
      <div className="flex-1 p-4 overflow-hidden min-h-0">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          (isMobile || !isCollapsed) && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">Start a new chat to begin</p>
            </div>
          )
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <Button
                    variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full text-left h-auto transition-all",
                      (!isMobile && isCollapsed) 
                        ? "justify-center p-2 h-14" 
                        : "justify-start p-2 pr-8"
                    )}
                    onClick={() => handleSelectConversation(conversation.id)}
                    title={conversation.title || 'New Conversation'}
                  >
                    {(!isMobile && isCollapsed) ? (
                      <div className="flex items-center justify-center font-semibold text-lg">
                        {(conversation.title || 'N')[0].toUpperCase()}
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">
                          {conversation.title || 'New Conversation'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </Button>
                  
                  {(isMobile || !isCollapsed) && (
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer with UserProfile */}
      <div className="mt-auto border-t border-border flex-shrink-0">
        <div className={cn(
          "transition-all duration-300",
          (!isMobile && isCollapsed) ? "p-1" : "p-2"
        )}>
          <UserProfile isCompact={!isMobile && isCollapsed} />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />
      
      {/* Sidebar Content */}
      <SidebarContent />
      
      {/* Export the mobile menu button for use in your header */}
      {isMobile && (
        <div className="md:hidden fixed top-4 left-4 z-60">
          <MobileMenuButton />
        </div>
      )}
    </>
  )
}

// Alternative: Separate MobileMenuButton component for header usage
// export const SidebarMobileToggle = ({ 
//   isOpen, 
//   onToggle 
// }: { 
//   isOpen: boolean
//   onToggle: () => void 
// }) => (
//   <Button
//     variant="ghost"
//     size="icon"
//     className="md:hidden"
//     onClick={onToggle}
//   >
//     {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//   </Button>
// )