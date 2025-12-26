'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, MapPin, Calendar, Phone, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ReviewModal } from '@/components/booking/ReviewModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Booking {
  id: string
  trip_id: string
  passenger_id: string
  driver_id: string
  seats_booked: number
  passenger_note: string | null
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  created_at: string
  confirmed_at: string | null
  completed_at: string | null
  driver: {
    full_name: string
    phone: string
    avatar_url: string | null
    rating: number
    completed_trips: number
  }
  trip: {
    from_location: string
    to_location: string
    date: string
    time: string
    price: number
  }
  has_reviewed: boolean
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending')
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    bookingId: string
    driverName: string
  } | null>(null)
  const [reviewModal, setReviewModal] = useState<{
    open: boolean
    booking: Booking
  } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      // Fetch bookings where user is passenger
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          driver:users!bookings_driver_id_fkey(full_name, phone, avatar_url, rating, completed_trips),
          trip:trips(from_location, to_location, date, time, price)
        `)
        .eq('passenger_id', user!.id)
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      // Check if user has reviewed each booking
      const bookingsWithReviewStatus = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: review } = await supabase
            .from('reviews')
            .select('id')
            .eq('booking_id', booking.id)
            .eq('from_user_id', user!.id)
            .single()

          return {
            ...booking,
            has_reviewed: !!review,
          }
        })
      )

      setBookings(bookingsWithReviewStatus)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Không thể tải danh sách đặt chỗ')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Đã hủy đặt chỗ')
      fetchBookings()
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      toast.error('Không thể hủy', {
        description: error.message,
      })
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/profile')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Chuyến đi của tôi</h1>
            <p className="text-muted-foreground">
              Tổng: {bookings.length} đặt chỗ
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Chờ xác nhận ({pendingCount})
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setFilter('confirmed')}
            className={filter === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Đã xác nhận ({confirmedCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Hoàn thành ({completedCount})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Tất cả ({bookings.length})
          </Button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Driver Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {booking.driver.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.driver.full_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <a href={`tel:${booking.driver.phone}`} className="hover:text-primary">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {booking.driver.phone}
                          </a>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {booking.driver.rating.toFixed(1)}
                          </span>
                          <span>• {booking.driver.completed_trips} chuyến</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge className={`
                        ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                        ${booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                        ${booking.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                        ${booking.status === 'cancelled' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {booking.status === 'pending' && 'Chờ xác nhận'}
                        {booking.status === 'confirmed' && 'Đã xác nhận'}
                        {booking.status === 'completed' && 'Hoàn thành'}
                        {booking.status === 'rejected' && 'Đã từ chối'}
                        {booking.status === 'cancelled' && 'Đã hủy'}
                      </Badge>
                    </div>

                    {/* Trip Info */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{booking.trip.from_location} → {booking.trip.to_location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(booking.trip.date).toLocaleDateString('vi-VN')} • {booking.trip.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{booking.seats_booked} ghế</span>
                        <span className="font-bold text-primary">
                          {(booking.seats_booked * booking.trip.price).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>

                    {/* Booking Time */}
                    <p className="text-xs text-muted-foreground">
                      Đặt lúc: {new Date(booking.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    {booking.status === 'pending' && (
                      <Button
                        onClick={() => setCancelDialog({
                          open: true,
                          bookingId: booking.id,
                          driverName: booking.driver.full_name,
                        })}
                        variant="outline"
                        className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy đặt chỗ
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <Button
                          onClick={() => window.open(`tel:${booking.driver.phone}`)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Gọi tài xế
                        </Button>
                        <Button
                          onClick={() => setCancelDialog({
                            open: true,
                            bookingId: booking.id,
                            driverName: booking.driver.full_name,
                          })}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy chuyến
                        </Button>
                      </>
                    )}
                    {booking.status === 'completed' && !booking.has_reviewed && (
                      <Button
                        onClick={() => setReviewModal({
                          open: true,
                          booking,
                        })}
                        className="bg-amber-600 hover:bg-amber-700 gap-1"
                        size="sm"
                      >
                        <Star className="w-4 h-4" />
                        Đánh giá
                      </Button>
                    )}
                    {booking.status === 'completed' && booking.has_reviewed && (
                      <Badge className="bg-green-100 text-green-700">
                        ✓ Đã đánh giá
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            {filter === 'pending' && 'Không có đặt chỗ nào đang chờ xác nhận'}
            {filter === 'confirmed' && 'Chưa có đặt chỗ nào được xác nhận'}
            {filter === 'completed' && 'Chưa có chuyến nào hoàn thành'}
            {filter === 'all' && 'Bạn chưa đặt chỗ nào'}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      {cancelDialog && (
        <AlertDialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hủy đặt chỗ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn hủy đặt chỗ với tài xế <strong>{cancelDialog.driverName}</strong>? Số ghế sẽ được hoàn lại.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Không</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleCancel(cancelDialog.bookingId)
                  setCancelDialog(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Hủy đặt chỗ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          open={reviewModal.open}
          onOpenChange={(open) => !open && setReviewModal(null)}
          booking={{
            id: reviewModal.booking.id,
            trip_id: reviewModal.booking.trip_id,
            driver_id: reviewModal.booking.driver_id,
            passenger_id: reviewModal.booking.passenger_id,
            driver_name: reviewModal.booking.driver.full_name,
          }}
          reviewType="driver"
          onSuccess={() => {
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}
