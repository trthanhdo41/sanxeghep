'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Users, MessageSquare, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: {
    id: string
    driver_id: string
    driver_name: string
    from_location: string
    to_location: string
    departure_time: string
    available_seats: number
    price_per_seat: number
  }
  onSuccess?: () => void
}

export function BookingModal({ open, onOpenChange, trip, onSuccess }: BookingModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [seatsBooked, setSeatsBooked] = useState(1)
  const [note, setNote] = useState('')

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt chỗ')
      return
    }

    if (user.id === trip.driver_id) {
      toast.error('Bạn không thể đặt chỗ trên chuyến đi của chính mình')
      return
    }

    if (seatsBooked > trip.available_seats) {
      toast.error(`Chỉ còn ${trip.available_seats} ghế trống`)
      return
    }

    setLoading(true)

    try {
      // Check if user already has an active booking for this trip
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('trip_id', trip.id)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'confirmed'])

      if (existingBookings && existingBookings.length > 0) {
        const status = existingBookings[0].status
        if (status === 'pending') {
          throw new Error('Bạn đã có yêu cầu đặt chỗ đang chờ xác nhận trên chuyến này')
        }
        if (status === 'confirmed') {
          throw new Error('Bạn đã đặt chỗ thành công trên chuyến này rồi')
        }
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          trip_id: trip.id,
          passenger_id: user.id,
          driver_id: trip.driver_id,
          seats_booked: seatsBooked,
          passenger_note: note || null,
          status: 'pending',
        })

      if (error) {
        throw error
      }

      toast.success('Đặt chỗ thành công!', {
        description: 'Tài xế sẽ xác nhận trong thời gian sớm nhất',
      })

      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setSeatsBooked(1)
      setNote('')
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error('Đặt chỗ thất bại', {
        description: error.message || 'Vui lòng thử lại',
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = seatsBooked * trip.price_per_seat

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt chỗ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tài xế</span>
              <span className="font-medium">{trip.driver_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tuyến đường</span>
              <span className="font-medium text-right">{trip.from_location} → {trip.to_location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Thời gian</span>
              <span className="font-medium">
                {new Date(trip.departure_time).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ghế trống</span>
              <span className="font-medium">{trip.available_seats} chỗ</span>
            </div>
          </div>

          {/* Seats Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Số ghế đặt
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={num > trip.available_seats}
                  onClick={() => setSeatsBooked(num)}
                  className={`
                    py-3 rounded-lg font-medium transition-all
                    ${num > trip.available_seats 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : seatsBooked === num
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-muted hover:border-primary'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Ghi chú cho tài xế (không bắt buộc)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Tôi có 1 vali lớn, điểm đón tại cổng A..."
              className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length}/200 ký tự
            </p>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {seatsBooked} ghế × {trip.price_per_seat.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-2xl font-bold text-primary">
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Thanh toán trực tiếp cho tài xế
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận đặt chỗ'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
