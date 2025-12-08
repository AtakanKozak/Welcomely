import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Reusable Legal Document Modal Component
 * 
 * Features:
 * - Accessible modal with focus trap
 * - Keyboard navigation (ESC to close, Tab cycling)
 * - Smooth animations
 * - Mobile responsive (full screen on mobile)
 * - Table of contents with anchor links
 * - Download/print option
 */

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  lastUpdated: string
  children: ReactNode
  onAccept?: () => void
  showAcceptButton?: boolean
}

export function LegalModal({
  isOpen,
  onClose,
  title,
  lastUpdated,
  children,
  onAccept,
  showAcceptButton = false,
}: LegalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      // Focus the close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 100)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      // Return focus to trigger element
      previousActiveElement.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      }

      // Focus trap - cycle through focusable elements
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle print/download
  const handlePrint = useCallback(() => {
    const printContent = modalRef.current?.querySelector('.legal-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Welcomely</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { font-size: 28px; margin-bottom: 8px; }
                h2 { font-size: 20px; margin-top: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; }
                h3 { font-size: 16px; margin-top: 24px; }
                p, li { line-height: 1.7; color: #374151; }
                ul { padding-left: 24px; }
                .date { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
                a { color: #8b5cf6; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <p class="date">Last Updated: ${lastUpdated}</p>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }, [title, lastUpdated])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      aria-describedby="legal-modal-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={cn(
          "relative bg-[#0f1419] border border-white/10 w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[800px] sm:rounded-2xl",
          "flex flex-col overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-300",
          // Mobile: slide up animation
          "max-sm:animate-in max-sm:slide-in-from-bottom max-sm:duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 id="legal-modal-title" className="text-xl sm:text-2xl font-bold text-white">
              {title}
            </h2>
            <p id="legal-modal-description" className="text-sm text-gray-400 mt-1">
              Last Updated: {lastUpdated}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Print/Download button */}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Download or print document"
              title="Download / Print"
            >
              <Download className="w-5 h-5" />
            </button>
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth legal-content">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-white/10 shrink-0 bg-[#0f1419]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Close
          </button>
          {showAcceptButton && onAccept && (
            <button
              onClick={() => {
                onAccept()
                onClose()
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-lg transition-all duration-300"
            >
              Accept and Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Table of Contents Component for Legal Documents
 */
interface TableOfContentsProps {
  sections: Array<{ id: string; title: string }>
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Section Component for Legal Documents
 */
interface LegalSectionProps {
  id: string
  title: string
  children: ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="mb-8 scroll-mt-4">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
        {title}
      </h2>
      <div className="text-gray-300 text-sm sm:text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}

/**
 * Subsection Component
 */
interface LegalSubsectionProps {
  title: string
  children: ReactNode
}

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      <div className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

/**
 * Contact Info Component
 */
interface ContactInfoProps {
  email: string
  label: string
}

export function ContactEmail({ email, label }: ContactInfoProps) {
  return (
    <p>
      <strong className="text-white">{label}:</strong>{' '}
      <a 
        href={`mailto:${email}`}
        className="text-purple-400 hover:text-purple-300 underline transition-colors"
      >
        {email}
      </a>
    </p>
  )
}

