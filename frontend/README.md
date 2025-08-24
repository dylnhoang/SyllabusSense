# SyllabusSense

A production-ready Next.js application for intelligent syllabus management. Upload your course syllabi, automatically parse events, and export to your preferred calendar application.

## Features

- **📚 Smart Parsing**: Upload PDF/DOCX syllabi and automatically extract calendar events
- **📅 Event Management**: Review, edit, and organize parsed events in an intuitive table
- **📤 Multiple Export Options**: Download ICS files or sync directly with Google Calendar
- **🎨 Modern UI**: Clean, accessible interface inspired by Linear, Notion, and Grammarly
- **⌨️ Keyboard First**: Comprehensive keyboard shortcuts for power users
- **🌓 Theme Support**: Light, dark, and system theme options
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router, RSC, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **UI Components**: shadcn/ui (Radix primitives)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand for UI state
- **Data Fetching**: TanStack Query for client mutations
- **Authentication**: Supabase Auth (with SSR helpers)
- **File Uploads**: UploadThing integration
- **Tables**: @tanstack/react-table
- **Icons**: lucide-react
- **Theming**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syllabus-sense
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
syllabus-sense/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/       # Marketing pages (optional)
│   ├── login/            # Authentication page
│   ├── dashboard/        # Main dashboard
│   ├── upload/           # Syllabus upload
│   ├── syllabus/[id]/    # Event review & export
│   ├── settings/         # User settings
│   └── api/              # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── events-table/     # Table components
│   └── ...               # Other components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client/server
│   ├── adapters/         # External service adapters
│   └── ...               # Other utilities
└── public/                # Static assets
```

## Usage

### 1. Authentication
- Visit `/login` to sign in with Google
- Mock authentication is enabled for development

### 2. Upload Syllabus
- Navigate to `/upload` or use the dashboard CTA
- Drag and drop PDF/DOCX files
- Supported formats: PDF, DOCX (max 10MB)

### 3. Review Events
- After upload, you'll be redirected to `/syllabus/[id]`
- Review parsed events in the table view
- Use search and filters to find specific events
- Edit event details inline (coming soon)

### 4. Export to Calendar
- **ICS Export**: Download calendar file for any calendar app
- **Google Calendar**: Connect your account for direct syncing

### 5. Keyboard Shortcuts
- `⌘/` or `Ctrl+/`: Show keyboard shortcuts
- `⌘K` or `Ctrl+K`: Focus search
- `E`: Edit selected event
- `⌘S` or `Ctrl+S`: Save changes
- `Esc`: Close modals/cancel editing

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing (coming soon)
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
```

### Adding New Components

1. **Create component file** in `components/` directory
2. **Use shadcn/ui** components when possible
3. **Follow naming conventions**: PascalCase for components
4. **Add TypeScript interfaces** for props
5. **Include accessibility features**: ARIA labels, keyboard navigation

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow the design system in `lib/utils.ts`
- Use CSS variables for theming
- Ensure proper contrast ratios (WCAG AA)
- Support `prefers-reduced-motion`

## Testing

### Unit Tests
- Framework: Vitest + React Testing Library
- Location: `__tests__/` directories
- Run: `npm run test`

### E2E Tests
- Framework: Playwright
- Location: `tests/` directory
- Run: `npm run test:e2e`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
- Build: `npm run build`
- Output: `out/` directory (static export)
- Deploy to any static hosting service

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `UPLOADTHING_SECRET` | UploadThing secret key | Yes |
| `UPLOADTHING_APP_ID` | UploadThing app ID | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [ ] Inline event editing
- [ ] Bulk event operations
- [ ] Microsoft Outlook integration
- [ ] Advanced parsing algorithms
- [ ] Team collaboration features
- [ ] Mobile app (React Native)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.syllabussense.com](https://docs.syllabussense.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/syllabus-sense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/syllabus-sense/discussions)

## Acknowledgments

- Design inspiration from Linear, Notion, Grammarly, and Cron
- UI components from shadcn/ui
- Icons from Lucide React
- Calendar functionality inspired by modern calendar applications
