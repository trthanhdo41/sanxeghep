'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LogOut, User, Shield, Car, UserCircle, Crown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'driver' | 'passenger'>('driver') // Toggle mode
  const { user, signOut } = useAuth()
  
  // Auto set view mode based on user role
  useEffect(() => {
    if (user?.is_driver && !user?.is_passenger) {
      setViewMode('driver')
    } else if (!user?.is_driver && user?.is_passenger) {
      setViewMode('passenger')
    }
    // If both, keep current mode
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Đăng xuất thành công!', {
        description: 'Hẹn gặp lại bạn',
      })
    } catch (error) {
      toast.error('Đăng xuất thất bại', {
        description: 'Vui lòng thử lại',
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-12 w-48">
            <Image 
              src="/logo.png" 
              alt="SanXeGhep" 
              fill
              sizes="(max-width: 768px) 150px, 192px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-5">
          {/* Mode Toggle for multi-role users (not admin) */}
          {user?.is_driver && user?.is_passenger && user?.role !== 'admin' && (
            <div className="relative flex items-center bg-muted rounded-lg p-1 w-[180px]">
              {/* Animated background */}
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-md shadow-sm"
                initial={false}
                animate={{
                  left: viewMode === 'driver' ? '4px' : 'calc(50% + 0px)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
              
              {/* Buttons */}
              <button
                onClick={() => setViewMode('driver')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'driver' 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Car size={14} />
                Tài xế
              </button>
              <button
                onClick={() => setViewMode('passenger')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'passenger' 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCircle size={14} />
                Khách
              </button>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {/* Passenger mode or non-driver - Find trips */}
            {(viewMode === 'passenger' || !user?.is_driver) && (
              <motion.div
                key="find-trips"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/tim-chuyen" className="text-sm font-medium hover:text-primary transition-colors">
                  Tìm chuyến
                </Link>
              </motion.div>
            )}
            
            {/* Driver mode - Post trip */}
            {viewMode === 'driver' && user?.is_driver && (
              <motion.div
                key="post-trip"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/dang-chuyen" className="text-sm font-medium hover:text-primary transition-colors">
                  Tài xế đăng
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* User & Driver - Post request */}
          {user ? (
            <Link href="/dang-nhu-cau" className="text-sm font-medium hover:text-primary transition-colors">
              Hành khách đăng
            </Link>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Hành khách đăng
            </button>
          )}
          
          {/* Public - Become driver page */}
          <Link href="/tai-xe" className="text-sm font-medium hover:text-primary transition-colors">
            Trở thành tài xế
          </Link>
          
          <AnimatePresence mode="wait">
            {/* Driver mode - View passenger requests */}
            {viewMode === 'driver' && user?.is_driver && (
              <motion.div
                key="passenger-requests"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/nhu-cau-hanh-khach" className="text-sm font-medium hover:text-primary transition-colors">
                  Tài xế tự tìm khách
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Public pages */}
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/ve-chung-toi" className="text-sm font-medium hover:text-primary transition-colors">
            Về chúng tôi
          </Link>
          <Link href="/lien-he" className="text-sm font-medium hover:text-primary transition-colors">
            Liên hệ
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <>
              {/* Admin Dashboard Link */}
              {user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Shield size={18} />
                  <span>Quản trị</span>
                </Link>
              )}
              
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <User size={18} />
                <span>Tài khoản</span>
                {user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    <Crown className="w-3 h-3" />
                    VIP
                  </span>
                )}
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </Button>
            </>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{
                background: 'linear-gradient(to right, #ea580c, #ec4899)',
                backgroundColor: '#ea580c' // Fallback for old browsers
              }}
              className="relative px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all btn-glow overflow-hidden"
            >
              <span className="relative z-10">Đăng nhập</span>
            </button>
          )}
        </div>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-white"
          >
            <nav className="container py-4 flex flex-col space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Login/User section - Always at top */}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin"
                      className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="inline w-4 h-4 mr-2" />
                      Quản trị
                    </Link>
                  )}
                  <Link 
                    href="/profile"
                    className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors bg-muted/50 rounded-lg flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="inline w-4 h-4 mr-2" />
                    Tài khoản
                    {user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()) && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        <span>👑</span>
                        VIP
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-center rounded-lg border border-primary text-primary hover:bg-primary/5"
                  >
                    <LogOut className="inline w-4 h-4 mr-2" />
                    Đăng xuất
                  </button>
                  <div className="border-t my-2"></div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      background: 'linear-gradient(to right, #ea580c, #ec4899)',
                      backgroundColor: '#ea580c' // Fallback
                    }}
                    className="px-6 py-3 text-sm font-semibold text-center rounded-lg text-white shadow-md"
                  >
                    Đăng nhập
                  </button>
                  <div className="border-t my-2"></div>
                </>
              )}
              
              {/* Mode Toggle for multi-role users (not admin) */}
              {user?.is_driver && user?.is_passenger && user?.role !== 'admin' && (
                <>
                  <div className="relative flex items-center bg-muted rounded-lg p-1">
                    {/* Animated background */}
                    <motion.div
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-md shadow-sm"
                      initial={false}
                      animate={{
                        left: viewMode === 'driver' ? '4px' : 'calc(50% + 0px)'
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                    
                    {/* Buttons */}
                    <button
                      onClick={() => setViewMode('driver')}
                      className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'driver' 
                          ? 'text-white' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Car size={16} />
                      Tài xế
                    </button>
                    <button
                      onClick={() => setViewMode('passenger')}
                      className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        viewMode === 'passenger' 
                          ? 'text-white' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <UserCircle size={16} />
                      Khách
                    </button>
                  </div>
                  <div className="border-t my-2"></div>
                </>
              )}
              
              {/* Navigation links */}
              <AnimatePresence mode="wait">
                {(viewMode === 'passenger' || !user?.is_driver) && (
                  <motion.div
                    key="mobile-find-trips"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href="/tim-chuyen" 
                      className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tìm chuyến
                    </Link>
                  </motion.div>
                )}
                
                {viewMode === 'driver' && user?.is_driver && (
                  <motion.div
                    key="mobile-post-trip"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href="/dang-chuyen" 
                      className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tài xế đăng
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {user ? (
                <Link 
                  href="/dang-nhu-cau" 
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hành khách đăng
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg text-left w-full"
                >
                  Hành khách đăng
                </button>
              )}
              
              <Link 
                href="/tai-xe" 
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trở thành tài xế
              </Link>
              
              <AnimatePresence mode="wait">
                {viewMode === 'driver' && user?.is_driver && (
                  <motion.div
                    key="mobile-passenger-requests"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href="/nhu-cau-hanh-khach" 
                      className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tài xế tự tìm khách
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Link 
                href="/blog" 
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/ve-chung-toi" 
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Về chúng tôi
              </Link>
              <Link 
                href="/lien-he" 
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors hover:bg-muted/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
