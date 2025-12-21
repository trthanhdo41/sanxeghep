'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Car, Calendar, TrendingUp, Loader2, Mail, Crown, Image as ImageIcon, KeyRound } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalDrivers: 0,
    activeTrips: 0,
  })

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Redirect if not logged in
    if (!user) {
      router.push('/')
      return
    }

    // Redirect if not admin
    if (user.role !== 'admin') {
      router.push('/')
      return
    }

    // Fetch stats if user is admin
    fetchStats()
  }, [user, authLoading, router])

  const fetchStats = async () => {
    try {
      // Total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Total trips
      const { count: tripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })

      // Total drivers
      const { count: driversCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_driver', true)

      // Active trips
      const { count: activeCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      setStats({
        totalUsers: usersCount || 0,
        totalTrips: tripsCount || 0,
        totalDrivers: driversCount || 0,
        activeTrips: activeCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth is loading or stats are loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not logged in or not admin (will redirect via useEffect)
  if (!user || user.role !== 'admin') {
    return null
  }

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Tổng chuyến đi',
      value: stats.totalTrips,
      icon: Car,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Tổng tài xế',
      value: stats.totalDrivers,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Chuyến đang hoạt động',
      value: stats.activeTrips,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Quản lý hệ thống SanXeGhep
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card
                key={idx}
                className="p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push('/admin/users')}
          >
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Quản lý người dùng</h3>
            <p className="text-sm text-muted-foreground">
              Xem danh sách, khóa/mở khóa tài khoản
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push('/admin/trips')}
          >
            <Car className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Quản lý chuyến đi</h3>
            <p className="text-sm text-muted-foreground">
              Xem, xóa chuyến đi không phù hợp
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push('/admin/drivers')}
          >
            <TrendingUp className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Xác minh tài xế</h3>
            <p className="text-sm text-muted-foreground">
              Duyệt giấy tờ, xác minh tài xế
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push('/admin/messages')}
          >
            <Mail className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Tin nhắn liên hệ</h3>
            <p className="text-sm text-muted-foreground">
              Xem và trả lời tin nhắn từ khách hàng
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200"
            onClick={() => router.push('/admin/password-resets')}
          >
            <KeyRound className="w-8 h-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Yêu cầu đặt lại MK</h3>
            <p className="text-sm text-muted-foreground">
              Xử lý yêu cầu quên mật khẩu từ người dùng
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200"
            onClick={() => router.push('/admin/premium')}
          >
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quản lý VIP</h3>
            <p className="text-sm text-muted-foreground">
              Bật/tắt tài khoản VIP cho tài xế
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => router.push('/admin/banners')}
          >
            <ImageIcon className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Quản lý Banner/Ads</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý banner quảng cáo trên website
            </p>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200"
            onClick={() => router.push('/admin/settings')}
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Cài đặt Website</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý thông tin liên hệ, công ty, nội dung pháp lý
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
