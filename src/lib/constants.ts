import {
  LayoutDashboard,
  Users,
  HardDrive,
  Monitor,
  Smartphone,
} from 'lucide-react'

export const BILLING_HISTORY = [
  {
    id: 'inv_1',
    date: 'Oct 1, 2023',
    amount: '$29.00',
    status: 'Paid',
    invoice: '#INV-2023-001',
  },
  {
    id: 'inv_2',
    date: 'Sep 1, 2023',
    amount: '$29.00',
    status: 'Paid',
    invoice: '#INV-2023-002',
  },
  {
    id: 'inv_3',
    date: 'Aug 1, 2023',
    amount: '$29.00',
    status: 'Paid',
    invoice: '#INV-2023-003',
  },
]

export const ACTIVE_SESSIONS = [
  {
    id: 'sess_1',
    device: 'Chrome on macOS',
    location: 'San Francisco, US',
    lastActive: 'Just now',
    isCurrent: true,
    icon: Monitor,
  },
  {
    id: 'sess_2',
    device: 'Safari on iPhone 13',
    location: 'San Francisco, US',
    lastActive: '2 hours ago',
    isCurrent: false,
    icon: Smartphone,
  },
]

export const USAGE_SUMMARY = [
  {
    title: 'Checklists',
    count: 12,
    limit: 50,
    icon: LayoutDashboard,
  },
  {
    title: 'Team Members',
    count: 4,
    limit: 10,
    icon: Users,
  },
  {
    title: 'Storage',
    count: '1.2 GB',
    limit: '5 GB',
    icon: HardDrive,
  },
]

