'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, User, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !fullName) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Validate phone
    if (!/^0\d{9}$/.test(phone)) {
      toast.error('Số điện thoại không hợp lệ')
      return
    }

    setLoading(true)
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, phone, full_name')
        .eq('phone', phone)
        .single()

      if (userError || !user) {
        toast.error('Số điện thoại không tồn tại trong hệ thống')
        setLoading(false)
        return
      }

      // Create password reset request
      const { error } = await supabase
        .from('password_reset_requests')
        .insert({
          user_id: user.id,
          phone,
          full_name: fullName,
          email: email || null,
          reason: reason || null,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Gửi yêu cầu thành công!', {
        description: 'Admin sẽ liên hệ với bạn trong thời gian sớm nhất'
      })

      handleClose()

    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Đã xảy ra lỗi', {
        description: error.message || 'Vui lòng thử lại'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPhone('')
    setFullName('')
    setEmail('')
    setReason('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quên mật khẩu</DialogTitle>
          <DialogDescription>
            Gửi yêu cầu đặt lại mật khẩu cho admin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại đã đăng ký"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (tùy chọn)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="Nhập email để admin liên hệ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do (tùy chọn)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <textarea
                id="reason"
                placeholder="VD: Quên mật khẩu, không thể đăng nhập..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 pl-10 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Lưu ý:</strong> Admin sẽ xác minh thông tin và liên hệ với bạn qua số điện thoại hoặc email để cấp mật khẩu mới.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
