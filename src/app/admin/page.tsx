'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Car, Calendar, TrendingUp, Loader2, Mail, Crown, Image as ImageIcon, KeyRound, CheckCircle, Clock, ArrowUpRight, Star, RefreshCw, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { usePermissions } from '@/hooks/usePermission'
import type { Permission } from '@/lib/permissions'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { hasPermission, loading: permLoading } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalDrivers: 0,
    activeTrips: 0,
    pendingDrivers: 0,
    pendingPasswordResets: 0,
    totalMessages: 0,
    premiumDrivers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalReviews: 0,
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

    // Subscribe to realtime changes
    const usersChannel = supabase
      .channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        console.log('👥 Users changed, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    const tripsChannel = supabase
      .channel('admin-trips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        console.log('🚗 Trips changed, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    const bookingsChannel = supabase
      .channel('admin-bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        console.log('📅 Bookings changed, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    const reviewsChannel = supabase
      .channel('admin-reviews-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        console.log('⭐ Reviews changed, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(tripsChannel)
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(reviewsChannel)
    }
  }, [user, authLoading, router])

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: tripsCount },
        { count: driversCount },
        { count: activeCount },
        { count: pendingDriversCount },
        { count: pendingPasswordResetsCount },
        { count: messagesCount },
        { count: premiumCount },
        { count: bookingsCount },
        { count: pendingBookingsCount },
        { count: completedBookingsCount },
        { count: reviewsCount },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_driver', true),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('driver_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('password_reset_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        totalUsers: usersCount || 0,
        totalTrips: tripsCount || 0,
        totalDrivers: driversCount || 0,
        activeTrips: activeCount || 0,
        pendingDrivers: pendingDriversCount || 0,
        pendingPasswordResets: pendingPasswordResetsCount || 0,
        totalMessages: messagesCount || 0,
        premiumDrivers: premiumCount || 0,
        totalBookings: bookingsCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        completedBookings: completedBookingsCount || 0,
        totalReviews: reviewsCount || 0,
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

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Tổng chuyến đi',
      value: stats.totalTrips,
      icon: Car,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Tổng tài xế',
      value: stats.totalDrivers,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Chuyến hoạt động',
      value: stats.activeTrips,
      icon: Calendar,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Tổng đặt chỗ',
      value: stats.totalBookings,
      icon: CheckCircle,
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Đặt chỗ chờ xác nhận',
      value: stats.pendingBookings,
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Đặt chỗ hoàn thành',
      value: stats.completedBookings,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Tổng đánh giá',
      value: stats.totalReviews,
      icon: Star,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ]

  const quickActions = [
    { title: 'Báo cáo thống kê', description: 'Xem biểu đồ, phân tích chi tiết', icon: TrendingUp, href: '/admin/reports', color: 'violet', badge: null, permission: 'reports:view' },
    { title: 'Quản lý nhân viên', description: 'Tạo tài khoản, phân quyền', icon: Users, href: '/admin/staff', color: 'slate', badge: null, permission: null }, // Chỉ admin
    { title: 'Lịch sử hoạt động', description: 'Theo dõi hành động nhân viên', icon: FileText, href: '/admin/audit-logs', color: 'gray', badge: null, permission: null }, // Chỉ admin
    { title: 'Quản lý người dùng', description: 'Xem, khóa/mở khóa tài khoản', icon: Users, href: '/admin/users', color: 'blue', badge: null, permission: 'users:view' },
    { title: 'Quản lý chuyến đi', description: 'Xem, xóa chuyến không phù hợp', icon: Car, href: '/admin/trips', color: 'green', badge: null, permission: 'trips:view' },
    { title: 'Quản lý đặt chỗ', description: 'Xem tất cả đặt chỗ, thống kê', icon: Calendar, href: '/admin/bookings', color: 'teal', badge: null, permission: 'bookings:view' },
    { title: 'Quản lý đánh giá', description: 'Xem, xóa đánh giá không phù hợp', icon: Star, href: '/admin/reviews', color: 'yellow', badge: null, permission: 'reviews:view' },
    { title: 'Xác minh tài xế', description: 'Duyệt đơn đăng ký tài xế', icon: CheckCircle, href: '/admin/drivers', color: 'purple', badge: stats.pendingDrivers > 0 ? stats.pendingDrivers : null, permission: 'drivers:verify' },
    { title: 'Tin nhắn liên hệ', description: 'Xem và trả lời tin nhắn', icon: Mail, href: '/admin/messages', color: 'indigo', badge: stats.totalMessages > 0 ? stats.totalMessages : null, permission: 'messages:view' },
    { title: 'Yêu cầu đặt lại MK', description: 'Xử lý yêu cầu quên mật khẩu', icon: KeyRound, href: '/admin/password-resets', color: 'red', badge: stats.pendingPasswordResets > 0 ? stats.pendingPasswordResets : null, permission: 'password_resets:manage' },
    { title: 'Quản lý VIP', description: 'Bật/tắt tài khoản VIP', icon: Crown, href: '/admin/premium', color: 'amber', badge: stats.premiumDrivers > 0 ? `${stats.premiumDrivers} VIP` : null, permission: null }, // Chỉ admin
    { title: 'Quản lý Banner/Ads', description: 'Quản lý banner quảng cáo', icon: ImageIcon, href: '/admin/banners', color: 'pink', badge: null, permission: null }, // Chỉ admin
    { title: 'Cài đặt Website', description: 'Thông tin liên hệ, nội dung', icon: TrendingUp, href: '/admin/settings', color: 'cyan', badge: null, permission: null }, // Chỉ admin
  ]

  // Filter menu items based on permissions
  const visibleActions = quickActions.filter(action => {
    // Admin thấy tất cả
    if (user?.role === 'admin') return true
    
    // Staff chỉ thấy menu có permission = null (chỉ admin) sẽ bị ẩn
    if (action.permission === null) return false
    
    // Check permission
    return hasPermission(action.permission as Permission)
  })

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string; badge: string }> = {
      slate: { bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:bg-slate-100', badge: 'bg-slate-500' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', hover: 'hover:bg-gray-100', badge: 'bg-gray-500' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-100', badge: 'bg-violet-500' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', badge: 'bg-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', badge: 'bg-green-500' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', hover: 'hover:bg-teal-100', badge: 'bg-teal-500' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', hover: 'hover:bg-yellow-100', badge: 'bg-yellow-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', badge: 'bg-purple-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100', badge: 'bg-indigo-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', hover: 'hover:bg-red-100', badge: 'bg-red-500' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-100', badge: 'bg-amber-500' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100', badge: 'bg-pink-500' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100', badge: 'bg-cyan-500' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Chào mừng trở lại, {user.full_name}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-3 hover:shadow-md transition-all">
                <div className={`${stat.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={stat.iconColor} size={16} />
                </div>
                <div className="text-xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{stat.title}</div>
              </Card>
            )
          })}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quản lý nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleActions.map((action, idx) => {
              const Icon = action.icon
              const colors = getColorClasses(action.color)
              return (
                <Card key={idx} className={`relative p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${colors.hover} border-0 group`} onClick={() => router.push(action.href)}>
                  {action.badge && (
                    <div className={`absolute top-4 right-4 ${colors.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {action.badge}
                    </div>
                  )}
                  <div className={`${colors.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="font-bold">Hệ thống hoạt động</h3>
            </div>
            <p className="text-sm text-muted-foreground">Tất cả dịch vụ đang hoạt động bình thường</p>
          </Card>

          <Card className="p-6 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
              <h3 className="font-bold">Cần xử lý</h3>
            </div>
            <p className="text-sm text-muted-foreground">{stats.pendingDrivers + stats.pendingPasswordResets} yêu cầu đang chờ</p>
          </Card>

          <Card className="p-6 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <h3 className="font-bold">Tăng trưởng</h3>
            </div>
            <p className="text-sm text-muted-foreground">+{stats.totalUsers} người dùng tháng này</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
