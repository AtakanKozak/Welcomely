# Welcomely - AI-Powered Onboarding Platform

<div align="center">

![Welcomely Logo](public/welcomely.svg)

**Your AI-Powered Onboarding Universe**

Create seamless onboarding experiences with intelligent workflows and automated task management.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-welcomely.vercel.app-purple?style=for-the-badge)](https://welcomely.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

</div>

---

## ✨ Features

### 🔐 Authentication
- **Email/Password** - Secure signup and login with form validation
- **Google OAuth** - One-click sign in with Google
- **Password Reset** - Forgot password functionality with email reset
- **Session Management** - Persistent sessions with automatic refresh

### 📋 Checklist Management
- **Create & Edit** - Build custom onboarding checklists
- **Drag & Drop** - Reorder tasks with intuitive drag and drop
- **Progress Tracking** - Real-time completion tracking
- **Due Dates** - Set deadlines for individual tasks
- **Categories** - Organize checklists by category

### 📊 Dashboard
- **Analytics** - Visual progress charts and statistics
- **Recent Activity** - Track recent checklist updates
- **Upcoming Tasks** - View tasks due in the next 7 days
- **Quick Actions** - Fast access to common operations

### 👥 Team Collaboration
- **Team Invitations** - Invite members via email
- **Role Management** - Admin and member roles
- **Shared Checklists** - Collaborate on checklists
- **Public Sharing** - Generate shareable links

### 🎨 Modern UI/UX
- **Dark/Light Mode** - System preference detection
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Polished transitions
- **Loading Skeletons** - Optimistic UI updates

### 📜 Legal Compliance
- **Terms of Service** - Comprehensive legal documentation
- **Privacy Policy** - GDPR & CCPA compliant
- **Cookie Policy** - Transparent data practices

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript 5.6, Vite |
| **Styling** | Tailwind CSS 4, Shadcn UI |
| **State** | Zustand, TanStack Query |
| **Forms** | React Hook Form, Zod |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **Deployment** | Vercel |
| **Icons** | Lucide React |
| **Charts** | Recharts |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AtakanKozak/Welcomely.git
   cd Welcomely
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema in your Supabase SQL Editor (see `supabase/schema.sql`)
   - Enable Google OAuth provider (optional)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── layout/          # Layout (sidebar, header, nav)
│   ├── shared/          # Shared components (logo, theme toggle)
│   ├── auth/            # Protected route component
│   ├── dashboard/       # Dashboard widgets
│   ├── checklist/       # Checklist components
│   └── legal/           # Terms & Privacy modals
├── pages/
│   ├── auth/            # Login, Signup, Callback, Reset
│   ├── dashboard/       # Main dashboard
│   ├── checklists/      # Checklist list & detail
│   ├── templates/       # Template marketplace
│   ├── team/            # Team management
│   ├── settings/        # User settings
│   └── help/            # Help & support
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores (auth, theme)
├── lib/                 # Utilities, API, Supabase client
├── types/               # TypeScript type definitions
├── router/              # React Router configuration
└── App.tsx              # Main app with QueryClient
```

---

## 🔧 Supabase Configuration

### Required Tables

- **profiles** - User profiles (extends Supabase auth)
- **checklists** - User's checklists
- **checklist_items** - Items within checklists
- **templates** - Template marketplace
- **user_progress** - Progress tracking
- **team_members** - Team member relationships
- **team_invitations** - Pending invitations

### OAuth Setup (Google)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth Client ID and Secret
4. Configure redirect URLs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### Email Templates

Customize email templates in Authentication → Email Templates:
- Confirmation email
- Password reset email
- Magic link email

---

## 🎨 Design System

| Property | Value |
|----------|-------|
| **Primary Color** | Purple (`hsl(262, 83.3%, 57.8%)`) |
| **Font Family** | Plus Jakarta Sans |
| **Border Radius** | 0.625rem (10px) |
| **Dark Background** | `#0a0a0f` |

### Color Palette

```css
--color-primary: hsl(262 83.3% 57.8%);
--color-background: hsl(224 71.4% 4.1%);
--color-foreground: hsl(210 20% 98%);
--color-muted: hsl(215 27.9% 16.9%);
--color-accent: hsl(215 27.9% 16.9%);
```

---

## 📋 Scripts

```bash
# Development
npm run dev          # Start dev server on port 5173

# Build
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

---

## 🗺️ Roadmap

### ✅ Completed

- [x] User authentication (Email/Password + Google OAuth)
- [x] Password reset functionality
- [x] Create/Edit/Delete checklists
- [x] Task completion tracking
- [x] Progress dashboard with charts
- [x] Team member invitations
- [x] Public checklist sharing
- [x] Dark/Light mode
- [x] Responsive design
- [x] Legal documents (Terms & Privacy)
- [x] Optimistic UI updates
- [x] React Query caching

### 🚧 In Progress

- [ ] Template marketplace
- [ ] Email notifications
- [ ] Advanced analytics

### 📅 Planned

- [ ] Embed widget for websites
- [ ] Slack/Teams integrations
- [ ] Custom branding options
- [ ] Stripe payment integration
- [ ] AI-powered suggestions

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Email**: support@welcomely.io
- **Privacy**: privacy@welcomely.io
- **Legal**: legal@welcomely.io

---

<div align="center">

Built with ❤️ using React, Supabase, and Tailwind CSS

**[⬆ Back to Top](#welcomely---ai-powered-onboarding-platform)**

</div>
