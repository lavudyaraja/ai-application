import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { useChat } from '@/hooks/use-chat'
import { CopyFallbackDialog } from '@/components/dialogs/CopyFallbackDialog'

export function ChatPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { copyInfo, closeCopyFallback } = useChat();

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-screen w-full"
        onLayout={(sizes: number[]) => {
          if (sizes[0] < 15) {
            setIsCollapsed(true);
          } else {
            setIsCollapsed(false);
          }
        }}
      >
        <ResizablePanel
          defaultSize={20}
          minSize={5}
          maxSize={30}
          collapsedSize={5}
          collapsible={true}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className="min-w-[80px]"
        >
          <Sidebar isCollapsed={isCollapsed} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ChatInterface />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <CopyFallbackDialog 
        open={copyInfo.open}
        onOpenChange={(isOpen) => !isOpen && closeCopyFallback()}
        textToCopy={copyInfo.text}
      />
    </>
  )
}
