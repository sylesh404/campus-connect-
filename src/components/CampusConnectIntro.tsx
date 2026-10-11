import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Megaphone, Zap, Sparkles } from 'lucide-react'

interface CampusConnectIntroProps {
  onComplete: () => void
}

export default function CampusConnectIntro({ onComplete }: CampusConnectIntroProps) {
  const [phase, setPhase] = useState<'dot' | 'boom' | 'reveal' | 'loading' | 'transition'>('dot')
  const [progress, setProgress] = useState(0)
  const [isSkipping, setIsSkipping] = useState(false)

  // Respect prefers-reduced-motion
  useEffect(() => {
    try {
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        onComplete()
        return
      }
    } catch (e) {
      console.warn("prefers-reduced-motion check failed:", e)
    }

    // Timeline Sequence
    // Phase 1: Dot pulsing (0 - 450ms)
    const timer1 = setTimeout(() => {
      setPhase('boom')
    }, 450)

    // Phase 2: BOOM & Logo Reveal (450ms - 900ms)
    const timer2 = setTimeout(() => {
      setPhase('reveal')
    }, 900)

    // Phase 3: Loading Bar Start (1600ms)
    const timer3 = setTimeout(() => {
      setPhase('loading')
    }, 1600)

    // Fallback timer: guarantee completion after 3.5 seconds on any device
    const fallbackTimer = setTimeout(() => {
      onComplete()
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(fallbackTimer)
    }
  }, [onComplete])

  // Progress Bar Filling
  useEffect(() => {
    if (phase === 'loading' || phase === 'reveal') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            // Trigger final boom transition
            setTimeout(() => {
              setPhase('transition')
              setTimeout(() => {
                onComplete()
              }, 600)
            }, 200)
            return 100
          }
          return prev + 3
        })
      }, 40)
      return () => clearInterval(interval)
    }
  }, [phase, onComplete])

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (isSkipping) return
    setIsSkipping(true)
    setPhase('transition')
    setTimeout(() => {
      onComplete()
    }, 400)
  }

  // Pre-calculated particle positions to prevent runtime template errors
  const particles = [
    { top: '15%', left: '10%', size: 8, color: 'bg-[#FFF500]' },
    { top: '25%', left: '80%', size: 12, color: 'bg-[#00FF75]' },
    { top: '70%', left: '15%', size: 10, color: 'bg-white' },
    { top: '80%', left: '75%', size: 14, color: 'bg-[#FFF500]' },
    { top: '40%', left: '90%', size: 6, color: 'bg-[#FF2D92]' },
    { top: '60%', left: '5%', size: 10, color: 'bg-[#00FF75]' },
    { top: '10%', left: '60%', size: 8, color: 'bg-white' },
    { top: '85%', left: '40%', size: 12, color: 'bg-[#FF2D92]' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        key="campus-intro-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden select-none bg-[#7400E8] text-white flex flex-col items-center justify-between p-4 sm:p-8"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px),
            linear-gradient(135deg, #7400E8 0%, #4B00B8 100%)
          `,
          backgroundSize: '24px 24px, 100% 100%',
        }}
      >
        {/* ── 1. BACKGROUND FLOATING PARTICLES ─────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                y: [0, -25, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute rounded-full ${p.color}`}
              style={{
                top: p.top,
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: 0.7,
              }}
            />
          ))}

          {/* Ambient blur lights */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF2D92]/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00FF75]/25 rounded-full blur-3xl"
          />
        </div>

        {/* ── 2. DECORATIVE STICKERS & ACCENTS ───────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {/* Top-Left Accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={phase !== 'dot' ? { opacity: 1, scale: 1, rotate: -8 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
            className="absolute top-6 left-6 sm:top-12 sm:left-12 flex items-center gap-2 bg-[#FFF500] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] px-3 py-1.5 rounded-xl font-black text-xs uppercase"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>LAUNCH EDITION</span>
          </motion.div>

          {/* Top-Right Accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 20 }}
            animate={phase !== 'dot' ? { opacity: 1, scale: 1, rotate: 6 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.6 }}
            className="absolute top-6 right-16 sm:top-12 sm:right-20 hidden sm:flex items-center gap-1.5 bg-[#FF2D92] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000000] px-3 py-1.5 rounded-xl font-black text-xs uppercase"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>LIVE 2026</span>
          </motion.div>
        </div>

        {/* ── 3. SKIP BUTTON ─────────────────────────────────────────── */}
        <div className="w-full flex justify-end items-center z-30 pt-2 pr-2">
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/15 hover:bg-white text-white hover:text-black font-black text-xs tracking-widest uppercase px-4 py-2 rounded-xl border-2 border-white hover:border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>SKIP</span>
            <span className="text-sm">→</span>
          </motion.button>
        </div>

        {/* ── 4. CENTER MAIN ANIMATION AREA ───────────────────────────── */}
        <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center z-20 my-auto py-4">

          {/* ── PHASE 1: PULSING DOT ─────────────────────────────────── */}
          {phase === 'dot' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative flex items-center justify-center"
            >
              <div className="w-6 h-6 rounded-full bg-[#FFF500] border-2 border-black shadow-[0_0_20px_#FFF500]" />
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute w-8 h-8 rounded-full border-2 border-white"
              />
            </motion.div>
          )}

          {/* ── PHASE 2: BOOM FLASH & STARBURST ─────────────────────── */}
          {phase === 'boom' && (
            <div className="relative flex items-center justify-center w-full">
              {/* White & Yellow Burst Flash */}
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: [0, 1, 0], scale: [0.2, 3] }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute w-64 h-64 rounded-full bg-white blur-xl pointer-events-none"
              />

              {/* Radial Expanding Burst Rings */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute w-48 h-48 rounded-full border-8 border-[#FFF500]"
              />

              {/* Comic Starburst Graphic 💥 */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: [0, 1.4, 1.1], rotate: [ -45, 10, 0 ] }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                className="relative z-10"
              >
                <svg viewBox="0 0 200 200" className="w-44 h-44 sm:w-56 sm:h-56 filter drop-shadow-[6px_6px_0px_#000]">
                  <path
                    d="M100 0 L120 60 L185 30 L150 90 L200 130 L135 140 L140 200 L95 155 L50 190 L65 130 L0 120 L55 85 L20 30 L80 50 Z"
                    fill="#FFF500"
                    stroke="#000000"
                    strokeWidth="7"
                  />
                  <text
                    x="100"
                    y="112"
                    textAnchor="middle"
                    fill="#000000"
                    fontSize="36"
                    fontWeight="900"
                    fontFamily="system-ui, sans-serif"
                    letterSpacing="-1"
                  >
                    BOOM!
                  </text>
                </svg>
              </motion.div>
            </div>
          )}

          {/* ── PHASE 3 & 4: LOGO REVEAL + TAGLINE + ICONS ───────────── */}
          {(phase === 'reveal' || phase === 'loading' || phase === 'transition') && (
            <div className="flex flex-col items-center text-center w-full">

              {/* ── LOGO TREATMENT ────────────────────────────────────── */}
              <div className="relative mb-6 sm:mb-8 group">
                
                {/* SVG Orbit Ring drawing around logo */}
                <svg
                  className="absolute -inset-6 sm:-inset-10 w-[120%] h-[140%] pointer-events-none overflow-visible z-20"
                  viewBox="0 0 500 200"
                  fill="none"
                >
                  <motion.path
                    d="M 30 100 C 30 20, 470 20, 470 100 C 470 180, 30 180, 30 100 Z"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeDasharray="12 12"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.path
                    d="M 40 110 C 60 170, 440 170, 460 110"
                    stroke="#FFF500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                  />
                </svg>

                {/* Staggered Logo Block Container */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-10">

                  {/* CAMPUS Block */}
                  <motion.div
                    initial={{ x: -140, y: -40, scale: 0.6, rotate: -15, opacity: 0 }}
                    animate={{ x: 0, y: 0, scale: 1, rotate: -2, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 18,
                      mass: 1.1,
                      delay: 0.05,
                    }}
                    className="bg-[#FFF500] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000000] px-6 sm:px-9 py-3 sm:py-4 rounded-2xl"
                  >
                    <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-none block">
                      CAMPUS
                    </span>
                  </motion.div>

                  {/* CONNECT. Block */}
                  <motion.div
                    initial={{ x: 140, y: 40, scale: 0.6, rotate: 15, opacity: 0 }}
                    animate={{ x: 0, y: 0, scale: 1, rotate: 2, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 18,
                      mass: 1.1,
                      delay: 0.15,
                    }}
                    className="bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_#000000] px-6 sm:px-9 py-3 sm:py-4 rounded-2xl"
                  >
                    <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-none block">
                      CONNECT<span className="text-[#FF2D92]">.</span>
                    </span>
                  </motion.div>

                </div>
              </div>

              {/* ── TAGLINE STICKER & SUBTITLE ───────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.35 }}
                className="flex flex-col items-center gap-3 mb-6 sm:mb-8"
              >
                {/* Neon Green Tagline Sticker */}
                <div className="bg-[#00FF75] text-black border-3 border-black shadow-[5px_5px_0px_0px_#000000] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2.5 rotate-[-1deg]">
                  <Zap className="w-4 h-4 fill-black text-black shrink-0" />
                  <span>CONNECT. ENGAGE. EMPOWER.</span>
                </div>

                {/* Subtitle text */}
                <p className="text-white text-sm sm:text-lg font-bold tracking-wide max-w-md px-4 leading-relaxed">
                  Your campus<span className="text-[#FFF500]">.</span> Your community<span className="text-[#00FF75]">.</span> <span className="text-[#FFF500] underline decoration-[#FF2D92] decoration-4 underline-offset-4">All in one place</span><span className="text-[#FF2D92]">.</span>
                </p>
              </motion.div>

              {/* ── 3 CAMPUS ICONS (POP → POP → POP) ─────────────────── */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 my-2">
                
                {/* 1. EVENT */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: -4 }}
                  className="bg-[#FFF500] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] p-3.5 sm:p-4 rounded-2xl flex flex-col items-center gap-1.5 -rotate-3 cursor-default"
                >
                  <div className="bg-white p-2 rounded-xl border-2 border-black">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-wider">EVENT</span>
                </motion.div>

                {/* 2. COMMUNITY */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.6 }}
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  className="bg-[#00FF75] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] p-3.5 sm:p-4 rounded-2xl flex flex-col items-center gap-1.5 rotate-2 cursor-default"
                >
                  <div className="bg-white p-2 rounded-xl border-2 border-black">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-wider">COMMUNITY</span>
                </motion.div>

                {/* 3. ANNOUNCEMENTS */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.7 }}
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  className="bg-[#FF2D92] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000000] p-3.5 sm:p-4 rounded-2xl flex flex-col items-center gap-1.5 -rotate-2 cursor-default"
                >
                  <div className="bg-white p-2 rounded-xl border-2 border-black text-black">
                    <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-wider text-white">UPDATES</span>
                </motion.div>

              </div>

            </div>
          )}

        </div>

        {/* ── 5. BOTTOM LOADING PROGRESS BAR ────────────────────────── */}
        <div className="w-full max-w-md flex flex-col items-center gap-2 z-20 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full flex flex-col items-center gap-2"
          >
            {/* Dynamic Status Text */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFF500]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00FF75] animate-ping" />
              <span>
                {progress < 85 ? 'LOADING CAMPUS LIFE...' : 'WELCOME TO CAMPUS CONNECT 🎉'}
              </span>
            </div>

            {/* Neo-brutal Progress Bar Container */}
            <div className="w-64 sm:w-80 h-6 bg-white border-3 border-black rounded-full shadow-[4px_4px_0px_0px_#000000] overflow-hidden p-0.5 relative">
              <motion.div
                className="h-full bg-[#FFF500] border-r-2 border-black rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-black tracking-wider">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── 6. FINAL BOOM BURST OVERLAY ───────────────────────────── */}
        {phase === 'transition' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 30, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="absolute z-[999999] w-32 h-32 rounded-full bg-[#7400E8] border-8 border-[#FFF500] pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
