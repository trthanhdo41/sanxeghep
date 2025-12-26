'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Phone, Mail, User, Calendar, CheckCircle, XCircle, Clock, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/permissions'

interface PasswordResetRequest {
  id: number
  user_id: string
  phone: string
  full_name: string
  email: string | null
  reason: string | null
  status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default function PasswordResetsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/')
      toast.error('Không có quyền truy cập')
      return
    }

    fetchRequests()
  }, [user, router, filter])

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('password_reset_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest || !newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setProcessing(true)
    try {
      // Check target user role - Staff cannot reset password for admin/staff
      const { data: targetUser, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', selectedRequest.user_id)
        .single()

      if (fetchError) throw fetchError

      if (user?.role === 'staff' && (targetUser.role === 'admin' || targetUser.role === 'staff')) {
        toast.error('Nhân viên không có quyền đặt lại mật khẩu cho quản trị viên hoặc nhân viên khác')
        setProcessing(false)
        return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', selectedRequest.user_id)

      if (updateError) throw updateError

      // Update request status
      const { error: requestError } = await supabase
        .from('password_reset_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes || `Đã cấp mật khẩu mới: ${newPassword}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)

      if (requestError) throw requestError

      // Log action
      await logAction(user!.id, 'update', 'password_reset', selectedRequest.id.toString(), {
        user_phone: selectedRequest.phone,
        user_name: selectedRequest.full_name,
        action: 'approve',
      })

      toast.success('Đã duyệt và cấp mật khẩu mới!')
      setSelectedRequest(null)
      setNewPassword('')
      setAdminNotes('')
      fetchRequests()

    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      // Check target user role - Staff cannot reject password reset for admin/staff
      const { data: targetUser, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', selectedRequest.user_id)
        .single()

      if (fetchError) throw fetchError

      if (user?.role === 'staff' && (targetUser.role === 'admin' || targetUser.role === 'staff')) {
        toast.error('Nhân viên không có quyền xử lý yêu cầu của quản trị viên hoặc nhân viên khác')
        setProcessing(false)
        return
      }

      const { error } = await supabase
        .from('password_reset_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes || 'Từ chối yêu cầu',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'password_reset', selectedRequest.id.toString(), {
        user_phone: selectedRequest.phone,
        user_name: selectedRequest.full_name,
        action: 'reject',
      })

      toast.success('Đã từ chối yêu cầu')
      setSelectedRequest(null)
      setAdminNotes('')
      fetchRequests()

    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={12} /> Chờ xử lý</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12} /> Đã duyệt</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1"><XCircle size={12} /> Từ chối</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quản lý yêu cầu đặt lại mật khẩu</h1>
            <p className="text-muted-foreground mt-2">
              Xem và xử lý các yêu cầu đặt lại mật khẩu từ người dùng
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
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
            Chờ xử lý
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
          >
            Đã duyệt
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            size="sm"
          >
            Từ chối
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-muted-foreground">Không có yêu cầu nào</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{request.full_name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={16} />
                        <span>{request.phone}</span>
                      </div>
                      {request.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={16} />
                          <span>{request.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>{new Date(request.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="text-sm">
                        <span className="font-medium">Lý do:</span> {request.reason}
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">Ghi chú admin:</span> {request.admin_notes}
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      size="sm"
                      className="ml-4"
                    >
                      <Eye size={16} className="mr-2" />
                      Xử lý
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Process Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xử lý yêu cầu đặt lại mật khẩu</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div><strong>Họ tên:</strong> {selectedRequest.full_name}</div>
                <div><strong>SĐT:</strong> {selectedRequest.phone}</div>
                {selectedRequest.email && <div><strong>Email:</strong> {selectedRequest.email}</div>}
                {selectedRequest.reason && <div><strong>Lý do:</strong> {selectedRequest.reason}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                <Input
                  id="newPassword"
                  type="text"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Mật khẩu này sẽ được gửi cho người dùng
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Ghi chú (tùy chọn)</Label>
                <textarea
                  id="adminNotes"
                  placeholder="Ghi chú nội bộ..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing || !newPassword}
                  className="flex-1"
                >
                  {processing ? 'Đang xử lý...' : 'Duyệt & Cấp MK'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
