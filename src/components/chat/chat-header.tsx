import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { useChat } from '@/hooks/use-chat'
import { useProfile } from '@/hooks/use-profile'
import { toast } from 'sonner'
import { saveAs } from 'file-saver'
import { Sun, Moon, Monitor, Share2, Download, Copy, FileText } from 'lucide-react'

export function ChatHeader() {
  const { setTheme } = useTheme()
  const { currentConversation, openCopyFallback } = useChat()
  const { profile, updateProfile } = useProfile()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    if (profile) {
      updateProfile({ theme: newTheme })
    }
  }

  const exportConversation = (format: 'json' | 'md') => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      toast.error('No active conversation to export.')
      return
    }

    let fileContent: string;
    let fileExtension: string;

    if (format === 'md') {
      fileContent = `# Conversation: ${currentConversation.title}\n\n`;
      fileContent += currentConversation.messages.map(m => {
        const prefix = m.role === 'user' ? '👤 **You**' : '🤖 **AGI AI**';
        const attachments = m.attachments?.map(a => `\n[Attachment: ${a.name}]`).join('') || '';
        return `${prefix}:\n${m.content}${attachments}`;
      }).join('\n\n---\n\n');
      fileExtension = 'md';
    } else {
      fileContent = JSON.stringify(currentConversation, (key, value) => {
        if (key === 'timestamp' || key === 'created_at' || key === 'updated_at') {
          return new Date(value).toISOString()
        }
        return value
      }, 2)
      fileExtension = 'json';
    }
    
    const blob = new Blob([fileContent], { type: `text/${format};charset=utf-8` });
    saveAs(blob, `grok-conversation-${currentConversation.id}.${fileExtension}`);
    toast.success(`Conversation exported as ${format.toUpperCase()}!`);
  }
  
  const handleShare = async () => {
    if (!currentConversation) {
      toast.error("No active conversation to share.");
      return;
    }
    const shareData = {
      title: `AGI AI Conversation: ${currentConversation.title}`,
      text: 'Check out my conversation with AGI AI!',
      url: window.location.href,
    };

    // 1. Try Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Conversation shared!");
        return; // Success
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // User cancelled, do nothing.
        }
        console.warn("Web Share API failed, falling back.", err);
      }
    }

    // 2. Try Clipboard API
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Share not available, link copied to clipboard!");
            return; // Success
        } catch (err) {
            console.warn("Clipboard API failed, falling back to manual copy.", err);
        }
    }
    
    // 3. Final fallback: manual copy dialog
    toast.warning("Could not share or copy automatically. Please copy the link manually.");
    openCopyFallback(window.location.href);
  }

  const handleCopy = async () => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      toast.error('No conversation to copy.')
      return
    }
    const textToCopy = currentConversation.messages
      .map(m => `${m.role === 'user' ? 'You' : 'AGI AI'}: ${m.content}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Conversation copied to clipboard!");
    } catch (err) {
      console.error("Clipboard write failed: ", err);
      openCopyFallback(textToCopy);
    }
  }

  return (
    <header className="flex items-center justify-end p-4 border-b border-border bg-card/50 backdrop-blur">
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Share options">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy as Text</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Export conversation">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportConversation('md')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as Markdown (.md)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportConversation('json')}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export as JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Change theme">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleThemeChange('light')}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange('system')}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
