import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, QrCode, TrendingUp, MapPin, Clock, Search, ChevronDown, Megaphone, AlertCircle, Settings, ArrowRight, Zap, Shield, Sparkle, Star, CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { getCategoryColor, getDaysUntilEvent } from '../lib/utils'
import SettingsMenu from '../components/SettingsMenu'
import { SkeletonCard } from '../components/Skeleton'
import { Brainbox, GhostBlob, HappyDog, NBStar } from '../components/Mascots'
import CampusConnectIntro from '../components/CampusConnectIntro'

// ── FAQ Accordion Item with Smooth Expand Animation ────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl border-2 transition-all duration-200 overflow-hidden
                 ${open ? 'border-nb-purple bg-white shadow-[4px_4px_0_rgba(116,0,232,0.4)]' : 'border-black/15 bg-white shadow-[2px_2px_0_rgba(0,0,0,0.15)] hover:border-black/30'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm text-black leading-snug hover:bg-black/2 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkle className={`w-4 h-4 transition-colors ${open ? 'text-nb-purple fill-nb-purple' : 'text-black/30'}`} />
          {question}
        </span>
        <ChevronDown className={`w-4 h-4 text-black/40 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-nb-purple' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-nb-cream/40 border-t border-black/8"
          >
            <p className="px-5 py-4 text-sm text-black/70 font-medium leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social']
const DATE_FILTERS = ['Upcoming', 'Past', 'Today', 'This Week', 'This Month']

const SAMPLE_EVENTS = [
  {
    _id: 'sample-1',
    title: "AI & Web3 Hackathon '26",
    description: 'Build futuristic decentralized applications with cutting-edge AI tools and smart contracts.',
    category: 'Technical',
    date: '2026-08-25',
    location: 'Main Auditorium, Block A',
    time: '10:00',
  },
  {
    _id: 'sample-2',
    title: 'Design System & Neo-Brutalism Workshop',
    description: 'Learn modern UI/UX design patterns, bold typography, dynamic animations, and sticker UI aesthetics.',
    category: 'Workshop',
    date: '2026-08-28',
    location: 'Design Lab 302',
    time: '14:00',
  },
  {
    _id: 'sample-3',
    title: 'Annual Campus Cultural Fest',
    description: 'Music, dance, food stalls, and battle of the bands. The biggest fest of the year!',
    category: 'Cultural',
    date: '2026-09-02',
    location: 'University Grounds',
    time: '16:00',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const events = useQuery(api.events.getAllEvents)
  const announcements = useQuery(api.announcements.getGeneralAnnouncements)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('Upcoming')
  const [showMoreEvents, setShowMoreEvents] = useState(false)
  const [isIntroComplete, setIsIntroComplete] = useState(() => {
    try {
      return sessionStorage.getItem('campus_connect_intro_seen') === 'true'
    } catch {
      return false
    }
  })

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('campus_connect_intro_seen', 'true')
    } catch (e) {
      console.warn('Storage restricted on mobile browser:', e)
    }
    setIsIntroComplete(true)
  }

  const handleReplayIntro = () => {
    try {
      sessionStorage.removeItem('campus_connect_intro_seen')
    } catch (e) {
      console.warn('Storage restricted on mobile browser:', e)
    }
    setIsIntroComplete(false)
  }

  const filteredEvents = useMemo(() => {
    const rawEvents = (events && events.length > 0) ? events : SAMPLE_EVENTS
    const now = new Date()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    
    let filtered = rawEvents
      .map((e: any) => ({ ...e, dateTime: new Date(`${e.date}T${e.time || '00:00'}`) }))
      .filter((e: any) => !isNaN(e.dateTime.getTime()))

    if (dateFilter === 'Upcoming') {
      filtered = filtered.filter((e: any) => e.dateTime >= now)
    } else if (dateFilter === 'Past') {
      filtered = filtered.filter((e: any) => e.dateTime < now)
    } else if (dateFilter === 'Today') {
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
    } else if (dateFilter === 'This Week') {
      const end = new Date(today); end.setDate(end.getDate() + 7)
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    } else if (dateFilter === 'This Month') {
      const end = new Date(today); end.setMonth(end.getMonth() + 1)
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((e: any) =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((e: any) => e.category === categoryFilter)
    }

    return filtered.sort((a: any, b: any) => {
      if (dateFilter === 'Past') return b.dateTime - a.dateTime
      return a.dateTime - b.dateTime
    })
  }, [events, searchQuery, categoryFilter, dateFilter])

  const displayedEvents = showMoreEvents ? filteredEvents : filteredEvents.slice(0, 6)
  const isLoading = false

  return (
    <div className="min-h-screen bg-nb-cream flex flex-col font-body grid-bg overflow-x-hidden selection:bg-nb-pink selection:text-white relative">

      {/* ── Landing Intro Experience Overlay ───────────────────────── */}
      {!isIntroComplete && (
        <CampusConnectIntro onComplete={handleIntroComplete} />
      )}

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-black overflow-hidden">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-3">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-display font-black text-base sm:text-2xl text-black tracking-tighter flex items-center group cursor-pointer shrink-0"
          >
            <span className="bg-nb-yellow border-2 border-black px-1.5 sm:px-2 py-0.5 group-hover:bg-nb-pink group-hover:text-white transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              CAMPUS
            </span>
            <span className="ml-1 sm:ml-2 uppercase tracking-[0.05em] sm:tracking-[0.1em] font-black text-xs sm:text-2xl">CONNECT.</span>
          </motion.button>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={handleReplayIntro}
              className="p-1.5 sm:p-2 nb-sm bg-nb-purple text-white hover:bg-nb-yellow hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 text-[10px] sm:text-xs font-black uppercase flex items-center gap-1 shrink-0"
              title="Replay Intro Experience"
            >
              <span>BOOM 💥</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:p-2 nb-sm bg-white text-black hover:bg-nb-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => navigate('/events')}
              className="hidden md:block text-[11px] font-black tracking-widest text-black/60 hover:text-black transition-colors px-3 py-2 uppercase shrink-0"
            >
              Explore Events
            </button>
            <button
              onClick={() => navigate('/auth?role=organizer')}
              className="hidden lg:block text-[11px] font-black tracking-widest text-black/60 hover:text-black transition-colors px-3 py-2 uppercase shrink-0"
            >
              Organizer Portal
            </button>
            <motion.button
              onClick={() => navigate('/role-selection')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97, y: 0 }}
              className="nb-btn bg-nb-yellow text-black text-[10px] sm:text-xs font-black px-2.5 sm:px-5 py-1.5 sm:py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-nb-purple hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">BROWSE EVENTS</span>
              <span className="sm:hidden">BROWSE</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Dynamic Framer Motion Animations ───── */}
      <section className="relative bg-nb-purple text-white py-16 md:py-24 px-4 overflow-hidden border-b-4 border-black">

        {/* Animated Background Decorative Elements */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-nb-pink/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-nb-green/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Floating Mascots & Decorative Stars */}
        <NBStar className="absolute top-10 right-[15%] w-12 h-12 hidden md:block opacity-80" color="#FFF500" />
        <NBStar className="absolute bottom-12 right-[45%] w-8 h-8 hidden md:block opacity-60" color="#00FF75" />
        
        <GhostBlob className="absolute top-12 right-6 w-36 h-36 md:w-52 md:h-52 opacity-25 hidden lg:block pointer-events-none" />
        <Brainbox className="absolute bottom-6 right-16 w-32 h-32 hidden xl:block pointer-events-none opacity-30" />

        <div className="max-w-[1100px] mx-auto relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>

            {/* Live Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-nb-green text-black
                         text-xs font-black uppercase tracking-widest
                         px-4 py-2 rounded-md border-2 border-black
                         shadow-[3px_3px_0_rgba(0,0,0,1)] mb-6 cursor-default"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 fill-black" />
              </motion.span>
              Campus Life Unlocked
            </motion.div>

            {/* Animated Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase tracking-tighter leading-[0.92] mb-6 text-left"
              style={{ fontSize: 'clamp(2.7rem, 6.5vw, 5.2rem)' }}
            >
              <span className="block text-white">Every Event.</span>
              <motion.span
                whileHover={{ scale: 1.02, rotate: -1 }}
                className="inline-block bg-nb-yellow text-black
                           border-3 border-black px-4 py-1 mt-2.5
                           shadow-[5px_5px_0_rgba(0,0,0,1)]
                           rotate-1 cursor-pointer transition-transform"
              >
                One Place.
              </motion.span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-white/90 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-xl"
            >
              Ditch the noise. Join the community.
              The ultimate hub for workshops, seminars, cultural fests, and campus events.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <motion.button
                onClick={() => navigate('/role-selection')}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96, y: 0 }}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl
                           bg-nb-green text-black text-sm font-black uppercase tracking-wide
                           border-2 border-black
                           shadow-[4px_4px_0_rgba(0,0,0,1)]
                           hover:bg-nb-yellow
                           transition-all group cursor-pointer"
              >
                Join the Action
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97, y: 0 }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                           bg-white text-black text-sm font-black uppercase tracking-wide
                           border-2 border-black
                           shadow-[4px_4px_0_rgba(0,0,0,1)]
                           hover:bg-nb-pink hover:text-white
                           transition-all cursor-pointer"
              >
                Launch an Event →
              </motion.button>
            </motion.div>

            {/* Quick Stats Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-4 sm:gap-8 flex-wrap"
            >
              {[
                { value: '500+', label: 'Active Students', bg: 'bg-nb-pink' },
                { value: '80+',  label: 'Events Hosted',   bg: 'bg-nb-yellow' },
                { value: '12+',  label: 'Student Clubs',   bg: 'bg-nb-green' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="flex items-center gap-3 bg-black/20 backdrop-blur-sm p-2 pr-4 rounded-xl border border-white/20"
                >
                  <div className={`${stat.bg} px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]`}>
                    <p className="font-display text-xl font-black text-black leading-none">{stat.value}</p>
                  </div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Interactive Animated Hero Card Showcase (Desktop Preview) */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: -1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white rounded-2xl border-4 border-black p-6 shadow-[10px_10px_0_rgba(0,0,0,1)] text-black relative"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-nb-pink border border-black" />
                  <span className="w-3 h-3 rounded-full bg-nb-yellow border border-black" />
                  <span className="w-3 h-3 rounded-full bg-nb-green border border-black" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-nb-purple text-white px-2.5 py-1 rounded-md border border-black">
                  LIVE DEMO TICKET
                </span>
              </div>

              <div className="bg-nb-cream p-4 rounded-xl border-2 border-black mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black bg-nb-pink text-white px-2 py-0.5 rounded border border-black uppercase">
                    TECHNICAL
                  </span>
                  <span className="text-xs font-bold text-black/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-nb-purple" /> TODAY 4:00 PM
                  </span>
                </div>
                <h4 className="font-display text-xl font-black text-black leading-tight mb-1">
                  AI & Web3 Hackathon '26
                </h4>
                <p className="text-xs text-black/60 font-medium">Main Auditorium · Campus Block A</p>
              </div>

              <div className="flex items-center gap-4 bg-nb-yellow/30 p-3 rounded-xl border-2 border-black">
                <div className="w-14 h-14 bg-white rounded-lg border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0_#000]">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-black">Instant QR Check-in</p>
                  <p className="text-[11px] text-black/70 font-semibold">1-Click registration & entry verification</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Star Mascot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-6 -left-6 w-16 h-16 pointer-events-none"
            >
              <NBStar color="#FF2D92" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Animated Infinite Marquee Banner ──────────────────────── */}
      <div className="bg-nb-yellow border-b-4 border-black py-3 overflow-hidden select-none font-display font-black text-sm tracking-widest uppercase text-black">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-8">
              <span className="flex items-center gap-2">✦ WORKSHOPS & HACKATHONS</span>
              <span className="flex items-center gap-2 text-nb-purple">✦ INSTANT QR TICKETING</span>
              <span className="flex items-center gap-2">✦ REAL-TIME ANALYTICS</span>
              <span className="flex items-center gap-2 text-nb-pink">✦ CAMPUS ANNOUNCEMENTS</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="bg-nb-green py-20 px-4 border-b-4 border-black relative overflow-hidden">
        <NBStar className="absolute top-8 left-8 w-16 h-16 opacity-30 pointer-events-none" color="white" />
        <NBStar className="absolute bottom-8 right-8 w-20 h-20 opacity-30 pointer-events-none" color="white" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xs font-black uppercase tracking-[0.4em] text-black mb-12 italic underline decoration-white underline-offset-8 decoration-4"
          >
            TRUSTED BY THE COMMUNITY
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-8 text-black">
            {[
              { quote: "Registered for three workshops in under a minute. The QR ticket made check-in instant.", name: "Aisha K.", role: "2nd Year, CSE", color: "bg-nb-pink" },
              { quote: "As an organizer, tracking attendance used to take hours. Now it's done before the event ends.", name: "Rohan M.", role: "Tech Club Lead", color: "bg-nb-yellow" },
            ].map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="nb bg-white p-8 md:p-10 flex flex-col justify-between gap-8 shadow-[10px_10px_0_#000000] border-4 rounded-xl"
              >
                <p className="text-black font-black italic leading-tight text-xl md:text-2xl tracking-tighter">"{t.quote}"</p>
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 ${t.color} nb-lg flex items-center justify-center font-black text-2xl border-3 shadow-[4px_4px_0_#000000] -rotate-3`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-black text-black text-lg uppercase tracking-tighter italic">{t.name}</p>
                    <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.2em] font-body mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">

        {/* ── Announcements Banner ─────────────────────────────────── */}
        {announcements && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-10 flex items-center gap-4 italic">
              <div className="bg-nb-purple text-white p-3 nb border-3 border-black shadow-[6px_6px_0_#000000] rotate-[-2deg]">
                <Megaphone className="w-8 h-8" />
              </div>
              LATEST UPDATES
              <div className="h-2 flex-1 bg-black rounded-full" />
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map((a: any) => {
                const imp = a.priority === 'important'
                return (
                  <motion.div
                    key={a._id}
                    whileHover={{ y: -4 }}
                    className={`nb p-6 flex gap-6 rounded-xl border-4 ${imp ? 'bg-nb-pink text-white shadow-[10px_10px_0_#000000]' : 'bg-white shadow-[6px_6px_0_#000000]'}`}
                  >
                    <div className={`p-4 nb flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg border-3 shadow-[4px_4px_0_#000000] ${imp ? 'bg-white text-nb-pink -rotate-2' : 'bg-nb-green text-black rotate-2'}`}>
                      {imp ? <AlertCircle className="w-8 h-8 stroke-[3px]" /> : <Megaphone className="w-8 h-8 stroke-[3px]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className={`font-display font-black text-xl uppercase tracking-tighter italic ${imp ? 'text-white' : 'text-black'}`}>{a.title}</p>
                        {imp && <span className="nb bg-white text-nb-pink text-[10px] px-2.5 py-0.5 border-2 border-black font-black tracking-widest rounded">CRITICAL</span>}
                      </div>
                      <p className={`text-xs font-bold leading-relaxed italic ${imp ? 'text-white/90' : 'text-black/70'}`}>{a.message}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Events Control Console (Filter Bar) ───────────────────── */}
        <section className="mb-8 space-y-5 bg-white p-6 rounded-2xl border-3 border-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-bold
                           bg-nb-cream rounded-xl border-2 border-black
                           shadow-[2px_2px_0_rgba(0,0,0,1)]
                           focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_rgba(0,0,0,1)]
                           transition-all placeholder:text-black/40"
              />
            </div>

            {/* Date Filters with Motion Indicator */}
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map(date => (
                <button
                  key={date}
                  onClick={() => setDateFilter(date)}
                  className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 transition-all cursor-pointer relative
                    ${dateFilter === date
                      ? 'bg-nb-pink text-white border-black shadow-[3px_3px_0_rgba(0,0,0,1)]'
                      : 'bg-white text-black/70 border-black/20 hover:border-black hover:text-black shadow-[2px_2px_0_rgba(0,0,0,0.15)]'
                    }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-black/10">
            <span className="text-xs font-black text-black/40 uppercase tracking-wider mr-2">Category:</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-black rounded-lg border-2 transition-all cursor-pointer
                  ${categoryFilter === cat
                    ? 'bg-nb-purple text-white border-black shadow-[3px_3px_0_rgba(0,0,0,1)]'
                    : 'bg-white text-black/70 border-black/20 hover:border-black hover:text-black'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Events Grid Section Header ─────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-black text-black tracking-tight uppercase">
              {dateFilter === 'Past' ? 'Past Events' : 'Upcoming Events'}
            </h2>
            {filteredEvents.length > 0 && (
              <span className="px-3 py-0.5 rounded-md text-xs font-black bg-nb-pink text-white
                               border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                {filteredEvents.length}
              </span>
            )}
          </div>
        </div>

        {/* ── Events Grid ────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayedEvents.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayedEvents.map((event: any, index: number) => {
                const catColor = getCategoryColor(event.category)
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
                return (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="bg-white rounded-2xl border-3 border-black
                               shadow-[5px_5px_0_rgba(0,0,0,1)]
                               hover:shadow-[8px_8px_0_rgba(0,0,0,1)]
                               flex flex-col cursor-pointer overflow-hidden
                               transition-all duration-200 group"
                    onClick={() => navigate('/role-selection')}
                  >
                    {/* Category Header Strip */}
                    <div className={`${catColor} px-4 py-3 flex items-center justify-between border-b-2 border-black`}>
                      <span className="text-xs font-black uppercase tracking-wider text-black">{event.category}</span>
                      {daysUntil === 0 && (
                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded border border-black uppercase">Today</span>
                      )}
                      {daysUntil > 0 && daysUntil <= 3 && (
                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded border border-black uppercase">Soon</span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display text-lg font-black text-black mb-2.5
                                     line-clamp-2 tracking-tight leading-snug
                                     group-hover:text-nb-purple transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-black/70 text-xs font-semibold mb-4 line-clamp-2 leading-relaxed flex-1">
                        {event.description}
                      </p>

                      {/* Meta Tags */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                        bg-nb-cream border border-black text-xs font-bold text-black truncate">
                          <Calendar className="w-3.5 h-3.5 text-nb-purple shrink-0" />
                          <span className="truncate">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                        bg-nb-cream border border-black text-xs font-bold text-black truncate">
                          <MapPin className="w-3.5 h-3.5 text-nb-pink shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {/* View Details CTA */}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); navigate('/role-selection') }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider
                                   bg-nb-purple text-white border-2 border-black
                                   shadow-[3px_3px_0_rgba(0,0,0,1)]
                                   hover:bg-nb-yellow hover:text-black
                                   transition-all cursor-pointer"
                      >
                        View Details →
                      </motion.button>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>

            {filteredEvents.length > 6 && !showMoreEvents && (
              <div className="text-center mt-10">
                <motion.button
                  onClick={() => setShowMoreEvents(true)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-black
                             border-3 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]
                             hover:bg-nb-yellow transition-all cursor-pointer"
                >
                  Load more events +
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-16 px-6 max-w-md mx-auto bg-white rounded-2xl border-3 border-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
            <div className="w-16 h-16 rounded-2xl bg-nb-yellow border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0_rgba(0,0,0,1)]">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <h3 className="font-display text-xl font-black text-black mb-2">
              {dateFilter === 'Upcoming' ? 'No upcoming events' : 'No events found'}
            </h3>
            <p className="text-xs text-black/60 font-semibold mb-6">
              {dateFilter === 'Upcoming'
                ? "Try switching to 'Past' events or check back soon."
                : 'No results match your search. Try adjusting your search query or filters.'}
            </p>
            {(searchQuery || categoryFilter !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('All') }}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase bg-nb-yellow text-black
                           border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]
                           hover:bg-nb-pink hover:text-white transition-all cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Features Section with Framer Motion Entrance ─────────── */}
        <section className="mt-24 mb-16">
          <div className="max-w-[1100px] mx-auto">

            {/* Header */}
            <div className="flex items-end gap-4 mb-10">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/50 mb-1">What you get</p>
                <h2 className="font-display text-3xl md:text-4xl font-black text-black tracking-tight leading-none uppercase">
                  Everything you need.
                </h2>
              </div>
              <div className="h-2 flex-1 bg-black rounded-full mb-1 hidden sm:block" />
            </div>

            {/* Features Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Calendar,
                  title: 'Event Management',
                  desc: 'Create, edit, and manage events with registrations and capacity tracking.',
                  accent: 'bg-nb-yellow',
                },
                {
                  icon: QrCode,
                  title: 'QR Check-in',
                  desc: 'Instant QR ticket generation and real-time attendance scanning.',
                  accent: 'bg-nb-green',
                },
                {
                  icon: Zap,
                  title: 'Live Sync',
                  desc: 'Real-time updates across all devices — registrations reflect instantly.',
                  accent: 'bg-nb-purple',
                },
                {
                  icon: Shield,
                  title: 'Secure Access',
                  desc: 'OTP-based organizer auth and validated participant registration.',
                  accent: 'bg-nb-pink',
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white rounded-2xl border-3 border-black
                             shadow-[6px_6px_0_rgba(0,0,0,1)]
                             p-6 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.accent} border-2 border-black flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,1)]`}>
                    <f.icon className="w-6 h-6 text-black" />
                  </div>

                  <div>
                    <h3 className="font-display font-black text-lg text-black tracking-tight mb-2 uppercase">
                      {f.title}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FAQ Section ───────────────────────────────────────────── */}
      <section id="faq" className="bg-white border-t-4 border-black px-4 py-20">
        <div className="max-w-[1100px] mx-auto">

          {/* Header */}
          <div className="mb-12 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-black/50 mb-2">Got questions?</p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-black tracking-tight uppercase">
              Frequently Asked Questions
            </h2>
          </div>

          {/* FAQ grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: 'How do I register for an event?',
                a: 'Click "Browse Events", find an event you like, and hit "View Details". From there, click "Join Event" and fill in your details. You\'ll get a QR ticket instantly.',
              },
              {
                q: 'Do I need an account to join events?',
                a: 'No account needed for participants. Just enter as a Participant from the home screen and you\'re in. Organizers need to sign in with their email OTP.',
              },
              {
                q: 'How does QR check-in work?',
                a: 'After registering, you get a ticket with a QR code. At the event, show it to the organizer who scans it with their phone. Your attendance is marked instantly.',
              },
              {
                q: 'Can I register as a team?',
                a: 'Yes — if the organizer has enabled team registration for an event, you\'ll see a team section in the form. Enter your team name and each member\'s details.',
              },
              {
                q: 'How do I create and manage events?',
                a: 'Sign in as an Organizer using your email. From the Dashboard, click "New Event" to create one. You can track registrations, scan QR codes, and view analytics.',
              },
              {
                q: 'What happens if I miss an event?',
                a: 'Your registration stays on record. You can view your history under "My History" in the dashboard. Certificates are only issued for events you attended.',
              },
              {
                q: 'Can I download my ticket?',
                a: 'Yes. Open your ticket page and tap "Save Ticket" to download it as an image. If you attended, you can also download a participation certificate.',
              },
              {
                q: 'How do I send announcements to participants?',
                a: 'Organizers can click "Send Notification" from the Dashboard. You can send a general announcement or target a specific event\'s participants.',
              },
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-black text-white border-t-4 border-nb-yellow">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Main Grid */}
          <div className="grid md:grid-cols-[1.8fr_1fr_1fr] gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-nb-yellow text-black text-sm font-black px-2.5 py-1 rounded-md
                                 shadow-[2px_2px_0_rgba(255,255,255,0.3)]">
                  CAMPUS
                </span>
                <span className="font-display font-black text-xl text-white tracking-tight">
                  CONNECT.
                </span>
              </div>
              <p className="text-white/70 text-xs font-semibold leading-relaxed max-w-xs">
                The smartest way to discover, join, and manage campus events. Built for students and organizers.
              </p>
            </div>

            {/* Info Links */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-nb-green mb-4">Info</p>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => navigate('/role-selection')}
                    className="text-xs text-white/70 font-bold hover:text-nb-yellow hover:translate-x-1
                               transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Browse Events →
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-xs text-white/70 font-bold hover:text-nb-yellow hover:translate-x-1
                               transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Organizer Portal →
                  </button>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-nb-green mb-4">Support</p>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:support@campusconnect.com"
                    className="text-xs text-white/70 font-bold hover:text-nb-yellow hover:translate-x-1
                               transition-all block">
                    Email Support →
                  </a>
                </li>
                <li>
                  <a href="#faq"
                    className="text-xs text-white/70 font-bold hover:text-nb-yellow hover:translate-x-1
                               transition-all block">
                    Project FAQ →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-white/20 mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-bold">
            <p>© 2026 Campus Connect Project</p>
            <p>Designed with impact · Neo-Brutalist Edition</p>
          </div>
        </div>
      </footer>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  )
}
