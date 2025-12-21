'use client'

import { useState, useEffect } from 'react'
import { Car, Phone, User, FileText, Calendar, Loader2, CheckCircle, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Link from 'next/link'

interface DriverApplicationFormProps {
  onOpenWizard?: () => void
  onOpenAuth?: () => void
}

export function DriverApplicationForm({ onOpenWizard, onOpenAuth }: DriverApplicationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    vehicleType: '',
    licensePlate: '',
    licenseNumber: '',
    experienceYears: '',
    notes: '',
  })

  useEffect(() => {
    if (user) {
      checkApplicationStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkApplicationStatus = async () => {
    if (!user) return

    try {
      // Check if user is already a driver
      if (user.role === 'driver') {
        setApplicationStatus('approved')
        setLoading(false)
        return
      }

      // Check if user has an application
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setApplicationStatus(data.status)
      } else {
        setApplicationStatus('none')
      }
    } catch (error) {
      setApplicationStatus('none')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký')
      return
    }

    setLoading(true)

    try {

      // Create new application
      const { error } = await supabase
        .from('driver_applications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate.toUpperCase(),
          license_number: formData.licenseNumber,
          experience_years: parseInt(formData.experienceYears) || 0,
          notes: formData.notes || null,
          status: 'pending',
        })

      if (error) throw error

      toast.success('Đăng ký thành công!', {
        description: 'Đơn đăng ký của bạn đang chờ admin xét duyệt',
      })

      setSubmitted(true)
    } catch (error: any) {
      console.error('Error submitting application:', error)
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Vui lòng thử lại sau',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div 
        id="driver-login-box"
        className="bg-card border border-border rounded-2xl p-8 text-center transition-all duration-300"
      >
        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Đăng nhập để đăng ký</h3>
        <p className="text-muted-foreground mb-6">
          Vui lòng đăng nhập để đăng ký làm tài xế SanXeGhep
        </p>
        <Button size="lg" onClick={onOpenAuth}>Đăng nhập ngay</Button>
      </div>
    )
  }

  // Already a driver - show dashboard
  if (applicationStatus === 'approved') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-12 text-center">
        <div className="p-4 rounded-full bg-green-100 w-fit mx-auto mb-6">
          <Shield className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Bạn đã là tài xế SanXeGhep!</h3>
        <p className="text-muted-foreground mb-6">
          Tài khoản của bạn đã được xác minh. Bắt đầu đăng chuyến để kiếm thêm thu nhập ngay!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dang-chuyen">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
              <Car className="w-5 h-5 mr-2" />
              Đăng chuyến ngay
            </Button>
          </Link>
          <Link href="/profile">
            <Button size="lg" variant="outline">
              Xem hồ sơ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Application pending - show status
  if (applicationStatus === 'pending' || submitted) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-12 text-center">
        <div className="p-4 rounded-full bg-amber-100 w-fit mx-auto mb-6">
          <Clock className="w-12 h-12 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Đơn đăng ký đang chờ duyệt</h3>
        <p className="text-muted-foreground mb-6">
          Đơn đăng ký của bạn đã được gửi đi. Admin sẽ xem xét và phản hồi trong vòng 24-48 giờ.
        </p>
        <p className="text-sm text-muted-foreground">
          Bạn sẽ nhận được thông báo qua số điện thoại đã đăng ký.
        </p>
      </div>
    )
  }

  // Application rejected - show message
  if (applicationStatus === 'rejected') {
    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-12 text-center">
        <div className="p-4 rounded-full bg-red-100 w-fit mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Đơn đăng ký chưa được chấp nhận</h3>
        <p className="text-muted-foreground mb-6">
          Rất tiếc, đơn đăng ký của bạn chưa đáp ứng yêu cầu. Vui lòng liên hệ admin để biết thêm chi tiết.
        </p>
        <Link href="/lien-he">
          <Button variant="outline">Liên hệ hỗ trợ</Button>
        </Link>
      </div>
    )
  }

  // Show wizard button for users who haven't applied
  if (applicationStatus === 'none' && onOpenWizard) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 w-fit mx-auto mb-6">
          <Car className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Bắt đầu hành trình tài xế</h3>
        <p className="text-muted-foreground mb-8">
          Hoàn thành 4 bước đơn giản để trở thành tài xế SanXeGhep và bắt đầu kiếm thêm thu nhập
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-2">01</div>
            <p className="text-sm font-medium">Thông tin cá nhân</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-2">02</div>
            <p className="text-sm font-medium">Thông tin xe</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-2">03</div>
            <p className="text-sm font-medium">Giấy tờ & Kinh nghiệm</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-primary mb-2">04</div>
            <p className="text-sm font-medium">Xác nhận</p>
          </div>
        </div>

        <Button 
          size="lg" 
          className="bg-gradient-to-r from-primary to-accent"
          onClick={onOpenWizard}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Bắt đầu đăng ký
        </Button>
      </div>
    )
  }

  return null
}
