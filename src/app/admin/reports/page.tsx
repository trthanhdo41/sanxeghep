'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp, Calendar, Users, Car, Star, ArrowLeft, CheckCircle, Clock, Crown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

type TimeRange = 'day' | 'week' | 'month' | 'all'

export default function AdminReportsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalDrivers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalReviews: 0,
    reviews1Star: 0,
    reviews2Star: 0,
    reviews3Star: 0,
    reviews4Star: 0,
    reviews5Star: 0,
    vehicleTypes: {} as Record<string, number>,
    monthlyTrips: [] as { month: string; count: number }[],
    monthlyBookings: [] as { month: string; count: number }[],
    monthlyUsers: [] as { month: string; count: number }[],
    hourlyBookings: [] as { hour: string; count: number }[],
    topDrivers: [] as { name: string; trips: number }[],
    premiumDrivers: 0,
    regularDrivers: 0,
    avgResponseTime: 0,
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/')
      return
    }
    fetchStats()
  }, [user, authLoading, router, timeRange])

  const getDateFilter = () => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'all':
      default:
        return null
    }

    return startDate.toISOString()
  }

  const fetchStats = async () => {
    try {
      const dateFilter = getDateFilter()
      
      const buildQuery = (table: string) => {
        const query = supabase.from(table).select('*', { count: 'exact', head: true })
        if (dateFilter) {
          query.gte('created_at', dateFilter)
        }
        return query
      }

      const buildDataQuery = (table: string, columns: string) => {
        const query = supabase.from(table).select(columns)
        if (dateFilter) {
          query.gte('created_at', dateFilter)
        }
        return query
      }
      const [
        { count: usersCount },
        { count: tripsCount },
        { count: driversCount },
        { count: bookingsCount },
        { count: pendingBookingsCount },
        { count: confirmedBookingsCount },
        { count: completedBookingsCount },
        { count: cancelledBookingsCount },
        { count: reviewsCount },
        { count: reviews1StarCount },
        { count: reviews2StarCount },
        { count: reviews3StarCount },
        { count: reviews4StarCount },
        { count: reviews5StarCount },
        { count: premiumDriversCount },
        { data: tripsData },
        { data: bookingsData },
        { data: usersData },
        { data: bookingsWithTime },
        { data: driversWithTrips },
      ] = await Promise.all([
        buildQuery('users'),
        buildQuery('trips'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_driver', true),
        buildQuery('bookings'),
        buildQuery('bookings').eq('status', 'pending'),
        buildQuery('bookings').eq('status', 'confirmed'),
        buildQuery('bookings').eq('status', 'completed'),
        buildQuery('bookings').eq('status', 'cancelled'),
        buildQuery('reviews'),
        buildQuery('reviews').eq('rating', 1),
        buildQuery('reviews').eq('rating', 2),
        buildQuery('reviews').eq('rating', 3),
        buildQuery('reviews').eq('rating', 4),
        buildQuery('reviews').eq('rating', 5),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        buildDataQuery('trips', 'vehicle_type, created_at'),
        buildDataQuery('bookings', 'created_at'),
        buildDataQuery('users', 'created_at'),
        buildDataQuery('bookings', 'created_at, confirmed_at'),
        supabase.from('users').select('id, full_name, completed_trips').eq('is_driver', true).order('completed_trips', { ascending: false }).limit(10),
      ])

      // Thống kê loại xe
      const vehicleTypesMap: Record<string, number> = {}
      tripsData?.forEach((trip: any) => {
        const type = trip.vehicle_type || 'Khác'
        vehicleTypesMap[type] = (vehicleTypesMap[type] || 0) + 1
      })

      // Thống kê theo tháng/tuần/ngày
      const timeLabels: string[] = []
      const monthlyTripsMap: Record<string, number> = {}
      const monthlyBookingsMap: Record<string, number> = {}
      const monthlyUsersMap: Record<string, number> = {}
      const now = new Date()

      if (timeRange === 'day') {
        // 24 giờ
        for (let i = 23; i >= 0; i--) {
          const hour = now.getHours() - i
          const label = `${hour < 0 ? 24 + hour : hour}:00`
          timeLabels.push(label)
          monthlyTripsMap[label] = 0
          monthlyBookingsMap[label] = 0
          monthlyUsersMap[label] = 0
        }

        tripsData?.forEach((trip: any) => {
          const date = new Date(trip.created_at)
          const label = `${date.getHours()}:00`
          if (monthlyTripsMap[label] !== undefined) {
            monthlyTripsMap[label]++
          }
        })

        bookingsData?.forEach((booking: any) => {
          const date = new Date(booking.created_at)
          const label = `${date.getHours()}:00`
          if (monthlyBookingsMap[label] !== undefined) {
            monthlyBookingsMap[label]++
          }
        })

        usersData?.forEach((user: any) => {
          const date = new Date(user.created_at)
          const label = `${date.getHours()}:00`
          if (monthlyUsersMap[label] !== undefined) {
            monthlyUsersMap[label]++
          }
        })
      } else if (timeRange === 'week') {
        // 7 ngày
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          timeLabels.push(label)
          monthlyTripsMap[label] = 0
          monthlyBookingsMap[label] = 0
          monthlyUsersMap[label] = 0
        }

        tripsData?.forEach((trip: any) => {
          const date = new Date(trip.created_at)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          if (monthlyTripsMap[label] !== undefined) {
            monthlyTripsMap[label]++
          }
        })

        bookingsData?.forEach((booking: any) => {
          const date = new Date(booking.created_at)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          if (monthlyBookingsMap[label] !== undefined) {
            monthlyBookingsMap[label]++
          }
        })

        usersData?.forEach((user: any) => {
          const date = new Date(user.created_at)
          const label = `${date.getDate()}/${date.getMonth() + 1}`
          if (monthlyUsersMap[label] !== undefined) {
            monthlyUsersMap[label]++
          }
        })
      } else {
        // 6 tháng hoặc tất cả
        const monthCount = timeRange === 'all' ? 11 : 5
        for (let i = monthCount; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
          timeLabels.push(monthKey)
          monthlyTripsMap[monthKey] = 0
          monthlyBookingsMap[monthKey] = 0
          monthlyUsersMap[monthKey] = 0
        }

        tripsData?.forEach((trip: any) => {
          const date = new Date(trip.created_at)
          const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
          if (monthlyTripsMap[monthKey] !== undefined) {
            monthlyTripsMap[monthKey]++
          }
        })

        bookingsData?.forEach((booking: any) => {
          const date = new Date(booking.created_at)
          const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
          if (monthlyBookingsMap[monthKey] !== undefined) {
            monthlyBookingsMap[monthKey]++
          }
        })

        usersData?.forEach((user: any) => {
          const date = new Date(user.created_at)
          const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
          if (monthlyUsersMap[monthKey] !== undefined) {
            monthlyUsersMap[monthKey]++
          }
        })
      }

      // Thống kê theo giờ trong ngày (peak hours)
      const hourlyMap: Record<string, number> = {}
      for (let i = 0; i < 24; i++) {
        hourlyMap[`${i}:00`] = 0
      }
      bookingsData?.forEach((booking: any) => {
        const date = new Date(booking.created_at)
        const hour = `${date.getHours()}:00`
        hourlyMap[hour]++
      })

      // Tính thời gian phản hồi trung bình
      let totalResponseTime = 0
      let responseCount = 0
      bookingsWithTime?.forEach((booking: any) => {
        if (booking.confirmed_at) {
          const created = new Date(booking.created_at).getTime()
          const confirmed = new Date(booking.confirmed_at).getTime()
          totalResponseTime += (confirmed - created) / 1000 / 60 // phút
          responseCount++
        }
      })
      const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0

      setStats({
        totalUsers: usersCount || 0,
        totalTrips: tripsCount || 0,
        totalDrivers: driversCount || 0,
        totalBookings: bookingsCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        confirmedBookings: confirmedBookingsCount || 0,
        completedBookings: completedBookingsCount || 0,
        cancelledBookings: cancelledBookingsCount || 0,
        totalReviews: reviewsCount || 0,
        reviews1Star: reviews1StarCount || 0,
        reviews2Star: reviews2StarCount || 0,
        reviews3Star: reviews3StarCount || 0,
        reviews4Star: reviews4StarCount || 0,
        reviews5Star: reviews5StarCount || 0,
        vehicleTypes: vehicleTypesMap,
        monthlyTrips: timeLabels.map(label => ({ month: label, count: monthlyTripsMap[label] || 0 })),
        monthlyBookings: timeLabels.map(label => ({ month: label, count: monthlyBookingsMap[label] || 0 })),
        monthlyUsers: timeLabels.map(label => ({ month: label, count: monthlyUsersMap[label] || 0 })),
        hourlyBookings: Object.entries(hourlyMap).map(([hour, count]) => ({ hour, count })),
        topDrivers: driversWithTrips?.map((d: any) => ({ name: d.full_name, trips: d.completed_trips || 0 })) || [],
        premiumDrivers: premiumDriversCount || 0,
        regularDrivers: (driversCount || 0) - (premiumDriversCount || 0),
        avgResponseTime,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return null
  }

  const chartAnimation = {
    duration: 1500,
    easing: 'easeInOutQuart' as const,
  }

  // Chart 1: Tổng quan hệ thống (Bar)
  const overviewData = {
    labels: ['Người dùng', 'Tài xế', 'Chuyến đi', 'Đặt chỗ', 'Đánh giá'],
    datasets: [
      {
        label: 'Tổng quan',
        data: [stats.totalUsers, stats.totalDrivers, stats.totalTrips, stats.totalBookings, stats.totalReviews],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(20, 184, 166)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart 2: Xu hướng chuyến đi theo tháng (Line)
  const tripsLineData = {
    labels: stats.monthlyTrips.map(m => m.month),
    datasets: [
      {
        label: 'Chuyến đi',
        data: stats.monthlyTrips.map(m => m.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Đặt chỗ',
        data: stats.monthlyBookings.map(m => m.count),
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  // Chart 3: Trạng thái đặt chỗ (Doughnut)
  const bookingStatusData = {
    labels: ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'],
    datasets: [
      {
        data: [
          stats.pendingBookings,
          stats.confirmedBookings,
          stats.completedBookings,
          stats.cancelledBookings,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart 4: Phân bố đánh giá (Pie)
  const reviewsDistributionData = {
    labels: ['5 sao', '4 sao', '3 sao', '2 sao', '1 sao'],
    datasets: [
      {
        data: [
          stats.reviews5Star,
          stats.reviews4Star,
          stats.reviews3Star,
          stats.reviews2Star,
          stats.reviews1Star,
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(132, 204, 22)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart 5: Loại xe phổ biến (Bar horizontal)
  const vehicleTypesData = {
    labels: Object.keys(stats.vehicleTypes),
    datasets: [
      {
        label: 'Số lượng chuyến',
        data: Object.values(stats.vehicleTypes),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
      },
    ],
  }

  // Chart 6: Tăng trưởng người dùng
  const usersGrowthData = {
    labels: stats.monthlyUsers.map(m => m.month),
    datasets: [
      {
        label: 'Người dùng mới',
        data: stats.monthlyUsers.map(m => m.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  // Chart 7: Peak hours (giờ cao điểm)
  const peakHoursData = {
    labels: stats.hourlyBookings.map(h => h.hour),
    datasets: [
      {
        label: 'Số lượng đặt chỗ',
        data: stats.hourlyBookings.map(h => h.count),
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2,
      },
    ],
  }

  // Chart 8: Top tài xế
  const topDriversData = {
    labels: stats.topDrivers.slice(0, 10).map(d => d.name),
    datasets: [
      {
        label: 'Chuyến hoàn thành',
        data: stats.topDrivers.slice(0, 10).map(d => d.trips),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  }

  // Chart 9: Tỷ lệ thành công
  const successRateData = {
    labels: ['Hoàn thành', 'Đã hủy'],
    datasets: [
      {
        data: [stats.completedBookings, stats.cancelledBookings],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart 10: VIP vs Thường
  const driverTypesData = {
    labels: ['Tài xế VIP', 'Tài xế thường'],
    datasets: [
      {
        data: [stats.premiumDrivers, stats.regularDrivers],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Báo cáo thống kê
            </h1>
            <p className="text-muted-foreground">Phân tích chi tiết hoạt động hệ thống</p>
          </div>
        </div>

        {/* Bộ lọc thời gian */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Khoảng thời gian:</span>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('day')}
              >
                Hôm nay
              </Button>
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                7 ngày
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Tháng này
              </Button>
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                12 tháng
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Tổng quan */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-600" size={20} />
              <h3 className="font-bold">Tổng quan hệ thống</h3>
            </div>
            <div className="h-[300px]">
              <Bar
                data={overviewData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 2: Xu hướng theo tháng */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-green-600" size={20} />
              <h3 className="font-bold">
                {timeRange === 'day' && 'Xu hướng 24 giờ'}
                {timeRange === 'week' && 'Xu hướng 7 ngày'}
                {timeRange === 'month' && 'Xu hướng tháng này'}
                {timeRange === 'all' && 'Xu hướng 12 tháng'}
              </h3>
            </div>
            <div className="h-[300px]">
              <Line
                data={tripsLineData}
                options={{
                  ...commonOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 3: Trạng thái đặt chỗ */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-teal-600" size={20} />
              <h3 className="font-bold">Trạng thái đặt chỗ</h3>
            </div>
            <div className="h-[300px]">
              <Doughnut data={bookingStatusData} options={commonOptions} />
            </div>
          </Card>

          {/* Chart 4: Phân bố đánh giá */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-600" size={20} />
              <h3 className="font-bold">Phân bố đánh giá</h3>
            </div>
            <div className="h-[300px]">
              <Pie data={reviewsDistributionData} options={commonOptions} />
            </div>
          </Card>

          {/* Chart 5: Loại xe phổ biến */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Car className="text-purple-600" size={20} />
              <h3 className="font-bold">Loại xe phổ biến</h3>
            </div>
            <div className="h-[300px]">
              <Bar
                data={vehicleTypesData}
                options={{
                  ...commonOptions,
                  indexAxis: 'y' as const,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 6: Tăng trưởng người dùng */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-blue-600" size={20} />
              <h3 className="font-bold">Tăng trưởng người dùng</h3>
            </div>
            <div className="h-[300px]">
              <Line
                data={usersGrowthData}
                options={{
                  ...commonOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 7: Giờ cao điểm */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-orange-600" size={20} />
              <h3 className="font-bold">Giờ cao điểm đặt chỗ</h3>
            </div>
            <div className="h-[300px]">
              <Bar
                data={peakHoursData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 8: Top tài xế */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-600" size={20} />
              <h3 className="font-bold">Top 10 tài xế xuất sắc</h3>
            </div>
            <div className="h-[300px]">
              <Bar
                data={topDriversData}
                options={{
                  ...commonOptions,
                  indexAxis: 'y' as const,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Chart 9: Tỷ lệ thành công */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-emerald-600" size={20} />
              <h3 className="font-bold">Tỷ lệ thành công</h3>
            </div>
            <div className="h-[300px]">
              <Doughnut data={successRateData} options={commonOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Tỷ lệ: {stats.completedBookings + stats.cancelledBookings > 0 
                  ? Math.round((stats.completedBookings / (stats.completedBookings + stats.cancelledBookings)) * 100) 
                  : 0}% hoàn thành
              </p>
            </div>
          </Card>

          {/* Chart 10: VIP vs Thường */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="text-amber-600" size={20} />
              <h3 className="font-bold">Phân loại tài xế</h3>
            </div>
            <div className="h-[300px]">
              <Pie data={driverTypesData} options={commonOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {stats.premiumDrivers} VIP / {stats.regularDrivers} Thường
              </p>
            </div>
          </Card>

          {/* Stats card: Thời gian phản hồi */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-indigo-600" size={20} />
              <h3 className="font-bold">Hiệu suất hệ thống</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.avgResponseTime} phút</div>
                <div className="text-sm text-muted-foreground">Thời gian phản hồi TB</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.totalDrivers > 0 ? Math.round((stats.totalTrips / stats.totalDrivers) * 10) / 10 : 0}
                </div>
                <div className="text-sm text-muted-foreground">Chuyến TB/Tài xế</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
