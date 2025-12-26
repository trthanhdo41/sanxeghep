'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Loader2, User, Lock, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ForgotPasswordModal } from './ForgotPasswordModal'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate phone number (10 digits)
    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)')
      return
    }

    // Validate password
    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const userData = await signIn(phone, password)
      toast.success('Đăng nhập thành công!', {
        description: 'Chào mừng bạn quay lại',
      })
      onOpenChange(false)
      setPhone('')
      setName('')
      setPassword('')
      setConfirmPassword('')
      
      // Redirect staff/admin to admin dashboard
      if (userData?.role === 'admin' || userData?.role === 'staff') {
        router.push('/admin')
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errorMsg)
      toast.error('Đăng nhập thất bại', {
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate phone number (10 digits)
    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)')
      return
    }

    // Validate name
    if (!name.trim() || name.trim().length < 2) {
      setError('Vui lòng nhập họ tên (ít nhất 2 ký tự)')
      return
    }

    // Validate password
    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng')
      toast.error('Chưa đồng ý điều khoản', {
        description: 'Bạn cần đồng ý với điều khoản để đăng ký',
      })
      return
    }

    setLoading(true)

    try {
      // Đăng ký với vai trò passenger (mặc định)
      await signUp(phone, name.trim(), password, false)
      toast.success('Đăng ký thành công!', {
        description: 'Chào mừng bạn đến với SanXeGhep',
      })
      onOpenChange(false)
      setPhone('')
      setName('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const errorMsg = err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errorMsg)
      toast.error('Đăng ký thất bại', {
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setPhone('')
    setName('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAgreedToTerms(false)
    setShowTerms(false)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'login' 
                ? 'Nhập số điện thoại để đăng nhập'
                : 'Nhập số điện thoại và họ tên để đăng ký'
              }
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <motion.div
            key={`phone-${mode}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại của bạn"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-10"
                required
                disabled={loading}
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nhập số điện thoại 10 số (bắt đầu bằng 0)
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0, x: -20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="password-field"
                initial={{ opacity: 0, height: 0, x: -20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mật khẩu phải có ít nhất 6 ký tự
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <>
                <motion.div
                  key="password-register"
                  initial={{ opacity: 0, height: 0, x: -20 }}
                  animate={{ opacity: 1, height: 'auto', x: 0 }}
                  exit={{ opacity: 0, height: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="password-register">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="password-register"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0, x: -20 }}
                  animate={{ opacity: 1, height: 'auto', x: 0 }}
                  exit={{ opacity: 0, height: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="terms-checkbox"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                    Tôi đã đọc và đồng ý với{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-primary hover:underline font-medium"
                    >
                      Điều khoản sử dụng
                    </button>{' '}
                    của Sàn Xe Ghép
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-red-50 border border-red-200 p-3"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={`button-${mode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
              )}
            </Button>
          </motion.div>

          <motion.div
            key={`switch-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center space-y-2"
          >
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-all block w-full"
                disabled={loading}
              >
                Quên mật khẩu?
              </button>
            )}
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-primary hover:underline transition-all"
              disabled={loading}
            >
              {mode === 'login' 
                ? 'Chưa có tài khoản? Đăng ký ngay'
                : 'Đã có tài khoản? Đăng nhập'
              }
            </button>
          </motion.div>
        </form>

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold">Điều khoản sử dụng</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vui lòng đọc kỹ trước khi đăng ký
                </p>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Điều khoản hành khách */}
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-primary">ĐIỀU KHOẢN DÀNH CHO HÀNH KHÁCH</h4>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      ⚠️ Lưu ý quan trọng:
                    </p>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                      <li>Sàn Xe Ghép chỉ là nơi kết nối. Khách và tài xế tự thỏa thuận giá và chịu trách nhiệm về chuyến đi.</li>
                      <li>Mọi vấn đề phát sinh trong chuyến đi do tài xế và hành khách tự giải quyết với nhau.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold">I. Vai trò của Sàn Xe Ghép</h5>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>Hành khách tự lựa chọn tài xế phù hợp với nhu cầu của mình.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold">II. Nghĩa vụ của hành khách</h5>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>Cung cấp thông tin chính xác khi đặt chuyến.</li>
                      <li>Có mặt đúng giờ.</li>
                      <li>Tôn trọng tài xế và không gian xe.</li>
                      <li>Không mang hàng cấm, chất nguy hiểm.</li>
                      <li>Không đặt ảo, không hủy chuyến nhiều lần.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold">III. Quyền của hành khách</h5>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>Lựa chọn tài xế phù hợp.</li>
                      <li>Xem thông tin cơ bản của tài xế: SĐT, biển số, ảnh, lịch trình.</li>
                      <li>Báo cáo tài xế vi phạm.</li>
                      <li>Yêu cầu xóa tài khoản.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold">IV. Hành vi nghiêm cấm</h5>
                    <ul className="text-sm space-y-1 list-disc list-inside text-red-700 dark:text-red-400">
                      <li>Đặt khách ảo để phá tài xế.</li>
                      <li>Yêu cầu tài xế đi sai lộ trình nguy hiểm.</li>
                      <li>Quấy rối, gây mất trật tự.</li>
                      <li>Trốn thanh toán (nếu hai bên thỏa thuận chi phí).</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold">V. Xử lý vi phạm</h5>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>Khóa tài khoản</li>
                      <li>Cấm vĩnh viễn</li>
                      <li>Báo cơ quan chức năng khi có dấu hiệu lừa đảo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex gap-3">
                <Button
                  onClick={() => setShowTerms(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setAgreedToTerms(true)
                    setShowTerms(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  Đồng ý
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <ForgotPasswordModal 
      isOpen={showForgotPassword}
      onClose={() => setShowForgotPassword(false)}
    />
  </>
  )
}
