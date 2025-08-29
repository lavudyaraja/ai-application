import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SettingsSection } from '../SettingsSection'
import { useChat } from '@/hooks/use-chat'
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog'

export function DataControls() {
  const { exportAllData, deleteAllData } = useChat()
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const handleDelete = async () => {
    toast.info("Deleting all your conversation data...")
    await deleteAllData()
    setIsDeleteConfirmOpen(false)
  }

  const menuItems = [
    { label: 'Export Data', onClick: exportAllData },
    { label: 'Delete Data', onClick: () => setIsDeleteConfirmOpen(true) },
    { label: 'Privacy Settings', onClick: () => toast.info('Opening privacy settings...') },
  ]

  return (
    <>
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="Delete all conversations?"
        description="This will permanently delete all your chat history. This action cannot be undone."
        confirmText="Yes, delete everything"
      />
      <div className="space-y-8">
        <SettingsSection
          title="Data Controls"
          subtitle="Manage your data preferences"
          menuItems={menuItems}
        />
        <Card>
          <CardHeader>
            <CardTitle>Export Your Data</CardTitle>
            <CardDescription>Download a copy of all your conversations and account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAllData}>Export All Data</Button>
          </CardContent>
        </Card>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete All Data</CardTitle>
            <CardDescription>Permanently delete all of your conversations. This action is not reversible.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>Delete All Conversations</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
