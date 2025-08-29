import { FC, Children, ReactElement } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useChat } from '@/hooks/use-chat'

interface CodeBlockProps {
  children?: React.ReactNode;
}

export const CodeBlock: FC<CodeBlockProps> = ({ children }) => {
  const [hasCopied, setHasCopied] = useState(false)
  const { openCopyFallback } = useChat()
  
  // Extract props from the `code` element that react-markdown passes as children
  const codeElement = Children.only(children) as ReactElement<{ className?: string; children: React.ReactNode }>;
  const { className, children: codeString } = codeElement.props;
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : 'text'
  const finalCodeString = String(codeString).replace(/\n$/, '')

  const handleCopy = async () => {
    // Check if clipboard API is available and permissions are granted
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      console.log("Clipboard API not available, using fallback");
      openCopyFallback(finalCodeString);
      return;
    }

    try {
      // Check if we have clipboard write permission
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      
      if (permission.state === 'denied') {
        console.log("Clipboard permission denied, using fallback");
        openCopyFallback(finalCodeString);
        return;
      }

      await navigator.clipboard.writeText(finalCodeString)
      setHasCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error("Clipboard write failed: ", err);
      
      // Handle specific clipboard errors
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('permissions policy')) {
          console.log("Clipboard blocked by permissions policy, using fallback");
          toast.info('Using fallback copy method');
        } else {
          console.log("Other clipboard error, using fallback");
          toast.error('Copy failed, using fallback method');
        }
      }
      
      openCopyFallback(finalCodeString);
    }
  }

  return (
    <div className="relative my-4 rounded-lg bg-[#282c34] overflow-hidden border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20">
        <span className="text-xs text-muted-foreground font-sans">{lang}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          onClick={handleCopy}
        >
          {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
      >
        {finalCodeString}
      </SyntaxHighlighter>
    </div>
  )
}