'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  trip_id: string
  passenger_id: string
  driver_id: string
  seats_booked: number
  status: string
  created_at: string
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  passenger: {
    full_name: string
    phone: string
  }
  driver: {
    full_name: string
    phone: string
  }
  trip: {
    from_location: string
    to_location: string
    date: string
    time: string
    price: number
  }
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      router.push('/')
      return
    }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passenger:users!bookings_passenger_id_fkey(full_name, phone),
          driver:users!bookings_driver_id_fkey(full_name, phone),
          trip:trips(from_location, to_location, date, time, price)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    // Filter by status
    if (filter !== 'all' && booking.status !== filter) return false

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        booking.passenger.full_name.toLowerCase().includes(search) ||
        booking.driver.full_name.toLowerCase().includes(search) ||
        booking.trip.from_location.toLowerCase().includes(search) ||
        booking.trip.to_location.toLowerCase().includes(search)
      )
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý đặt chỗ</h1>
            <p className="text-muted-foreground">
              Tổng: {stats.total} đặt chỗ
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Tổng</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Chờ xác nhận</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Đã xác nhận</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Hoàn thành</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Đã hủy</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Từ chối</div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Tìm theo tên, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Tất cả
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
            >
              Chờ xác nhận
            </Button>
            <Button
              variant={filter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setFilter('confirmed')}
              size="sm"
            >
              Đã xác nhận
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              size="sm"
            >
              Hoàn thành
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setFilter('cancelled')}
              size="sm"
            >
              Đã hủy
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
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
                      <span className="text-sm text-muted-foreground">
                        {new Date(booking.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Hành khách:</span>{' '}
                        <strong>{booking.passenger.full_name}</strong> ({booking.passenger.phone})
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tài xế:</span>{' '}
                        <strong>{booking.driver.full_name}</strong> ({booking.driver.phone})
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tuyến:</span>{' '}
                        {booking.trip.from_location} → {booking.trip.to_location}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Thời gian:</span>{' '}
                        {new Date(booking.trip.date).toLocaleDateString('vi-VN')} {booking.trip.time}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Số ghế:</span>{' '}
                        {booking.seats_booked} ghế
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tổng tiền:</span>{' '}
                        <strong>{(booking.seats_booked * booking.trip.price).toLocaleString('vi-VN')}đ</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} ({filteredBookings.length} kết quả)
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
        )}

        {paginatedBookings.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy đặt chỗ nào
          </div>
        )}
      </div>
    </div>
  )
}
