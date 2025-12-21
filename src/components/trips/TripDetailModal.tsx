'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Clock, Users, Phone, Star, CheckCircle, Car, Banknote, FileText, Lock } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth/AuthModal'

interface TripDetailModalProps {
  trip: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TripDetailModal({ trip, open, onOpenChange }: TripDetailModalProps) {
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  if (!trip) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleContact = async (method: 'phone' | 'zalo') => {
    // Require login to see contact info
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    // Fetch phone number from database (only when user is logged in)
    let phone = '0857994994' // fallback
    if (trip.driverId) {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase
        .from('users')
        .select('phone')
        .eq('id', trip.driverId)
        .single()
      
      if (data?.phone) {
        phone = data.phone
      }
    }

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
          <DialogTitle className="text-2xl font-bold">Chi Tiết Chuyến Đi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <Avatar className="w-16 h-16 border-2 border-primary/30 shadow-lg">
              <AvatarImage src={trip.driver.avatar} alt={trip.driver.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-bold">
                {getInitials(trip.driver.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{trip.driver.name}</h3>
                {trip.driver.verified && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã xác minh
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{trip.driver.rating}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{trip.driver.totalTrips} chuyến</span>
              </div>
              {/* Phone preview */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {user ? (
                  <span className="font-medium text-foreground">Nhấn nút bên dưới để liên hệ</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">0962 *** ***</span>
                    <span className="text-xs text-muted-foreground">(Đăng nhập để xem)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            {/* Route */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Lộ trình</p>
                <p className="font-bold text-lg">
                  {trip.from} → {trip.to}
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
                  <p className="font-bold">{trip.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Giờ đi</p>
                  <p className="font-bold">{trip.time}</p>
                </div>
              </div>
            </div>

            {/* Seats & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Số ghế</p>
                  <p className="font-bold">
                    {trip.seatsAvailable}/{trip.totalSeats} ghế trống
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Banknote className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Giá dự kiến</p>
                  {user ? (
                    <p className="font-bold text-orange-600 dark:text-orange-400 text-xl">
                      {trip.price.toLocaleString('vi-VN')}đ
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-muted-foreground text-lg">
                        ***{(trip.price % 1000).toString().padStart(3, '0')}đ
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Đăng nhập để xem giá đầy đủ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Loại xe</p>
                <p className="font-bold">{trip.vehicleType}</p>
              </div>
            </div>

            {/* Notes - if available */}
            {trip.notes && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="font-medium text-sm">{trip.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Buttons */}
          <div className="space-y-3 pt-2">
            {user ? (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Liên hệ trực tiếp với tài xế để đặt chuyến
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
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-5 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                    <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">
                    Đăng nhập để xem SĐT / Zalo
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    Để bảo vệ quyền riêng tư của tài xế, vui lòng đăng ký/đăng nhập để xem số điện thoại và liên hệ trực tiếp.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all text-base font-semibold"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Đăng nhập ngay
                </Button>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Lưu ý:</strong> SanXeGhep chỉ là nền tảng kết nối. Bạn và tài xế tự thỏa thuận chi tiết chuyến đi, giá cả và thanh toán trực tiếp.
            </p>
          </div>
        </div>
      </DialogContent>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    </Dialog>
  )
}
