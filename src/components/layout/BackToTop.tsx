'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 group"
          aria-label="Back to top"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
          
          {/* Button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group-hover:scale-110 active:scale-95">
            {/* Inner circle */}
            <div className="absolute inset-[2px] rounded-full bg-background/10 backdrop-blur-sm" />
            
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <ArrowUp size={24} className="text-white" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              Về đầu trang
              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-foreground" />
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
