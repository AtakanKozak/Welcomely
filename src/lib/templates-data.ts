export type TemplateTask = {
  title: string
  description?: string
}

export type ChecklistTemplate = {
  id: string
  name: string
  description: string
  category: string
  tasks: TemplateTask[]
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'template-hr-onboarding',
    name: 'HR Onboarding Essentials',
    description: 'Standard employee onboarding checklist for HR teams.',
    category: 'HR Onboarding',
    tasks: [
      {
        title: 'Send welcome email & day-one agenda',
        description: 'Include arrival time, parking info, and buddy assignment.',
      },
      {
        title: 'Collect signed documents',
        description: 'Offer letter, NDA, tax forms, and employee handbook.',
      },
      {
        title: 'IT account provisioning',
        description: 'Email, Slack, HRIS, payroll, and benefits portals.',
      },
      {
        title: 'Workspace & equipment setup',
      },
      {
        title: 'Schedule manager kick-off meeting',
        description: 'Review goals, expectations, and introduce team.',
      },
    ],
  },
  {
    id: 'template-customer-onboarding',
    name: 'Customer Onboarding (SaaS)',
    description: 'Guide new customers from kickoff to first value.',
    category: 'Customer Onboarding',
    tasks: [
      {
        title: 'Kickoff call with stakeholders',
        description: 'Confirm success criteria, timeline, and communication plan.',
      },
      {
        title: 'Configure workspace & permissions',
      },
      {
        title: 'Import initial data set',
      },
      {
        title: 'Admin training session',
        description: 'Live session + record for future users.',
      },
      {
        title: 'First value milestone check-in',
        description: 'Review adoption metrics after 14 days.',
      },
    ],
  },
  {
    id: 'template-project-setup',
    name: 'Project Kickoff Plan',
    description: 'Reusable template for launching new internal projects.',
    category: 'Project Setup',
    tasks: [
      { title: 'Define scope & success metrics' },
      { title: 'Identify stakeholders and roles' },
      { title: 'Draft project timeline and milestones' },
      { title: 'Set up project workspace & tools' },
      { title: 'Schedule kickoff meeting' },
      {
        title: 'Share kickoff recap',
        description: 'Email summary, next steps, owners, and due dates.',
      },
    ],
  },
  {
    id: 'template-sales-process',
    name: 'Sales Process Journey',
    description: 'Repeatable sales workflow from lead to customer.',
    category: 'Sales Process',
    tasks: [
      { title: 'Qualify inbound lead', description: 'Use BANT & ICP checklist.' },
      { title: 'Discovery call & pain mapping' },
      { title: 'Demo / value presentation' },
      { title: 'Send tailored proposal' },
      { title: 'Negotiate & handle objections' },
      { title: 'Finalize contract & counter-sign' },
      { title: 'Hand off to customer success' },
    ],
  },
  {
    id: 'template-product-launch',
    name: 'Product Launch GTM',
    description: 'Coordinate cross-functional go-to-market launches.',
    category: 'Product Launch',
    tasks: [
      { title: 'Finalize launch messaging & positioning' },
      { title: 'Enable sales with launch deck & FAQ' },
      { title: 'Publish blog & email announcement' },
      { title: 'Schedule social media campaign' },
      { title: 'Ship in-app announcement' },
      { title: 'Launch day stand-up & war room' },
      { title: 'Gather metrics & retro' },
    ],
  },
  {
    id: 'template-implementation',
    name: 'Implementation Blueprint',
    description: 'Detailed steps for professional services engagements.',
    category: 'Customer Onboarding',
    tasks: [
      { title: 'Kickoff & solution design workshop' },
      { title: 'Document technical requirements' },
      { title: 'Configure environments & integrations' },
      { title: 'User acceptance testing' },
      { title: 'Enablement & knowledge transfer' },
      { title: 'Go-live & hypercare period' },
    ],
  },
]


