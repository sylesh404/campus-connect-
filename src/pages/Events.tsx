import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Calendar, MapPin, Search, Users, Filter, X } from 'lucide-react'
import { getCategoryColor } from '../lib/utils'
import { SkeletonCard } from '../components/Skeleton'
import SettingsMenu from '../components/SettingsMenu'
import { Settings } from 'lucide-react'

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social', 'Hackathon']
const DATE_FILTERS = ['Upcoming', 'Today', 'This Week', 'This Month', 'Past']

const SAMPLE_EVENTS = [
  {
    _id: 'sample-1',
    title: "AI & Web3 Hackathon '26",
    description: 'Build futuristic decentralized applications with cutting-edge AI tools and smart contracts. $5,000 cash prizes!',
    category: 'Technical',
    date: '2026-08-25',
    time: '10:00',
    location: 'Main Auditorium, Block A',
    organizerName: 'Tech Club IIT',
    maxParticipants: 300,
    _registrationCount: 184,
  },
  {
    _id: 'sample-2',
    title: 'Design System & Neo-Brutalism Masterclass',
    description: 'Learn modern UI/UX design patterns, bold typography, dynamic animations, and sticker UI aesthetics from industry pros.',
    category: 'Workshop',
    date: '2026-08-28',
    time: '14:00',
    location: 'Design Lab 302',
    organizerName: 'UX Guild',
    maxParticipants: 120,
    _registrationCount: 95,
  },
  {
    _id: 'sample-3',
    title: 'Annual Campus Cultural Fest 2026',
    description: 'Music, dance, food stalls, celebrity DJ night, and battle of the bands. The biggest fest of the year!',
    category: 'Cultural',
    date: '2026-09-02',
    time: '16:00',
    location: 'University Grounds',
    organizerName: 'Cultural Committee',
    maxParticipants: 1500,
    _registrationCount: 1120,
  },
  {
    _id: 'sample-4',
    title: 'Inter-College Esports Championship',
    description: 'Valorant, BGMI, and FIFA 24 tournaments. Live streaming with gaming prizes and trophies.',
    category: 'Sports',
    date: '2026-09-05',
    time: '11:00',
    location: 'Student Activity Arena',
    organizerName: 'Esports Club',
    maxParticipants: 250,
    _registrationCount: 210,
  },
  {
    _id: 'sample-5',
    title: 'Startup Pitch & E-Summit 2026',
    description: 'Pitch your startup ideas to angel investors and founders. Get seed funding and mentorship.',
    category: 'Seminar',
    date: '2026-09-10',
    time: '09:30',
    location: 'Conference Hall B',
    organizerName: 'E-Cell',
    maxParticipants: 200,
    _registrationCount: 145,
  },
  {
    _id: 'sample-6',
    title: 'Autonomous Robotics Challenge',
    description: 'Design and race line-follower and maze-solver autonomous bots. High energy arena battles!',
    category: 'Technical',
    date: '2026-09-15',
    time: '13:00',
    location: 'Robotics Workshop, Ground Floor',
    organizerName: 'Robotics Society',
    maxParticipants: 150,
    _registrationCount: 88,
  },
]

export default function Events() {
  const navigate = useNavigate()
  const events = useQuery(api.events.getAllEvents)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [dateFilter, setDateFilter] = useState('Upcoming')
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const rawEvents = (events && events.length > 0) ? events : SAMPLE_EVENTS
    const now = new Date()
    const today = new Date(); today.setHours(0, 0, 0, 0)

    let list = rawEvents.map((e: any) => ({
      ...e,
      dateTime: new Date(`${e.date}T${e.time || '00:00'}`)
    })).filter((e: any) => !isNaN(e.dateTime.getTime()))

    if (dateFilter === 'Upcoming') list = list.filter((e: any) => e.dateTime >= now)
    else if (dateFilter === 'Past') list = list.filter((e: any) => e.dateTime < now)
    else if (dateFilter === 'Today') {
      list = list.filter((e: any) => {
        const d = new Date(e.date); d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      })
    } else if (dateFilter === 'This Week') {
      const end = new Date(today); end.setDate(end.getDate() + 7)
      list = list.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    } else if (dateFilter === 'This Month') {
      const end = new Date(today); end.setMonth(end.getMonth() + 1)
      list = list.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    }

    if (category !== 'All') list = list.filter((e: any) => e.category === category)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e: any) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.organizerName || '').toLowerCase().includes(q)
      )
    }

    return list.sort((a: any, b: any) =>
      dateFilter === 'Past' ? b.dateTime - a.dateTime : a.dateTime - b.dateTime
    )
  }, [events, search, category, dateFilter])

  const isLoading = false
  const activeFilterCount = (category !== 'All' ? 1 : 0) + (dateFilter !== 'Upcoming' ? 1 : 0) + (search ? 1 : 0)

  return (
    <div className="min-h-screen bg-nb-cream flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-black overflow-hidden">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          <button
            onClick={() => navigate('/')}
            className="font-display font-black text-xs sm:text-xl text-black tracking-tighter flex items-center shrink-0 group cursor-pointer"
          >
            <span className="bg-nb-yellow border-2 border-black px-1.5 py-0.5 group-hover:bg-nb-purple group-hover:text-white transition-colors uppercase text-xs sm:text-sm">CAMPUS</span>
            <span className="ml-1 sm:ml-1.5 uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-sm hidden xs:inline">CONNECT.</span>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative min-w-[100px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-nb-cream rounded-lg
                         border-2 border-black/20 focus:outline-none focus:border-nb-purple
                         transition-all placeholder:text-black/40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-black/40 hover:text-black" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold border-2 transition-all shrink-0
                ${showFilters ? 'bg-nb-purple text-white border-nb-purple' : 'bg-white text-black border-black/20 hover:border-black/50'}`}
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-nb-yellow text-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] sm:text-[10px] font-black ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black bg-nb-yellow text-black border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,0.8)] hover:bg-nb-purple hover:text-white transition-all shrink-0 whitespace-nowrap"
            >
              JOIN →
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-1.5 sm:p-2 rounded-lg border border-black/20 hover:bg-nb-cream transition-colors shrink-0"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-black/10 bg-white px-4 py-3 space-y-3"
          >
            {/* Date filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30 mr-1">When:</span>
              {DATE_FILTERS.map(d => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all
                    ${dateFilter === d
                      ? 'bg-nb-pink text-white border-nb-pink shadow-[2px_2px_0_rgba(0,0,0,0.6)]'
                      : 'bg-white text-black/60 border-black/20 hover:border-black/40'}`}
                >
                  {d}
                </button>
              ))}
            </div>
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30 mr-1">Type:</span>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all
                    ${category === c
                      ? 'bg-nb-purple text-white border-nb-purple shadow-[2px_2px_0_rgba(0,0,0,0.6)]'
                      : 'bg-white text-black/60 border-black/20 hover:border-black/40'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero strip ─────────────────────────────────────── */}
      <div className="bg-nb-purple text-white px-4 py-8 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-nb-yellow text-xs font-black uppercase tracking-widest mb-2">Discover · Register · Attend</p>
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              All Events
            </h1>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-3">
              <div className="bg-nb-yellow text-black px-4 py-2 rounded-lg border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
                <p className="font-display text-2xl font-black leading-none">{filtered.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  {dateFilter === 'Past' ? 'Past' : 'Upcoming'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Events Grid ────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6">
            <div className="w-16 h-16 rounded-xl bg-black/5 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-black/25" />
            </div>
            <h3 className="font-display text-2xl font-black text-black mb-2 uppercase">No events found</h3>
            <p className="text-sm text-black/40 font-medium mb-6">
              {dateFilter === 'Upcoming' ? "No upcoming events right now. Check back soon." : "Try different filters."}
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setDateFilter('Upcoming') }}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-nb-yellow text-black border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] transition-all"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event: any, i: number) => {
              const catColor = getCategoryColor(event.category)
              const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
              const capacityPct = Math.min((event._registrationCount || 0) / event.maxParticipants * 100, 100)

              return (
                <motion.article
                  key={event._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="bg-white rounded-xl border-2 border-black/80
                             shadow-[4px_4px_0_rgba(0,0,0,0.8)]
                             hover:shadow-[6px_6px_0_rgba(0,0,0,0.9)]
                             flex flex-col cursor-pointer overflow-hidden transition-all group"
                >
                  {/* Category strip */}
                  <div className={`${catColor} px-4 py-2.5 flex items-center justify-between border-b border-black/15`}>
                    <span className="text-xs font-bold uppercase tracking-wide">{event.category}</span>
                    <div className="flex gap-1.5">
                      {daysUntil === 0 && <span className="text-[10px] font-bold bg-white/80 text-black px-2 py-0.5 rounded">TODAY</span>}
                      {daysUntil > 0 && daysUntil <= 3 && <span className="text-[10px] font-bold bg-white/80 text-black px-2 py-0.5 rounded">SOON</span>}
                      {daysUntil < 0 && <span className="text-[10px] font-bold bg-black/20 text-black px-2 py-0.5 rounded">PAST</span>}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* College name */}
                    {event.organizerName && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-nb-purple mb-2">
                        🏛 {event.organizerName}
                      </p>
                    )}

                    <h3 className="font-display text-lg font-black text-black mb-2 line-clamp-2 tracking-tight leading-tight group-hover:text-nb-purple transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-black/55 text-sm mb-4 line-clamp-2 leading-relaxed flex-1 font-medium">
                      {event.description}
                    </p>

                    {/* Meta */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-nb-cream border border-black/15 text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-nb-purple" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-nb-cream border border-black/15 text-xs font-semibold truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-nb-pink shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-nb-cream border border-black/15 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-nb-green" />
                        {event.maxParticipants}
                      </div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/event/${event._id}`) }}
                      className="w-full py-2.5 rounded-lg text-sm font-bold bg-nb-purple text-white
                                 border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                                 hover:bg-nb-yellow hover:text-black hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                                 transition-all"
                    >
                      View & Register →
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </main>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  )
}
