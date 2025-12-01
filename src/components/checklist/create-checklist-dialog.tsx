import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateChecklist, checklistKeys } from '@/hooks/use-checklists'
import { CHECKLIST_CATEGORIES } from '@/types'
import { getChecklist } from '@/lib/api/checklists'

const createChecklistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().optional(),
})

type CreateChecklistFormData = z.infer<typeof createChecklistSchema>

interface CreateChecklistDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CreateChecklistDialog({ trigger, onSuccess }: CreateChecklistDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const createChecklist = useCreateChecklist()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateChecklistFormData>({
    resolver: zodResolver(createChecklistSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
  })

  const category = watch('category')

  const onSubmit = async (data: CreateChecklistFormData) => {
    console.log('Creating checklist with data:', data)
    setError(null)
    setIsSubmitting(true)
    
    try {
      const checklist = await createChecklist.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
      })
      
      console.log('Checklist created successfully:', checklist)

      // Ensure caches are fresh before navigating
      await queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: checklistKeys.stats() })
      await queryClient.prefetchQuery({
        queryKey: checklistKeys.detail(checklist.id),
        queryFn: () => getChecklist(checklist.id),
      })

      setOpen(false)
      reset()
      onSuccess?.()

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      navigate(`/checklists/${checklist.id}`)
    } catch (err: any) {
      console.error('Failed to create checklist:', err)
      setError(err?.message || 'Failed to create checklist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setError(null)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Checklist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Checklist</DialogTitle>
            <DialogDescription>
              Create a new onboarding checklist. You can add tasks after creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., New Employee Onboarding"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this checklist is for..."
                className="resize-none"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Checklist
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
