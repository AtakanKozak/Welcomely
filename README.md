# Welcomely - Onboarding Checklist Builder

A modern SaaS application for creating and managing onboarding checklists. Perfect for HR departments, SaaS companies, and small to medium-sized businesses.

![Welcomely](https://via.placeholder.com/1200x630/7c3aed/ffffff?text=Welcomely)

## ✨ Features

- 📝 **Customizable Checklists** - Create and manage onboarding checklists with drag-and-drop ordering
- 📊 **Progress Tracking** - Real-time progress tracking and analytics dashboard
- 🎨 **Template Marketplace** - Pre-built templates for different industries
- 👥 **Multi-user Support** - Invite team members and collaborate
- 🌙 **Dark Mode** - Beautiful dark mode support
- 📱 **Responsive Design** - Works great on desktop and mobile
- 🔒 **Secure Authentication** - Powered by Supabase Auth

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/welcomely.git
   cd welcomely
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API and copy your project URL and anon key
   - Run the SQL schema in your Supabase SQL Editor (see `supabase/schema.sql`)

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/          # Shadcn UI components
│   ├── layout/      # Layout components (sidebar, header)
│   ├── shared/      # Shared components (logo, theme toggle)
│   ├── auth/        # Authentication components
│   ├── dashboard/   # Dashboard specific components
│   ├── checklist/   # Checklist components
│   └── templates/   # Template components
├── pages/
│   ├── auth/        # Login, Signup pages
│   ├── dashboard/   # Dashboard page
│   └── checklists/  # Checklist pages
├── hooks/           # Custom React hooks
├── stores/          # Zustand stores
├── lib/             # Utilities and Supabase client
├── types/           # TypeScript types
├── router/          # React Router configuration
└── App.tsx          # Main app component
```

## 🗄️ Database Schema

The application uses the following tables:

- **profiles** - User profiles (extends Supabase auth)
- **checklists** - User's checklists
- **checklist_items** - Items within checklists
- **templates** - Template marketplace
- **user_progress** - Progress tracking

See `supabase/schema.sql` for the complete schema with RLS policies.

## 🎨 Design System

Welcomely uses a custom design system built on top of Shadcn UI:

- **Primary Color:** Purple (HSL: 262 83.3% 57.8%)
- **Font:** Plus Jakarta Sans
- **Border Radius:** 0.625rem
- **Dark Mode:** Full support with system preference detection

## 📋 Development Roadmap

### Phase 1 - MVP ✅
- [x] User authentication
- [x] Create/Edit/Delete checklists
- [x] Basic dashboard
- [ ] Drag & drop task ordering
- [ ] Mark items as complete

### Phase 2 - Enhanced Features
- [ ] Template marketplace
- [ ] Share checklists (public link)
- [ ] Email notifications
- [ ] Progress analytics with charts
- [ ] Team member invitations

### Phase 3 - Advanced
- [ ] Embed widget for websites
- [ ] Advanced filtering and search
- [ ] Custom branding options
- [ ] Slack/Teams integrations
- [ ] Stripe payment integration

## 🧪 Scripts

```bash
# Development
npm run dev         # Start dev server

# Build
npm run build       # Build for production
npm run preview     # Preview production build

# Linting
npm run lint        # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React, Supabase, and Shadcn UI
