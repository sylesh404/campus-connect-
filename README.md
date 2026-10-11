# ⚡ CampusConnect — Smart Campus Event Management & Community Platform

> **Electric, Gen-Z styled Neo-Brutalist Progressive Web App (PWA)** for discovering campus events, instant QR ticket check-ins, real-time community Q&A message boards, and organizer analytics.

![CampusConnect](https://img.shields.io/badge/CampusConnect-v1.0.0-7400E8?style=for-the-badge&logo=react)
![PWA Ready](https://img.shields.io/badge/PWA-Installable-FFF500?style=for-the-badge&logo=pwa)
![Convex](https://img.shields.io/badge/Backend-Convex-00FF75?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-FF2D92?style=for-the-badge)

---

## 💥 What is CampusConnect?

**CampusConnect** is a production-grade campus event portal built with high-contrast neo-brutalist aesthetics (electric purple, neon green, bright yellow, thick black borders, sticker UI, and heavy drop shadows). 

It allows students and attendees to browse events, join discussions, register instantly, and receive digital QR tickets—all while organizers manage live check-ins, send announcements, and inspect real-time participation analytics.

---

## ✨ Key Features & Capabilities

### ⚡ Boom Launch Experience
- **Interactive Splash Screen**: Animated Gen-Z launch intro with particle FX, starburst animations, and automatic transition into the home dashboard.

### 🎯 Participant Experience
- **Event Discovery & Filtering**: Search events by category (*Technical, Workshop, Cultural, Seminar, Sports*) or date filters.
- **"Always-On" Event Registration**: Dedicated "JOIN EVENT" call-to-action on every event page with instant ticket generation.
- **QR Code Mobile Tickets**: Instant digital QR code tickets downloadable or viewable on mobile devices.
- **Community Message Board**: Instant Q&A and discussion thread posting with AI answer suggestions and photo galleries.
- **Attendance History**: Log of past registered events and ticket status.

### 👔 Organizer Suite
- **Event Creator**: Create and publish campus events with participant capacity limits.
- **Real-Time Analytics**: Dashboard tracking registrations, check-in rates, and engagement.
- **Live QR Scanner**: Mobile QR scanner for rapid gate check-in.
- **Event Management**: Edit or delete events with full cascade updates.

### 📱 Full Progressive Web App (PWA)
- **Installable**: Install directly on iOS (Safari) and Android (Chrome) home screens.
- **Offline & Caching**: Service Worker pre-caching with Workbox runtime caching.
- **Mobile First**: Fully responsive layouts tuned for all screen resolutions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + Vite |
| **Language** | TypeScript |
| **Styling** | Custom Neo-Brutalist CSS + Tailwind CSS |
| **Animations** | Framer Motion |
| **Routing** | React Router (`HashRouter`) |
| **Icons** | Lucide React |
| **Backend & DB** | Convex Serverless DB |
| **PWA & Offline** | Vite PWA Plugin + Workbox Service Worker |
| **QR Generation** | `react-qr-code` & `html2canvas` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/your-username/campus-connect.git

# Navigate into project folder
cd campus-connect

# Install dependencies
npm install
```

### 3. Running Locally
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` (or `http://localhost:5174`) in your browser.

---

## 📱 Mobile Testing & PWA Deployment

### Local Network Access (Wi-Fi)
To open the application on your mobile phone connected to the same Wi-Fi network:
```bash
npx vite --host 0.0.0.0 --port 5173
```
Open `http://<YOUR-LOCAL-IP>:5173` on your mobile browser.

### Installing PWA on Mobile
1. **Android (Chrome)**: Tap `⋮` (3 dots) → Tap **"Install App"** / **"Add to Home Screen"**.
2. **iOS (Safari)**: Tap **Share Icon** → Tap **"Add to Home Screen"**.

---

## 📂 Project Structure

```
Campus-Connect/
├── public/                  # Manifest, PWA icons, assets
│   ├── manifest.json
│   └── pwa-*.png
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── analytics/       # Analytics charts
│   │   ├── event-detail/    # Event details, info & sidebar
│   │   ├── CampusConnectIntro.tsx  # Boom Launch Splash Intro
│   │   ├── DiscussionThread.tsx    # Q&A / Discussion card
│   │   ├── EventCommunity.tsx     # Community message board
│   │   └── EventCard.tsx
│   ├── hooks/               # Custom React hooks (theme, auth, etc.)
│   ├── lib/                 # Utility functions & helpers
│   ├── pages/               # Application pages
│   │   ├── Landing.tsx      # Main landing & splash screen
│   │   ├── EventDetail.tsx  # Event page & community
│   │   ├── Dashboard.tsx    # Participant/Organizer hub
│   │   ├── Ticket.tsx       # QR code ticket view
│   │   ├── Analytics.tsx    # Organizer analytics
│   │   └── ...
│   ├── main.tsx             # React entry point & PWA registration
│   └── index.css            # Base Neo-Brutalist design tokens
├── convex/                  # Convex backend schema & functions
└── vite.config.ts           # Vite & PWA plugin configuration
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm run dev` | Launches local development server |
| **Build** | `npm run build` | Builds production-optimized bundle & PWA assets |
| **Preview** | `npm run preview` | Previews production build locally |
| **Backend** | `npm run convex:dev` | Runs Convex backend in dev mode |

---

## 📄 License
Licensed under the [MIT License](LICENSE). 

---
*Built with ❤️ for Campus Communities.*
