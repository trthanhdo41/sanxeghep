'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Star, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'booking_new' | 'booking_confirmed' | 'booking_rejected' | 'booking_completed'
  data: {
    passengerName?: string
    driverName?: string
    seatsBooked?: number
  }
}

export function NotificationModal({ open, onOpenChange, type, data }: NotificationModalProps) {
  const router = useRouter()

  const handleAction = (path: string) => {
    onOpenChange(false)
    router.push(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            {type === 'booking_new' && (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center animate-bounce">
                <Bell className="w-10 h-10 text-amber-600" />
              </div>
            )}
            {type === 'booking_confirmed' && (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {type === 'booking_rejected' && (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            {type === 'booking_completed' && (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            {type === 'booking_new' && (
              <>
                <h2 className="text-2xl font-bold text-amber-600">Có đặt chỗ mới!</h2>
                <p className="text-muted-foreground">
                  <strong>{data.passengerName}</strong> đã đặt <strong>{data.seatsBooked} ghế</strong>
                </p>
              </>
            )}
            {type === 'booking_confirmed' && (
              <>
                <h2 className="text-2xl font-bold text-green-600">Đặt chỗ đã được xác nhận!</h2>
                <p className="text-muted-foreground">
                  Tài xế <strong>{data.driverName}</strong> đã xác nhận chuyến đi của bạn
                </p>
              </>
            )}
            {type === 'booking_rejected' && (
              <>
                <h2 className="text-2xl font-bold text-red-600">Đặt chỗ bị từ chối</h2>
                <p className="text-muted-foreground">
                  Tài xế <strong>{data.driverName}</strong> đã từ chối đặt chỗ của bạn
                </p>
              </>
            )}
            {type === 'booking_completed' && (
              <>
                <h2 className="text-2xl font-bold text-blue-600">Chuyến đi hoàn thành!</h2>
                <p className="text-muted-foreground">
                  Hãy đánh giá tài xế để giúp cộng đồng
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Đóng
            </Button>
            {type === 'booking_new' && (
              <Button
                onClick={() => handleAction('/profile/bookings')}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Xem ngay
              </Button>
            )}
            {type === 'booking_confirmed' && (
              <Button
                onClick={() => handleAction('/profile/my-bookings')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Xem chi tiết
              </Button>
            )}
            {type === 'booking_rejected' && (
              <Button
                onClick={() => handleAction('/tim-chuyen')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Tìm chuyến khác
              </Button>
            )}
            {type === 'booking_completed' && (
              <Button
                onClick={() => handleAction('/profile/my-bookings')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Đánh giá ngay
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
