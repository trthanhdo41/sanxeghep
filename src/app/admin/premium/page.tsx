'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Calendar, Loader2, Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'

interface Driver {
  id: string
  full_name: string
  phone: string
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
}

export default function AdminPremiumPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

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

    fetchDrivers()
  }, [user, authLoading, router])

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_driver', true)
        .neq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) throw error

      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Không thể tải danh sách tài xế')
    } finally {
      setLoading(false)
    }
  }

  const togglePremium = async (driverId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const expiresAt = newStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null

      // Get driver info for logging
      const driver = drivers.find(d => d.id === driverId)

      const { error } = await supabase
        .from('users')
        .update({
          is_premium: newStatus,
          premium_expires_at: expiresAt
        })
        .eq('id', driverId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'premium', driverId, {
        action: newStatus ? 'enable' : 'disable',
        user_name: driver?.full_name,
        expires_at: expiresAt,
      })

      toast.success(newStatus ? 'Đã bật VIP 30 ngày' : 'Đã tắt VIP')
      fetchDrivers()
    } catch (error) {
      console.error('Error toggling premium:', error)
      toast.error('Không thể cập nhật trạng thái VIP')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quản lý VIP</h1>
            <p className="text-muted-foreground">
              Bật/tắt tài khoản VIP cho tài xế (30 ngày)
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tài xế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">SĐT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hết hạn</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.map((driver) => {
                  const isActive = driver.is_premium && (!driver.premium_expires_at || new Date(driver.premium_expires_at) > new Date())
                  
                  return (
                    <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{driver.full_name}</span>
                          {isActive && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {driver.phone}
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {driver.premium_expires_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(driver.premium_expires_at).toLocaleDateString('vi-VN')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant={isActive ? 'destructive' : 'default'}
                          onClick={() => togglePremium(driver.id, driver.is_premium)}
                          className="gap-2"
                        >
                          {isActive ? (
                            <>
                              <X className="w-4 h-4" />
                              Tắt VIP
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Bật VIP 30 ngày
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có tài xế nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
