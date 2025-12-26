'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Shield, TrendingUp, CheckCircle, Gift, ArrowRight, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DriverApplicationForm } from '@/components/driver/DriverApplicationForm'
import { DriverRegistrationWizard } from '@/components/driver/DriverRegistrationWizard'
import { DriverTestimonials } from '@/components/driver/DriverTestimonials'
import { DriverFAQ } from '@/components/driver/DriverFAQ'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/lib/auth-context'

export default function TaiXePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const wasWaitingForAuth = useRef(false)
  const [requirementsVisible, setRequirementsVisible] = useState(false)
  const requirementsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to form when coming from homepage
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'register') {
      // Wait for page to load
      setTimeout(() => {
        // Scroll to form section
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        
        // Wait for scroll to finish, then blink the login box
        setTimeout(() => {
          const loginBox = document.getElementById('driver-login-box')
          if (loginBox) {
            // Nháy 2 lần viền: bật → tắt → bật → tắt
            // Lần 1: BẬT
            loginBox.classList.add('ring-4', 'ring-orange-400')
            
            setTimeout(() => {
              // Lần 1: TẮT
              loginBox.classList.remove('ring-4', 'ring-orange-400')
              
              setTimeout(() => {
                // Lần 2: BẬT
                loginBox.classList.add('ring-4', 'ring-orange-400')
                
                setTimeout(() => {
                  // Lần 2: TẮT
                  loginBox.classList.remove('ring-4', 'ring-orange-400')
                }, 400)
              }, 200)
            }, 400)
          }
        }, 800)
      }, 300)
    }
  }, [searchParams])

  // Auto-open wizard after successful login
  useEffect(() => {
    if (user && wasWaitingForAuth.current) {
      wasWaitingForAuth.current = false
      setAuthModalOpen(false)
      // Small delay to ensure auth modal closes first
      setTimeout(() => {
        setWizardOpen(true)
      }, 300)
    }
  }, [user])

  // Intersection Observer for requirements section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !requirementsVisible) {
            setRequirementsVisible(true)
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it's fully in view
      }
    )

    if (requirementsRef.current) {
      observer.observe(requirementsRef.current)
    }

    return () => {
      if (requirementsRef.current) {
        observer.unobserve(requirementsRef.current)
      }
    }
  }, [requirementsVisible])

  const handleRegisterClick = () => {
    if (!user) {
      // If not logged in, open auth modal and mark that we're waiting
      wasWaitingForAuth.current = true
      setAuthModalOpen(true)
      return
    }
    
    // If user is logged in, open wizard
    setWizardOpen(true)
  }

  const handleWizardSuccess = () => {
    // Refresh the page or update state to show pending status
    window.location.reload()
  }

  const requirements = [
    { text: 'Có bằng lái phù hợp', icon: Shield },
    { text: 'Tuân thủ luật giao thông', icon: CheckCircle },
    { text: 'Phương tiện đảm bảo an toàn', icon: Car },
    { text: 'Ứng xử văn minh', icon: CheckCircle },
    { text: 'Không sử dụng rượu bia khi lái xe', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Trở Thành Tài Xế SanXeGhep
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Tận dụng ghế trống, tăng thu nhập, kết nối cộng đồng
          </p>
          
          {/* Quick Benefits */}
          <div className="flex flex-wrap gap-4 justify-center items-center max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Miễn phí 100%</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Kết nối khách tự động</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <CheckCircle className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-700">Không trung gian – không chia tiền</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">Không ràng buộc</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {user?.is_driver ? (
              <Link href="/dang-chuyen">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 h-auto"
                >
                  <Car className="w-6 h-6 mr-2" />
                  Đăng chuyến ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6 h-auto animate-shake"
                onClick={handleRegisterClick}
              >
                <Car className="w-6 h-6 mr-2" />
                {user ? 'Nâng cấp lên Tài Xế' : 'Đăng ký Tài Xế Miễn Phí'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            <Link href="/lien-he">
              <Button size="lg" variant="outline" className="text-base px-6 py-6 h-auto">
                Liên hệ hỗ trợ
              </Button>
            </Link>
          </div>
        </div>

        {/* Video Giới Thiệu */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">Giới Thiệu Sàn Xe Ghép</h2>
            <p className="text-muted-foreground">
              Xem video để hiểu rõ hơn về cách hoạt động và lợi ích khi tham gia
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <video 
              controls 
              autoPlay 
              muted 
              loop
              playsInline
              className="w-full aspect-video"
              poster="/logo.png"
            >
              <source src="/intro-video.mp4" type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>

        {/* Driver Registration Form - Inline */}
        {!user?.is_driver && (
          <div ref={formRef} className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Đăng Ký Tài Xế</h2>
              <p className="text-muted-foreground">
                Điền thông tin bên dưới để bắt đầu hành trình làm tài xế
              </p>
            </div>
            <DriverApplicationForm 
              onOpenWizard={() => setWizardOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-16">
          <DriverTestimonials />
        </div>

        {/* Requirements - Compact Checklist */}
        <div ref={requirementsRef} className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Yêu Cầu Tài Xế</h2>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
            <div className="space-y-3">
              {requirements.map((req, idx) => {
                const ReqIcon = req.icon
                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between gap-3 p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors"
                    style={{
                      animation: requirementsVisible ? `fadeInUp 0.5s ease-out ${idx * 0.15}s both` : 'none',
                      opacity: requirementsVisible ? 1 : 0
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <ReqIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{req.text}</span>
                    </div>
                    <div 
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      style={{
                        animation: requirementsVisible ? `checkmarkPop 0.4s ease-out ${idx * 0.15 + 0.3}s both` : 'none',
                        opacity: requirementsVisible ? 1 : 0,
                        transform: requirementsVisible ? 'scale(1)' : 'scale(0)'
                      }}
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Referral Program - Banner Mini */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-1">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[22px] p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Icon & Badge */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    HOT
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                      Chương Trình Giới Thiệu
                    </h3>
                  </div>
                  <p className="text-lg text-gray-700 mb-4">
                    Mời bạn bè tham gia làm tài xế và <span className="font-bold text-orange-600">nhận thưởng hấp dẫn!</span>
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Thưởng đăng ký</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Thưởng chuyến đầu</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Không giới hạn</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg px-8"
                >
                  Tìm hiểu thêm
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <DriverFAQ />
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Đã Là Tài Xế?</h2>
            <p className="text-lg mb-8 opacity-90">
              Đăng chuyến đi ngay để bắt đầu kiếm thêm thu nhập
            </p>
            <Link href="/dang-chuyen">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Car className="w-5 h-5 mr-2" />
                Đăng chuyến đầu tiên
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open)
          if (!open) {
            wasWaitingForAuth.current = false
          }
        }}
      />

      {/* Registration Wizard */}
      <DriverRegistrationWizard 
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleWizardSuccess}
      />
    </div>
  )
}
