'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Loader2, Trash2, AlertTriangle, ArrowUpDown, Edit } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { TripEditModal } from '@/components/admin/TripEditModal'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminTripsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; route: string } | null>(null)
  const [editTrip, setEditTrip] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'driver' | 'date' | 'price' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchTrips()
  }, [user])

  const fetchTrips = async (pageNum = 1) => {
    try {
      const from = (pageNum - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('trips')
        .select(`
          *,
          driver:users!trips_driver_id_fkey(full_name, phone)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (pageNum === 1) {
        setTrips(data || [])
      } else {
        setTrips(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE && (count || 0) > to + 1)
    } catch (error) {
      console.error('Error fetching trips:', error)
      toast.error('Không thể tải danh sách chuyến đi')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchTrips(nextPage)
  }

  const handleEditSave = async (updatedTrip: any) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          from_location: updatedTrip.from_location,
          to_location: updatedTrip.to_location,
          date: updatedTrip.date,
          time: updatedTrip.time,
          vehicle_type: updatedTrip.vehicle_type,
          total_seats: updatedTrip.total_seats,
          seats_available: updatedTrip.seats_available,
          price: updatedTrip.price,
          notes: updatedTrip.notes,
          status: updatedTrip.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTrip.id)

      if (error) throw error

      toast.success('Cập nhật chuyến đi thành công!')
      fetchTrips(1)
      setPage(1)
    } catch (error) {
      console.error('Error updating trip:', error)
      toast.error('Không thể cập nhật chuyến đi')
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) throw error

      toast.success('Đã xóa chuyến đi')
      fetchTrips()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Không thể xóa chuyến đi')
    }
  }

  const toggleSort = (column: 'driver' | 'date' | 'price' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const filteredTrips = trips
    .filter(
      (t) =>
        t.from_location?.toLowerCase().includes(search.toLowerCase()) ||
        t.to_location?.toLowerCase().includes(search.toLowerCase()) ||
        t.driver?.full_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'driver') {
        const nameA = a.driver?.full_name?.toLowerCase() || ''
        const nameB = b.driver?.full_name?.toLowerCase() || ''
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortBy === 'price') {
        const priceA = a.price_per_seat || 0
        const priceB = b.price_per_seat || 0
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      } else {
        const statusA = a.status || ''
        const statusB = b.status || ''
        return sortOrder === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA)
      }
    })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
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
            <h1 className="text-3xl font-bold">Quản lý chuyến đi</h1>
            <p className="text-muted-foreground">
              Tổng: {trips.length} chuyến đi
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Tìm theo điểm đi hoặc điểm đến..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Trips Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <button
                        onClick={() => toggleSort('driver')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Tài xế
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'driver' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Lộ trình</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <button
                        onClick={() => toggleSort('date')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Ngày đi
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'date' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <button
                        onClick={() => toggleSort('price')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Giá
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'price' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <button
                        onClick={() => toggleSort('status')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Trạng thái
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'status' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {trip.driver?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {trip.driver?.phone ? (
                              <a href={`tel:${trip.driver.phone}`} className="text-primary hover:underline">
                                {trip.driver.phone}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {trip.from_location} → {trip.to_location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(trip.date).toLocaleDateString('vi-VN')}
                        <div className="text-muted-foreground">{trip.time}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {trip.price ? `${trip.price.toLocaleString('vi-VN')} đ` : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trip.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {trip.status === 'active' ? 'Hoạt động' : 'Đã đóng'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditTrip(trip)}
                            className="p-2 border rounded-lg hover:bg-muted transition-colors"
                            title="Sửa chuyến đi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ 
                              id: trip.id, 
                              route: `${trip.from_location} → ${trip.to_location}` 
                            })}
                            className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa chuyến đi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredTrips.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy chuyến đi
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredTrips.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              size="lg"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                'Xem thêm chuyến đi'
              )}
            </Button>
          </div>
        )}

        {/* Edit Trip Modal */}
        {editTrip && (
          <TripEditModal
            trip={editTrip}
            open={!!editTrip}
            onClose={() => setEditTrip(null)}
            onSave={handleEditSave}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Xác nhận xóa chuyến đi</DialogTitle>
                  <DialogDescription className="mt-1">
                    Hành động này không thể hoàn tác
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa chuyến đi{' '}
                <span className="font-semibold text-foreground">"{deleteConfirm?.route}"</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Tất cả dữ liệu liên quan (đặt chỗ, đánh giá) sẽ bị ảnh hưởng.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Xóa chuyến đi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
