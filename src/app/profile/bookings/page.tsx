'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, User, Phone, MessageSquare, Calendar, MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
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
import { ReviewModal } from '@/components/booking/ReviewModal'

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
  passenger: {
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
}

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    bookingId: string
    action: 'confirm' | 'reject' | 'complete' | 'cancel'
    passengerName: string
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
      // Fetch bookings where user is driver
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          passenger:users!bookings_passenger_id_fkey(full_name, phone, avatar_url, rating, completed_trips),
          trip:trips(from_location, to_location, date, time, price)
        `)
        .eq('driver_id', user!.id)
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Không thể tải danh sách đặt chỗ')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (bookingId: string) => {
    try {
      // Get booking details first
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('trip_id, seats_booked, status')
        .eq('id', bookingId)
        .single()

      if (fetchError) throw fetchError

      // Check if already confirmed
      if (booking.status !== 'pending') {
        toast.error('Booking này đã được xử lý rồi')
        fetchBookings()
        return
      }

      // Get current trip seats
      const { data: trip, error: tripFetchError } = await supabase
        .from('trips')
        .select('seats_available')
        .eq('id', booking.trip_id)
        .single()

      if (tripFetchError) throw tripFetchError

      // Check if enough seats available
      if (trip.seats_available < booking.seats_booked) {
        toast.error(`Không đủ ghế trống! Chỉ còn ${trip.seats_available} ghế, nhưng booking yêu cầu ${booking.seats_booked} ghế`)
        return
      }

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('status', 'pending') // Only update if still pending

      if (updateError) throw updateError

      // Decrease available seats in trip
      const newSeatsAvailable = trip.seats_available - booking.seats_booked
      const { error: tripUpdateError } = await supabase
        .from('trips')
        .update({ 
          seats_available: Math.max(0, newSeatsAvailable) // Prevent negative
        })
        .eq('id', booking.trip_id)

      if (tripUpdateError) throw tripUpdateError

      toast.success('Đã xác nhận đặt chỗ', {
        description: `Còn lại ${newSeatsAvailable} ghế trống`
      })
      fetchBookings()
    } catch (error: any) {
      console.error('Error confirming booking:', error)
      toast.error('Không thể xác nhận', {
        description: error.message,
      })
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Đã từ chối đặt chỗ')
      fetchBookings()
    } catch (error: any) {
      console.error('Error rejecting booking:', error)
      toast.error('Không thể từ chối', {
        description: error.message,
      })
    }
  }

  const handleComplete = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Đã hoàn thành chuyến đi', {
        description: 'Bạn và hành khách có thể đánh giá nhau',
      })
      fetchBookings()
    } catch (error: any) {
      console.error('Error completing booking:', error)
      toast.error('Không thể hoàn thành', {
        description: error.message,
      })
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

      toast.success('Đã hủy chuyến đi', {
        description: 'Số ghế đã được hoàn lại',
      })
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
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý đặt chỗ</h1>
            <p className="text-muted-foreground">
              Tổng: {bookings.length} đặt chỗ ({pendingCount} chờ xác nhận)
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
                    {/* Passenger Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {booking.passenger.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.passenger.full_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <a href={`tel:${booking.passenger.phone}`} className="hover:text-primary">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {booking.passenger.phone}
                          </a>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {booking.passenger.rating.toFixed(1)}
                          </span>
                          <span>• {booking.passenger.completed_trips} chuyến</span>
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
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.seats_booked} ghế • {(booking.seats_booked * booking.trip.price).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>

                    {/* Passenger Note */}
                    {booking.passenger_note && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm">
                        <p className="font-medium mb-1 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Ghi chú từ hành khách:
                        </p>
                        <p className="text-muted-foreground">{booking.passenger_note}</p>
                      </div>
                    )}

                    {/* Booking Time */}
                    <p className="text-xs text-muted-foreground">
                      Đặt lúc: {new Date(booking.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => setConfirmDialog({
                            open: true,
                            bookingId: booking.id,
                            action: 'confirm',
                            passengerName: booking.passenger.full_name,
                          })}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Xác nhận
                        </Button>
                        <Button
                          onClick={() => setConfirmDialog({
                            open: true,
                            bookingId: booking.id,
                            action: 'reject',
                            passengerName: booking.passenger.full_name,
                          })}
                          variant="outline"
                          className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <Button
                          onClick={() => setConfirmDialog({
                            open: true,
                            bookingId: booking.id,
                            action: 'complete',
                            passengerName: booking.passenger.full_name,
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Hoàn thành
                        </Button>
                        <Button
                          onClick={() => setConfirmDialog({
                            open: true,
                            bookingId: booking.id,
                            action: 'cancel',
                            passengerName: booking.passenger.full_name,
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
                    {booking.status === 'completed' && (
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
            {filter === 'all' && 'Chưa có đặt chỗ nào'}
          </div>
        )}
      </div>

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
            passenger_name: reviewModal.booking.passenger.full_name,
          }}
          reviewType="passenger"
          onSuccess={() => {
            fetchBookings()
          }}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === 'confirm' && 'Xác nhận đặt chỗ'}
                {confirmDialog.action === 'reject' && 'Từ chối đặt chỗ'}
                {confirmDialog.action === 'complete' && 'Hoàn thành chuyến đi'}
                {confirmDialog.action === 'cancel' && 'Hủy chuyến đi'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.action === 'confirm' && (
                  <>Bạn có chắc muốn xác nhận đặt chỗ của <strong>{confirmDialog.passengerName}</strong>?</>
                )}
                {confirmDialog.action === 'reject' && (
                  <>Bạn có chắc muốn từ chối đặt chỗ của <strong>{confirmDialog.passengerName}</strong>?</>
                )}
                {confirmDialog.action === 'complete' && (
                  <>Đánh dấu chuyến đi với <strong>{confirmDialog.passengerName}</strong> đã hoàn thành?</>
                )}
                {confirmDialog.action === 'cancel' && (
                  <>Hủy chuyến đi với <strong>{confirmDialog.passengerName}</strong>? Số ghế sẽ được hoàn lại.</>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmDialog.action === 'confirm') {
                    handleConfirm(confirmDialog.bookingId)
                  } else if (confirmDialog.action === 'reject') {
                    handleReject(confirmDialog.bookingId)
                  } else if (confirmDialog.action === 'complete') {
                    handleComplete(confirmDialog.bookingId)
                  } else if (confirmDialog.action === 'cancel') {
                    handleCancel(confirmDialog.bookingId)
                  }
                  setConfirmDialog(null)
                }}
                className={
                  confirmDialog.action === 'confirm' ? 'bg-green-600 hover:bg-green-700' :
                  confirmDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  confirmDialog.action === 'complete' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-red-600 hover:bg-red-700'
                }
              >
                {confirmDialog.action === 'confirm' && 'Xác nhận'}
                {confirmDialog.action === 'reject' && 'Từ chối'}
                {confirmDialog.action === 'complete' && 'Hoàn thành'}
                {confirmDialog.action === 'cancel' && 'Hủy chuyến'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
