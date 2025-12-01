import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

interface ShareChecklistDialogProps {
  open: boolean
  onClose: () => void
  checklistId: string
  isPublic: boolean
  onTogglePublic: (value: boolean) => Promise<void> | void
}

export function ShareChecklistDialog({
  open,
  onClose,
  checklistId,
  isPublic,
  onTogglePublic,
}: ShareChecklistDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/shared/${checklistId}`
  }, [checklistId])

  const handleCopy = async () => {
    if (copied) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Share checklist</DialogTitle>
          <DialogDescription>
            Create a public link so teammates and stakeholders can view this checklist in read-only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Public access</p>
              <p className="text-xs text-muted-foreground">
                {isPublic ? 'Anyone with the link can view this checklist.' : 'Only you can view this checklist.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="share-toggle" className="text-xs text-muted-foreground">
                {isPublic ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="share-toggle"
                checked={isPublic}
                onCheckedChange={(value) => onTogglePublic(value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-link">Shareable link</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="bg-muted/40"
              />
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            Anyone with the link can only view the checklist. Edits require logging into Welcomely with the correct permissions.
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


