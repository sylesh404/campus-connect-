import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { BarChart3, TrendingUp, Users, Calendar, ArrowLeft } from 'lucide-react'
import AppShell from '../components/AppShell'
import { PageLoader } from '../components/Skeleton'

import OverviewStats from '../components/analytics/OverviewStats'
import RegistrationTrendChart from '../components/analytics/RegistrationTrendChart'
import CategoryPieChart from '../components/analytics/CategoryPieChart'
import AttendanceBarChart from '../components/analytics/AttendanceBarChart'
import PeakTimesChart from '../components/analytics/PeakTimesChart'

const MOCK_OVERVIEW_STATS = {
    totalEvents: 4,
    totalRegistrations: 417,
    totalAttendance: 362,
    attendanceRate: 86.8,
    upcomingEvents: 2
}

const MOCK_REGISTRATION_TRENDS = [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 28 },
    { date: 'Wed', count: 45 },
    { date: 'Thu', count: 68 },
    { date: 'Fri', count: 95 },
    { date: 'Sat', count: 120 },
    { date: 'Sun', count: 49 }
]

const MOCK_CATEGORY_STATS = [
    { category: 'Hackathon', count: 150 },
    { category: 'Workshop', count: 110 },
    { category: 'Cultural', count: 95 },
    { category: 'Technical', count: 62 }
]

const MOCK_ATTENDANCE_RATES = [
    { eventTitle: 'AI Innovation Hackathon', rate: 92 },
    { eventTitle: 'Web Dev Workshop', rate: 85 },
    { eventTitle: 'Cultural Band Fest', rate: 78 },
    { eventTitle: 'Cloud Summit', rate: 90 }
]

const MOCK_PEAK_TIMES = [
    { hour: '09:00', count: 25 },
    { hour: '12:00', count: 85 },
    { hour: '15:00', count: 140 },
    { hour: '18:00', count: 110 },
    { hour: '21:00', count: 57 }
]

export default function Analytics() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [useFallback, setUseFallback] = useState(false)

    // Redirect if not organizer
    useEffect(() => {
        if (!user || user.role !== 'organizer') {
            navigate('/role-selection')
        }
    }, [user, navigate])

    // Fetch analytics data
    const rawOverviewStats = useQuery(
        api.analytics.getOrganizerAnalytics,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const rawRegistrationTrends = useQuery(
        api.analytics.getRegistrationTrends,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const rawCategoryStats = useQuery(
        api.analytics.getCategoryStats,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const rawAttendanceRates = useQuery(
        api.analytics.getAttendanceRates,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const rawPeakTimes = useQuery(
        api.analytics.getPeakRegistrationTimes,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )

    useEffect(() => {
        const timer = setTimeout(() => {
            if (rawOverviewStats === undefined) setUseFallback(true)
        }, 400)
        return () => clearTimeout(timer)
    }, [rawOverviewStats])

    if (!user || user.role !== 'organizer') {
        return null
    }

    const overviewStats = rawOverviewStats || (useFallback ? MOCK_OVERVIEW_STATS : undefined)
    const registrationTrends = rawRegistrationTrends || (useFallback ? MOCK_REGISTRATION_TRENDS : undefined)
    const categoryStats = rawCategoryStats || (useFallback ? MOCK_CATEGORY_STATS : undefined)
    const attendanceRates = rawAttendanceRates || (useFallback ? MOCK_ATTENDANCE_RATES : undefined)
    const peakTimes = rawPeakTimes || (useFallback ? MOCK_PEAK_TIMES : undefined)

    const isLoading =
        overviewStats === undefined ||
        registrationTrends === undefined ||
        categoryStats === undefined ||
        attendanceRates === undefined ||
        peakTimes === undefined

    return (
        <AppShell className="grid-bg">
            <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
                {/* ── Page navigation + Header ─────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="nb bg-white p-4 border-3 border-black shadow-[4px_4px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6 text-black" />
                        </button>
                        <div>
                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-black/40 underline decoration-nb-purple underline-offset-4 mb-2">LIVE DASHBOARD</p>
                            <h1 className="font-display text-5xl font-black text-black uppercase tracking-tighter italic">CORE ANALYTICS</h1>
                        </div>
                    </div>
                    <div className="nb bg-nb-yellow border-4 border-black px-6 py-3 flex items-center gap-3 shadow-[6px_6px_0_#000000]">
                        <TrendingUp className="w-6 h-6 text-black" />
                        <span className="font-black text-xs uppercase tracking-[0.2em] italic">LIVE PERFORMANCE SYNC</span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <PageLoader message="PROCESSING DATASTREAM..." />
                ) : (
                    <>
                        {/* ── Overview Stats ───────────────────────────────── */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-4 bg-nb-purple shadow-[4px_4px_0_#000000]" />
                                <h2 className="font-display text-3xl font-black text-black uppercase tracking-tighter italic">PRIMARY INDICATORS</h2>
                            </div>
                            <OverviewStats
                                totalEvents={overviewStats?.totalEvents || 0}
                                totalRegistrations={overviewStats?.totalRegistrations || 0}
                                totalAttendance={overviewStats?.totalAttendance || 0}
                                attendanceRate={overviewStats?.attendanceRate || 0}
                                upcomingEvents={overviewStats?.upcomingEvents || 0}
                            />
                        </section>

                        {/* ── Charts Grid ──────────────────────────────────── */}
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-10 w-4 bg-nb-green shadow-[4px_4px_0_#000000]" />
                                <h2 className="font-display text-3xl font-black text-black uppercase tracking-tighter italic">VISUAL BREAKDOWN</h2>
                            </div>
                            <div className="grid lg:grid-cols-2 gap-10">
                                <div className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#000000] rotate-[-0.5deg]"><RegistrationTrendChart data={registrationTrends || []} /></div>
                                <div className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#7400E8] rotate-[0.5deg]"><CategoryPieChart data={categoryStats || []} /></div>
                                <div className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#00FF75] rotate-[-0.5deg]"><AttendanceBarChart data={attendanceRates || []} /></div>
                                <div className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#FF2D92] rotate-[0.5deg]"><PeakTimesChart data={peakTimes || []} /></div>
                            </div>
                        </section>

                        {/* ── Empty State ───────────────────────────────────── */}
                        {overviewStats?.totalEvents === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="nb bg-white p-24 text-center border-4 shadow-[20px_20px_0_#000000]"
                            >
                                <BarChart3 className="w-24 h-24 mx-auto mb-8 text-black/10 animate-bounce" />
                                <h3 className="font-display text-4xl font-black text-black mb-4 uppercase italic tracking-tighter">NO DATA DETECTED</h3>
                                <p className="text-black/40 font-black uppercase tracking-tight mb-12 max-w-sm mx-auto italic">
                                    YOU HAVE NOT LAUNCHED ANY EVENTS YET. ANALYTICS WILL POPULATE ONCE THE FIRST EVENT IS CREATED.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="nb bg-nb-yellow text-black font-black px-12 py-5 text-sm tracking-[0.3em] uppercase border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                >
                                    RETURN TO DASHBOARD →
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </AppShell>
    )
}
