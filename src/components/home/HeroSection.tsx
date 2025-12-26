'use client'

import { MapPin, Calendar, Car, User, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { searchLocations } from '@/lib/vietnam-locations'
import { useAuth } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth/AuthModal'
import { DriverRegistrationWizard } from '@/components/driver/DriverRegistrationWizard'

export function HeroSection() {
  const router = useRouter()
  const { user } = useAuth()
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const wasWaitingForAuth = useRef(false)
  const wasWaitingForPassenger = useRef(false)
  
  // Auto set ngày hiện tại
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  // Gợi ý địa điểm
  const fromSuggestions = useMemo(() => searchLocations(fromLocation), [fromLocation])
  const toSuggestions = useMemo(() => searchLocations(toLocation), [toLocation])

  // Auto-open wizard after successful login (for driver)
  useEffect(() => {
    if (user && wasWaitingForAuth.current) {
      wasWaitingForAuth.current = false
      setAuthModalOpen(false)
      setTimeout(() => {
        setWizardOpen(true)
      }, 300)
    }
  }, [user])

  // Auto-redirect to passenger request page after login
  useEffect(() => {
    if (user && wasWaitingForPassenger.current) {
      wasWaitingForPassenger.current = false
      setAuthModalOpen(false)
      router.push('/dang-nhu-cau')
    }
  }, [user, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!fromLocation.trim() || !toLocation.trim()) {
      toast.error('Vui lòng nhập điểm đi và điểm đến')
      return
    }
    
    // Chuyển sang trang tìm chuyến với params
    const params = new URLSearchParams({
      from: fromLocation,
      to: toLocation,
      date: date,
    })
    
    router.push(`/tim-chuyen?${params.toString()}`)
  }

  const handleDriverClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (user?.is_driver) {
      // Đã là driver → đi trang đăng chuyến
      router.push('/dang-chuyen')
    } else {
      // Chưa đăng nhập hoặc chưa là driver → đi trang tài xế
      router.push('/tai-xe?action=register')
    }
  }

  const handlePassengerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (user) {
      // Đã đăng nhập → đi trang đăng nhu cầu
      router.push('/dang-nhu-cau')
    } else {
      // Chưa đăng nhập → mở auth modal, sau khi login sẽ redirect
      wasWaitingForPassenger.current = true
      setAuthModalOpen(true)
    }
  }

  const handleWizardSuccess = () => {
    window.location.reload()
  }

  return (
    <section className="relative min-h-[450px] flex items-center justify-center overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-12.jpg)',
          }}
        />
        {/* Darker overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50" />
      </div>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container relative z-10 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] text-white drop-shadow-2xl">
              Ghép chuyến thông minh
              <br />
              <span className="inline-block mt-2 pb-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 animate-gradient">
                Tiết kiệm mọi hành trình
              </span>
            </h1>
            <p className="text-sm md:text-base text-white/95 max-w-xl mx-auto font-medium drop-shadow-lg leading-relaxed">
              Kết nối tài xế và hành khách trên toàn quốc. An toàn, tiện lợi, giá rẻ.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-20"
          >
            <form 
              onSubmit={handleSearch}
              className="glass shadow-2xl rounded-2xl p-4 md:p-6 space-y-4 border border-white/20 backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* From Location */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={20} />
                  <input
                    type="text"
                    placeholder="Điểm đi"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-medium placeholder:text-muted-foreground/60"
                    autoComplete="off"
                  />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-[100]">
                      {fromSuggestions.map((location, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFromLocation(location)
                            setShowFromSuggestions(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                        >
                          <MapPin size={16} className="text-muted-foreground" />
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To Location */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary transition-colors z-10" size={20} />
                  <input
                    type="text"
                    placeholder="Điểm đến"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-medium placeholder:text-muted-foreground/60"
                    autoComplete="off"
                  />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-[100]">
                      {toSuggestions.map((location, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setToLocation(location)
                            setShowToSuggestions(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                        >
                          <MapPin size={16} className="text-muted-foreground" />
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="relative group">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-medium text-left"
                    style={{
                      colorScheme: 'light'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(to right, #ea580c, #ec4899)',
                  backgroundColor: '#ea580c' // Fallback for old browsers
                }}
                className="relative w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to right, #ec4899, #ea580c)'
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Search size={20} className="flex-shrink-0" />
                  Tìm chuyến ngay
                </span>
              </button>
            </form>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto relative z-10"
          >
            <motion.button
              onClick={handleDriverClick}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(to right, #ea580c, #ec4899)',
                backgroundColor: '#ea580c' // Fallback
              }}
              className="group relative overflow-hidden px-8 py-5 rounded-2xl text-white font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to right, #ec4899, #ea580c)'
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <motion.div
                  animate={{ 
                    x: [0, 3, 0, -3, 0],
                    rotate: [0, -2, 0, 2, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Car size={22} className="flex-shrink-0" />
                </motion.div>
                <span>Tôi là tài xế - Đăng chuyến</span>
              </span>
            </motion.button>

            <motion.button
              onClick={handlePassengerClick}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(to right, #0f172a, rgba(15, 23, 42, 0.9))',
                backgroundColor: '#0f172a' // Fallback
              }}
              className="group relative overflow-hidden px-8 py-5 rounded-2xl text-white font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9), #0f172a)'
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <User size={22} className="flex-shrink-0" />
                <span>Tôi là khách - Đăng nhu cầu</span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open)
          if (!open) {
            wasWaitingForAuth.current = false
            wasWaitingForPassenger.current = false
          }
        }}
      />

      {/* Driver Registration Wizard */}
      <DriverRegistrationWizard 
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleWizardSuccess}
      />
    </section>
  )
}
