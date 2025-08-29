import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MessageList } from '@/components/chat/message-list'
import { TypingIndicator } from '@/components/chat/typing-indicator'
import { ChatHeader } from '@/components/chat/chat-header'
import { ModelSelector } from '@/components/chat/model-selector'
import { useChat } from '@/hooks/use-chat'
import { useSettings } from '@/hooks/use-settings'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { Send, Mic, Square, Plus, Image, FileText, X, FlaskConical, BrainCircuit, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Attachment } from '@/types/chat'

export function ChatInterface() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentConversation, sendMessage, isTyping, currentModel } = useChat()
  const { settings } = useSettings()
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    }
  }, [transcript])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return

    await sendMessage(input.trim(), attachments)
    setInput('')
    setAttachments([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      if (currentModel !== 'gemini-1.5-flash') {
        toast.warning('Image uploads are only supported with the Gemini model.');
        return;
      }
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        setAttachments([{
          type: 'image',
          name: file.name,
          url: loadEvent.target?.result as string,
          size: file.size,
        }])
      }
      reader.readAsDataURL(file)
    } else {
      toast.info(`File "${file.name}" attached. Note: File content is not processed in this demo.`)
      setAttachments([{
        type: file.type === 'application/pdf' ? 'pdf' : 'file',
        name: file.name,
        url: '', // No URL needed for non-image files for now
        size: file.size,
      }])
    }
  }

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="flex flex-col h-full">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <ChatHeader />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4">
            {currentConversation ? (
              <>
                <MessageList messages={currentConversation.messages} />
                {isTyping && <TypingIndicator />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/grok-avatar.png" alt="AGI AI" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">G</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">How can I help you today?</h3>
                  <p className="text-muted-foreground">
                    Start a new conversation or select a model to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {attachments.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                {attachments.map((att, index) => (
                  <div key={index} className="relative">
                    {att.type === 'image' && (
                      <img src={att.url} alt={att.name} className="h-16 w-16 object-cover rounded-md" />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative flex items-end gap-2 bg-muted/50 dark:bg-card border border-input rounded-lg focus-within:ring-2 focus-within:ring-ring">
              <div className="absolute left-2 bottom-3 flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 h-8 w-8" title="Attach files">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => triggerFileInput('image/*')}>
                        <Image className="mr-2 h-4 w-4" /> Image
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => triggerFileInput('.pdf')}>
                        <FileText className="mr-2 h-4 w-4" /> PDF
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {isSupported && (
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? 'destructive' : 'ghost'}
                    onClick={isListening ? stopListening : startListening}
                    className="shrink-0 h-8 w-8"
                    title={isListening ? "Stop listening" : "Use voice input"}
                  >
                    {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 h-8 w-8" title="Research Tools">
                      <FlaskConical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start">
                    <DropdownMenuItem onClick={() => navigate('/knowledge-extractor')}>
                      <BrainCircuit className="mr-2 h-4 w-4" /> Knowledge Extractor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/research-assistant')}>
                      <FlaskConical className="mr-2 h-4 w-4" /> Research Assistant
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/citation-formatter')}>
                      <Quote className="mr-2 h-4 w-4" /> Citation Formatter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AGI AI..."
                className={cn(
                  'min-h-[60px] max-h-[200px] resize-none flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                  `text-${settings.fontSize === 'small' ? 'sm' : settings.fontSize === 'large' ? 'lg' : 'base'}`,
                  'pl-36', // Adjusted padding for new icon
                  'pr-32 sm:pr-40'
                )}
                disabled={isTyping}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                <ModelSelector />
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-8 w-8"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{input.length}/2000</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
