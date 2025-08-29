import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-pulse">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src="/grok-avatar.png" alt="AGI AI" />
        <AvatarFallback className="bg-primary text-primary-foreground">
          G
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%]">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm text-muted-foreground ml-2">AGI is thinking...</span>
        </div>
      </div>
    </div>
  )
}
