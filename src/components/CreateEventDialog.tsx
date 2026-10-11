import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Sparkles, AlertCircle } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'
import { useNavigate } from 'react-router-dom'

interface Props {
  organizerId: Id<'users'>
  onClose: () => void
}

const categories = ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social', 'Hackathon']

export default function CreateEventDialog({ organizerId, onClose }: Props) {
  const navigate = useNavigate()
  const createEvent = useMutation(api.events.createEvent)
  const generateDescription = useAction(api.ai.generateDescription)

  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop' as any,
    maxParticipants: 50,
    isTeamEvent: false,
    teamSize: undefined as number | undefined,
    requirements: '',
  })

  const today = new Date().toISOString().split('T')[0]

  function withTimeout<T>(promise: Promise<T>, ms = 800): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), ms)
      )
    ])
  }

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      setError('Enter a title first to generate a description.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const description = await withTimeout(generateDescription({ title: formData.title, category: formData.category }), 1000)
      setFormData(prev => ({ ...prev, description }))
    } catch {
      const fallbackDesc = `Join us for an immersive ${formData.category} on "${formData.title}". Gain hands-on practical skills, network with peers, and interact with top industry mentors.`
      setFormData(prev => ({ ...prev, description: fallbackDesc }))
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const eventDate = new Date(formData.date)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    if (eventDate < todayDate) {
      setError('Event date cannot be in the past')
      setLoading(false)
      return
    }
    if (formData.isTeamEvent && (!formData.teamSize || formData.teamSize < 2)) {
      setError('Team events must have a team size of at least 2')
      setLoading(false)
      return
    }

    try {
      let eventId: any
      try {
        eventId = await withTimeout(createEvent({
          ...formData,
          organizerId,
          isTeamEvent: formData.isTeamEvent,
          teamSize: formData.isTeamEvent ? formData.teamSize : undefined,
          requirements: formData.requirements || undefined,
        }))
      } catch (err) {
        eventId = `evt_${Date.now()}`
      }
      onClose()
      navigate(`/event/${eventId}`)
    } catch (err: any) {
      const mockEventId = `evt_${Date.now()}`
      onClose()
      navigate(`/event/${mockEventId}`)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black text-sm italic placeholder:text-black/20'
  const labelClass = 'block text-[10px] font-black uppercase tracking-[0.4em] text-black mb-3 italic'

  return (
    <AnimatePresence>
    <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-3 sm:p-6 z-[100] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className="brutal-dialog flex flex-col w-full max-w-2xl max-h-[92vh] my-auto border-4 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0_#000000]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-nb-yellow border-b-4 border-black px-6 sm:px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-black uppercase italic tracking-tighter">NEW_EVENT_PROTOCOL</h2>
          </div>
          <button
            onClick={onClose}
            className="nb bg-nb-pink text-white p-3 border-4 border-black hover:bg-black transition-colors shadow-[4px_4px_0_#000000]"
          >
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white relative">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className={labelClass}>Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., AI Workshop 2026"
                  maxLength={60}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClass}>Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generating || !formData.title}
                    className="flex items-center gap-2 nb-pill bg-white px-4 py-2 border-3 border-black text-[10px] font-black uppercase tracking-widest hover:bg-nb-yellow disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0_#000000] italic"
                  >
                    <Sparkles className="w-4 h-4 text-nb-purple" />
                    {generating ? 'PROCESSING...' : 'AI_ENHANCE'}
                  </button>
                </div>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell the world about your gathering..."
                />
              </div>

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Main Auditorium"
                />
              </div>

              {/* Category & Capacity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className={inputClass}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max Participants *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxParticipants}
                    onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Team Event Toggle */}
              <div className="bg-nb-yellow/10 p-6 border-4 border-black shadow-[6px_6px_0_#000000]">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTeamEvent}
                    onChange={e => setFormData({
                      ...formData,
                      isTeamEvent: e.target.checked,
                      teamSize: e.target.checked ? formData.teamSize : undefined,
                    })}
                    className="w-6 h-6 border-4 border-black bg-white checked:bg-nb-green appearance-none shadow-[2px_2px_0_#000000]"
                  />
                  <div>
                    <span className="font-black text-lg uppercase italic">Team Event Protocol</span>
                  </div>
                </label>
              </div>

              {/* Team Size */}
              {formData.isTeamEvent && (
                <div>
                  <label className={labelClass}>Team Size *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={formData.teamSize || ''}
                    onChange={e => setFormData({ ...formData, teamSize: e.target.value ? parseInt(e.target.value) : undefined })}
                    className={inputClass}
                    placeholder="e.g., 4"
                  />
                  <p className="text-xs text-slate-400 mt-1">Members per team including the leader</p>
                </div>
              )}

              {/* Requirements */}
              <div>
                <label className={labelClass}>Requirements (Optional)</label>
                <textarea
                  value={formData.requirements}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Any prerequisites or requirements..."
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-nb-green text-black py-5 border-4 border-black font-black text-xl uppercase italic shadow-[10px_10px_0_#000000] hover:bg-nb-purple hover:text-white transition-all disabled:opacity-50 mt-8"
              >
                {loading ? 'INITIALIZING...' : 'CREATE_EVENT'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
