import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Search, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMode } from '@/types/chat'

const modes = [
  {
    id: 'chat' as ChatMode,
    label: 'Chat',
    description: 'Standard conversation',
    icon: MessageCircle,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  {
    id: 'think' as ChatMode,
    label: 'Think',
    description: 'Deep analysis',
    icon: Brain,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
  },
  {
    id: 'search' as ChatMode,
    label: 'Search',
    description: 'Web search',
    icon: Search,
    color: 'bg-green-500/10 text-green-600 border-green-200'
  }
]

export function ModeSelector() {
  // This component is currently not in use and its logic was broken.
  // The useChat() hook call has been replaced with dummy data to fix compilation errors.
  const currentMode = 'chat';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setMode = (_mode: ChatMode) => { /* Dummy function */ };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">AI Mode</h3>
      <div className="grid gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = currentMode === mode.id
          
          return (
            <Button
              key={mode.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start p-3 h-auto"
              onClick={() => setMode(mode.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-md",
                  isActive ? mode.color : "bg-muted"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{mode.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode.description}
                  </p>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
