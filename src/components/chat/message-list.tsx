import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy, ThumbsUp, ThumbsDown, FileIcon, Volume2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './code-block'
import { useChat } from '@/hooks/use-chat'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useProfile } from '@/hooks/use-profile'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const { openCopyFallback } = useChat()
  const { isSpeaking, speak, stop } = useTextToSpeech();
  const { profile } = useProfile();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error("Clipboard write failed: ", err);
      openCopyFallback(text);
    }
  }

  const formatTimestamp = (createdAt: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(createdAt)
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="group">
          <div className={cn(
            "flex gap-4",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}>
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/grok-avatar.png" alt="AGI AI" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  G
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              message.role === 'user' ? "order-1" : ""
            )}>
              <div className={cn(
                "rounded-lg px-4 py-3",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted",
                message.error && "bg-destructive/20 border border-destructive"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs opacity-70">
                    {message.role === 'user' ? 'You' : 'AGI AI'}
                  </span>
                  <span className="text-xs opacity-50">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="my-2 space-y-2">
                    {message.attachments.map((att, index) => (
                      <div key={index} className="rounded-md overflow-hidden border border-border">
                        {att.type === 'image' ? (
                          <img src={att.url} alt={att.name} className="max-w-full max-h-64 object-contain" />
                        ) : (
                          <div className="p-2 bg-secondary/50 flex items-center gap-2">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:whitespace-pre-wrap prose-p:leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
                    {message.content}
                  </ReactMarkdown>
                </div>

                {message.error && (
                  <div className="mt-2 text-xs text-destructive-foreground/80 flex items-center gap-2 p-2 bg-destructive/50 rounded-md">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{message.error}</span>
                  </div>
                )}
              </div>
              
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    if (isSpeaking) stop();
                    else speak(message.content, profile?.language || 'en-US');
                  }} title={isSpeaking ? "Stop speaking" : "Read aloud"}>
                    <Volume2 className={cn("h-3 w-3", isSpeaking && "text-primary animate-pulse")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  You
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
