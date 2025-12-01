import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'

interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  multiline?: boolean
  disabled?: boolean
  showEditIcon?: boolean
}

export function EditableText({
  value,
  onSave,
  placeholder = 'Click to edit',
  className,
  inputClassName,
  multiline = false,
  disabled = false,
  showEditIcon = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue !== value) {
      onSave(trimmedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && multiline && e.metaKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (disabled) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {value || placeholder}
      </span>
    )
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input

    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full',
          multiline && 'min-h-[60px] resize-none',
          inputClassName
        )}
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1 transition-colors inline-flex items-center gap-1 group',
        !value && 'text-muted-foreground italic',
        className
      )}
    >
      {value || placeholder}
      {showEditIcon && (
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </span>
  )
}

interface EditableTitleProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span'
}

export function EditableTitle({
  value,
  onSave,
  placeholder = 'Untitled',
  className,
  as: Component = 'h1',
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue)
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn('font-bold text-2xl h-auto py-1 px-2', className)}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2 py-1 transition-colors',
        !value && 'text-muted-foreground italic',
        className
      )}
    >
      {value || placeholder}
    </Component>
  )
}

