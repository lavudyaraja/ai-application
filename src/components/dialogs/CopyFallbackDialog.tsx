import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CopyFallbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  textToCopy: string
}

export function CopyFallbackDialog({ open, onOpenChange, textToCopy }: CopyFallbackDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select()
      toast.info("Text selected. Press Ctrl+C or Cmd+C to copy.")
    }
  }

  // Automatically select text when the dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      // Delay selection slightly to ensure the element is focused
      setTimeout(() => {
        textareaRef.current?.select()
      }, 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Text Manually</DialogTitle>
          <DialogDescription>
            Automatic copying failed. Please select the text below and copy it manually.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={textToCopy}
            readOnly
            className="h-48 resize-none"
          />
          <Button onClick={handleSelectAll} className="w-full">Select All</Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
