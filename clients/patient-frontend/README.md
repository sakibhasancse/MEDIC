# Patient Portal Frontend

Modern, patient-centric healthcare portal built with Next.js, Material UI, and PWA support.

## Features

- 🏥 **Card-Based UI** - Task-centric design, not admin tables
- 📱 **Mobile-First** - Responsive design with bottom navigation
- 🌐 **Offline Support** - PWA with IndexedDB caching
- 🇧🇩 **Bangladesh-Focused** - Bangla language support ready
- 🎨 **Modern Design** - Calm healthcare colors with micro-interactions
- ♿ **Accessible** - WCAG 2.1 compliant

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: Material UI v7
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Offline Storage**: Dexie (IndexedDB)
- **PWA**: @ducanh2912/next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd clients/patient-frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
patient-frontend/
├── app/                      # Next.js app router pages
│   ├── dashboard/           # Patient home dashboard
│   ├── prescriptions/       # Prescription list & viewer
│   ├── appointments/        # Appointments management
│   ├── messages/            # Secure messaging
│   ├── profile/             # Patient profile
│   └── layout.tsx           # Root layout
├── components/
│   ├── Dashboard/           # Dashboard widgets
│   ├── Layout/              # Layout components
│   └── UI/                  # Reusable UI components
├── lib/
│   ├── api.ts              # API client
│   └── db.ts               # IndexedDB setup
├── theme/
│   └── patientTheme.ts     # MUI theme
└── public/
    └── manifest.json        # PWA manifest
```

## Key Pages

- **/** - Landing page with login/register
- **/dashboard** - Patient home with widgets
- **/prescriptions** - Prescription list
- **/prescriptions/[id]** - Prescription viewer
- **/appointments** - Appointments list
- **/profile** - Patient profile
- **/messages** - Secure messaging

## Design System

### Colors

- **Primary**: #0891B2 (Cyan 600) - Calm healthcare blue
- **Accent**: #F59E0B (Amber 500) - Warm accent
- **Success**: #10B981 (Emerald 500)
- **Background**: #F9FAFB (Gray 50)

### Typography

- **Font**: Inter (English), Noto Sans Bengali (Bangla)
- **Base Size**: 16px for readability
- **Line Height**: 1.5 for body text

### Components

- **Cards**: 12px border radius, subtle shadows
- **Buttons**: 44px min height (touch targets)
- **Status Chips**: Color-coded sync status

## Offline Support

The app uses:
- Service Worker for offline caching
- IndexedDB for local data storage
- Background sync for queued actions
- Sync status indicators throughout UI

## Next Steps

1. Implement authentication flow
2. Connect to backend API
3. Add Bangla translations
4. Implement offline sync logic
5. Add appointment booking flow
6. Build messaging interface
7. Create medical history timeline

## License

MIT
