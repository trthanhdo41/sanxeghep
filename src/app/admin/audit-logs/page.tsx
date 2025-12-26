'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Filter, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id: string | null
  details: any
  created_at: string
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminAuditLogsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/admin')
      toast.error('Bạn không có quyền truy cập trang này')
      return
    }
    fetchLogs(true)
  }, [user, authLoading, router, filterAction, filterResource, filterUser])

  const fetchLogs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setLogs([])
      }

      const currentPage = reset ? 0 : page
      const from = currentPage * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('audit_logs')
        .select('*, user:users(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filterAction) {
        query = query.eq('action', filterAction)
      }
      if (filterResource) {
        query = query.eq('resource', filterResource)
      }

      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.error('Error fetching logs:', error)
        throw error
      }

      console.log('Fetched logs:', data) // Debug log

      // Filter by user name on client side if needed
      let filteredData = data || []
      if (filterUser) {
        filteredData = filteredData.filter(log => 
          log.user?.full_name?.toLowerCase().includes(filterUser.toLowerCase())
        )
      }

      const totalFetched = from + (filteredData.length || 0)
      setHasMore(count ? totalFetched < count : false)

      if (reset) {
        setLogs(filteredData)
      } else {
        setLogs(prev => [...prev, ...filteredData])
      }

      setPage(currentPage + 1)
    } catch (error: any) {
      console.error('Error fetching logs:', error)
      toast.error('Không thể tải audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-gray-100 text-gray-800',
    }
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Tạo mới',
      update: 'Cập nhật',
      delete: 'Xóa',
      view: 'Xem',
    }
    return labels[action] || action
  }

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      user: 'Người dùng',
      trip: 'Chuyến đi',
      booking: 'Đặt chỗ',
      review: 'Đánh giá',
      driver: 'Tài xế',
      driver_application: 'Đơn đăng ký tài xế',
      staff: 'Nhân viên',
      message: 'Tin nhắn',
      banner: 'Banner',
      settings: 'Cài đặt',
      password_reset: 'Đặt lại mật khẩu',
      premium: 'VIP',
    }
    return labels[resource] || resource
  }

  const formatLogDetails = (action: string, resource: string, details: any) => {
    if (!details) return null

    // Staff operations
    if (resource === 'staff') {
      if (action === 'create') {
        return <span>Tạo nhân viên: <strong>{details.staff_name}</strong> ({details.staff_email})</span>
      }
      if (action === 'update') {
        return <span>Cập nhật nhân viên: <strong>{details.staff_name}</strong></span>
      }
      if (action === 'delete') {
        return <span>Xóa nhân viên: <strong>{details.staff_name}</strong> ({details.staff_email})</span>
      }
    }

    // User operations
    if (resource === 'user') {
      if (action === 'delete') {
        return <span>Xóa người dùng: <strong>{details.user_name}</strong> ({details.user_phone})</span>
      }
      if (action === 'update' && details.action === 'change_role') {
        return <span>Đổi vai trò <strong>{details.user_name}</strong>: {details.old_role} → {details.new_role}</span>
      }
    }

    // Trip operations
    if (resource === 'trip') {
      if (action === 'delete') {
        return <span>Xóa chuyến đi: <strong>{details.route}</strong></span>
      }
      if (action === 'update') {
        return <span>Cập nhật chuyến đi: <strong>{details.route}</strong> ({details.date} {details.time})</span>
      }
    }

    // Driver application
    if (resource === 'driver_application') {
      if (details.action === 'approve') {
        return <span>Duyệt tài xế: <strong>{details.driver_name}</strong> ({details.driver_phone})</span>
      }
      if (details.action === 'reject') {
        return <span>Từ chối tài xế: <strong>{details.driver_name}</strong> ({details.driver_phone})</span>
      }
    }

    // Message operations
    if (resource === 'message') {
      if (action === 'delete') {
        return <span>Xóa tin nhắn từ: <strong>{details.sender_name}</strong> - {details.subject}</span>
      }
      if (details.action === 'mark_read') {
        return <span>Đánh dấu đã đọc tin nhắn từ: <strong>{details.sender_name}</strong></span>
      }
      if (details.action === 'reply') {
        return <span>Đánh dấu đã trả lời tin nhắn từ: <strong>{details.sender_name}</strong></span>
      }
      if (details.action === 'archive') {
        return <span>Lưu trữ tin nhắn từ: <strong>{details.sender_name}</strong></span>
      }
    }

    // Password reset
    if (resource === 'password_reset') {
      if (details.action === 'approve') {
        return <span>Duyệt đặt lại mật khẩu cho: <strong>{details.user_name}</strong> ({details.user_phone})</span>
      }
      if (details.action === 'reject') {
        return <span>Từ chối đặt lại mật khẩu cho: <strong>{details.user_name}</strong> ({details.user_phone})</span>
      }
    }

    // Premium
    if (resource === 'premium') {
      if (details.action === 'enable') {
        return <span>Bật VIP cho: <strong>{details.user_name}</strong></span>
      }
      if (details.action === 'disable') {
        return <span>Tắt VIP cho: <strong>{details.user_name}</strong></span>
      }
    }

    // Banner
    if (resource === 'banner') {
      if (action === 'create') {
        return <span>Tạo banner: <strong>{details.title}</strong></span>
      }
      if (action === 'update') {
        if (details.action === 'enable') {
          return <span>Bật banner: <strong>{details.title}</strong></span>
        }
        if (details.action === 'disable') {
          return <span>Tắt banner: <strong>{details.title}</strong></span>
        }
        return <span>Cập nhật banner: <strong>{details.title}</strong></span>
      }
      if (action === 'delete') {
        return <span>Xóa banner: <strong>{details.title}</strong></span>
      }
    }

    // Settings
    if (resource === 'settings') {
      if (details.setting_key) {
        return <span>Cập nhật cài đặt: <strong>{details.setting_description}</strong></span>
      }
      if (details.total_settings) {
        return <span>Cập nhật hàng loạt: <strong>{details.total_settings}</strong> cài đặt</span>
      }
    }

    // Review
    if (resource === 'review' && action === 'delete') {
      return <span>Xóa đánh giá từ <strong>{details.from_user}</strong> cho <strong>{details.to_user}</strong></span>
    }

    return null
  }

  const exportLogs = () => {
    const csv = [
      ['Thời gian', 'Người thực hiện', 'Hành động', 'Tài nguyên', 'Chi tiết'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('vi-VN'),
        log.user?.full_name || 'N/A',
        log.action,
        getResourceLabel(log.resource),
        JSON.stringify(log.details || {}),
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lich-su-hoat-dong-${new Date().toISOString()}.csv`
    a.click()
    toast.success('Đã tải xuống lịch sử hoạt động')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Lịch sử hoạt động
            </h1>
            <p className="text-muted-foreground">
              Theo dõi mọi hành động của nhân viên trong admin panel
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">Tất cả hành động</option>
              <option value="create">Tạo mới</option>
              <option value="update">Cập nhật</option>
              <option value="delete">Xóa</option>
              <option value="view">Xem</option>
            </select>

            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">Tất cả tài nguyên</option>
              <option value="user">Người dùng</option>
              <option value="trip">Chuyến đi</option>
              <option value="booking">Đặt chỗ</option>
              <option value="review">Đánh giá</option>
              <option value="driver">Tài xế</option>
              <option value="staff">Nhân viên</option>
            </select>

            <Input
              placeholder="Tìm theo tên nhân viên..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="max-w-xs"
            />

            <div className="text-sm text-muted-foreground ml-auto">
              Tổng: <span className="font-semibold">{logs.length}</span> logs
            </div>
          </div>
        </Card>

        {/* Logs List */}
        {logs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Chưa có lịch sử hoạt động</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadge(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                        <span className="font-medium">{getResourceLabel(log.resource)}</span>
                        {log.resource_id && (
                          <span className="text-xs text-muted-foreground">ID: {log.resource_id.slice(0, 8)}...</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Bởi: <span className="font-medium text-foreground">{log.user?.full_name || 'N/A'}</span>
                        {log.user?.email && <span> ({log.user.email})</span>}
                      </div>

                      {/* Hiển thị thông tin chi tiết dễ đọc */}
                      {log.details && (
                        <div className="text-sm mb-2">
                          {formatLogDetails(log.action, log.resource, log.details)}
                        </div>
                      )}

                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Chi tiết kỹ thuật
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div>{new Date(log.created_at).toLocaleDateString('vi-VN')}</div>
                      <div>{new Date(log.created_at).toLocaleTimeString('vi-VN')}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={() => fetchLogs(false)} variant="outline">
                  Xem thêm
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
