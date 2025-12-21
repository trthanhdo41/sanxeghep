'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Clock, Users, Phone, Package, FileText } from 'lucide-react'
import Image from 'next/image'

interface PassengerRequestDetailModalProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PassengerRequestDetailModal({ request, open, onOpenChange }: PassengerRequestDetailModalProps) {
  if (!request) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleContact = (method: 'phone' | 'zalo') => {
    const phone = request.user?.phone || '0857994994'
    if (method === 'phone') {
      window.location.href = `tel:${phone}`
    } else {
      window.open(`https://zalo.me/${phone}`, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chi Tiết Nhu Cầu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <Avatar className="w-16 h-16 border-2 border-primary/30 shadow-lg">
              <AvatarImage src={request.user?.avatar_url} alt={request.user?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-bold">
                {request.user?.full_name ? getInitials(request.user.full_name) : 'KH'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{request.user?.full_name || 'Khách hàng'}</h3>
              <div className="text-sm text-muted-foreground">
                Đăng ngày: {new Date(request.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-3">
            {/* Route */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Lộ trình</p>
                <p className="font-bold text-lg">
                  {request.from_location} → {request.to_location}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngày đi</p>
                  <p className="font-bold">{new Date(request.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Giờ đi</p>
                  <p className="font-bold">{request.time}</p>
                </div>
              </div>
            </div>

            {/* Passengers & Luggage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Số người</p>
                  <p className="font-bold">{request.passengers} người</p>
                </div>
              </div>

              {request.luggage && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                  <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hành lý</p>
                    <p className="font-bold text-sm">{request.luggage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="font-medium text-sm">{request.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Buttons */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              Liên hệ trực tiếp với khách hàng
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleContact('phone')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Gọi điện
              </Button>
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleContact('zalo')}
              >
                <Image 
                  src="/zalo-icon.svg" 
                  alt="Zalo" 
                  width={20} 
                  height={20}
                  className="mr-2"
                />
                Chat Zalo
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Lưu ý:</strong> SanXeGhep chỉ là nền tảng kết nối. Bạn và khách hàng tự thỏa thuận chi tiết chuyến đi, giá cả và thanh toán trực tiếp.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
