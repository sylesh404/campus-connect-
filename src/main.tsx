import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ThemeContext, useThemeProvider } from './hooks/use-theme'
import { LanguageContext, useLanguageProvider } from './hooks/use-language'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Register PWA Service Worker safely (non-blocking for web preview/tunnels)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true })
  } catch (err) {
    console.warn('PWA SW Registration bypassed:', err)
  }
}

import Landing from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import EventDetail from './pages/EventDetail'
import Events from './pages/Events'
import Ticket from './pages/Ticket'
import MyHistory from './pages/MyHistory'
import Analytics from './pages/Analytics'
import EditEvent from './pages/EditEvent'
import NotFound from './pages/NotFound'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center p-6 text-center font-body">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 rounded-2xl max-w-md w-full">
            <div className="bg-[#FFF500] border-2 border-black px-4 py-2 font-display font-black text-xl uppercase mb-4 inline-block shadow-[3px_3px_0px_0px_#000]">
              CAMPUS CONNECT
            </div>
            <h2 className="font-display font-black text-2xl text-black mb-3">SOMETHING WENT WRONG</h2>
            <p className="text-xs text-black/70 font-semibold mb-6">
              {this.state.error?.message || "An unexpected error occurred while loading the application."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#7400E8] text-white font-black text-xs uppercase px-6 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#FFF500] hover:text-black transition-all cursor-pointer"
            >
              RELOAD APPLICATION ↻
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.warn("VITE_CONVEX_URL is not defined. Connecting with fallback endpoint.");
}

const convex = new ConvexReactClient(convexUrl || "https://dummy-deployment.convex.cloud");

function App() {
  const theme = useThemeProvider()
  const language = useLanguageProvider()

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={theme}>
        <LanguageContext.Provider value={language}>
          <ConvexProvider client={convex}>
            <ToastProvider>
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/event/:eventId" element={<EventDetail />} />
                  <Route path="/ticket/:registrationId" element={<Ticket />} />
                  <Route path="/my-history" element={<MyHistory />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/edit-event/:eventId" element={<EditEvent />} />
                  <Route path="/event/:eventId/edit" element={<EditEvent />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </ToastProvider>
          </ConvexProvider>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
