import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Search,
  Book,
  Video,
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useProfile } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Validation Schema for Contact Form
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

// Mock FAQ Data
const FAQS = [
  {
    question: 'How do I invite team members?',
    answer: 'Go to the Team page from the sidebar and click "Invite Member". Enter their email address and select a role (Admin, Member, or Viewer). They will receive an email invitation.',
  },
  {
    question: 'Can I customize the checklist branding?',
    answer: 'Yes! Navigate to Settings > General & Branding. You can upload your workspace logo and set your primary brand color. These changes will be reflected on all public shared checklists.',
  },
  {
    question: 'How do templates work?',
    answer: 'Templates are pre-built checklists. You can browse the Template Marketplace to find a starting point. Clicking "Use Template" creates a copy in your workspace that you can fully customize.',
  },
  {
    question: 'What happens when I share a checklist?',
    answer: 'Sharing a checklist generates a unique public link. Anyone with this link can view the checklist in a read-only mode. You can toggle public access on/off at any time from the checklist detail page.',
  },
  {
    question: 'Is there a limit to how many checklists I can create?',
    answer: 'On the Pro Plan, you can create unlimited checklists. The Free tier is limited to 5 active checklists.',
  },
]

const TROUBLESHOOTING = [
  {
    question: 'My client can\'t access the shared checklist',
    answer: 'Ensure that "Public Access" is enabled in the Share dialog. If it is enabled, try regenerating the link or checking if the client has a firewall blocking the connection.',
  },
  {
    question: 'Branding doesn\'t update on shared views',
    answer: 'Branding updates might take a few minutes to propagate to the CDN. Try clearing your browser cache or opening the link in an Incognito window.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg bg-card transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left font-medium transition-colors hover:bg-accent/50"
      >
        {question}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground animate-fade-in">
          <Separator className="mb-4" />
          {answer}
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const { toast } = useToast()
  const profile = useProfile()
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: profile?.full_name || '',
      email: profile?.email || '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = (data: ContactFormValues) => {
    console.log('Support request:', data)
    toast({
      title: 'Message sent',
      description: 'We have received your support request and will get back to you shortly.',
    })
    form.reset({
      name: profile?.full_name || '',
      email: profile?.email || '',
      subject: '',
      message: '',
    })
  }

  const quickLinks = [
    { title: 'Getting Started', icon: Book, description: 'Learn the basics of Welcomely' },
    { title: 'Video Tutorials', icon: Video, description: 'Watch step-by-step guides' },
    { title: 'FAQs', icon: HelpCircle, description: 'Common questions answered' },
    { title: 'API Docs', icon: Code2, description: 'Integrate with your stack' },
  ]

  return (
    <div className="container max-w-5xl py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How can we help you?</h1>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search help articles, troubleshooting..." 
            className="pl-10 h-12 text-base shadow-sm"
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Card key={link.title} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{link.title}</CardTitle>
              <CardDescription className="mt-1">{link.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Troubleshooting
            </h2>
            <div className="space-y-3">
              {TROUBLESHOOTING.map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-md border-primary/20">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register('name')} placeholder="Your name" />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...form.register('email')} placeholder="your@email.com" />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" {...form.register('subject')} placeholder="How can we help?" />
                  {form.formState.errors.subject && (
                    <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    {...form.register('message')} 
                    placeholder="Describe your issue..." 
                    className="min-h-[120px] resize-none"
                  />
                  {form.formState.errors.message && (
                    <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

