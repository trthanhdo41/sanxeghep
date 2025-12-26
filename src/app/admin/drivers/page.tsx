'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Phone, Car, FileText, Calendar, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'
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

interface DriverApplication {
  id: string
  user_id: string
  full_name: string
  phone: string
  vehicle_type: string
  license_plate: string
  license_image: string | null
  vehicle_registration_image: string | null
  id_card_image: string | null
  license_number: string
  experience_years: number
  notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminDriversPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<DriverApplication[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    applicationId: string
    userId: string
    action: 'approve' | 'reject'
    name: string
  } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/')
      return
    }
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Không thể tải danh sách đơn đăng ký')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string, userId: string) => {
    try {
      // Get application details before updating
      const { data: application } = await supabase
        .from('driver_applications')
        .select('*, user:users(full_name, phone)')
        .eq('id', applicationId)
        .single()

      // Update application status
      const { error: appError } = await supabase
        .from('driver_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)

      if (appError) throw appError

      // Update user role to driver
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          role: 'driver',
          is_driver: true,
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (userError) throw userError

      // Log action
      await logAction(user!.id, 'update', 'driver_application', applicationId, {
        action: 'approve',
        driver_name: application?.user?.full_name,
        driver_phone: application?.user?.phone,
      })

      toast.success('Đã duyệt đơn đăng ký', {
        description: 'Người dùng đã trở thành tài xế',
      })

      fetchApplications()
    } catch (error: any) {
      console.error('Error approving application:', error)
      toast.error('Không thể duyệt đơn', {
        description: error.message,
      })
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      // Get application details before updating
      const { data: application } = await supabase
        .from('driver_applications')
        .select('*, user:users(full_name, phone)')
        .eq('id', applicationId)
        .single()

      const { error } = await supabase
        .from('driver_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'driver_application', applicationId, {
        action: 'reject',
        driver_name: application?.user?.full_name,
        driver_phone: application?.user?.phone,
      })

      toast.success('Đã từ chối đơn đăng ký')
      fetchApplications()
    } catch (error: any) {
      console.error('Error rejecting application:', error)
      toast.error('Không thể từ chối đơn', {
        description: error.message,
      })
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const pendingCount = applications.filter((app) => app.status === 'pending').length
  const approvedCount = applications.filter((app) => app.status === 'approved').length
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length

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
            <h1 className="text-3xl font-bold">Duyệt đơn đăng ký tài xế</h1>
            <p className="text-muted-foreground">
              Tổng: {applications.length} đơn ({pendingCount} chờ duyệt)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Chờ duyệt ({pendingCount})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Đã duyệt ({approvedCount})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            className={filter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Đã từ chối ({rejectedCount})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Tất cả ({applications.length})
          </Button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{app.full_name}</h3>
                        <a 
                          href={`tel:${app.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          <Phone className="w-3 h-3 inline mr-1" />
                          {app.phone.startsWith('+84') ? '0' + app.phone.slice(3) : app.phone}
                        </a>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700'
                          : app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status === 'pending' && 'Chờ duyệt'}
                        {app.status === 'approved' && 'Đã duyệt'}
                        {app.status === 'rejected' && 'Đã từ chối'}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Loại xe:</span>
                        <span className="font-medium">{app.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Biển số:</span>
                        <span className="font-medium">{app.license_plate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Số GPLX:</span>
                        <span className="font-medium">{app.license_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Kinh nghiệm:</span>
                        <span className="font-medium">{app.experience_years} năm</span>
                      </div>
                    </div>

                    {/* Document Images */}
                    {(app.license_image || app.vehicle_registration_image || app.id_card_image) && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Giấy tờ đã tải lên:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {app.license_image && (
                            <a href={app.license_image} target="_blank" rel="noopener noreferrer" className="group">
                              <img 
                                src={app.license_image} 
                                alt="Bằng lái" 
                                className="w-full h-32 object-cover rounded-lg border hover:border-primary transition-colors cursor-pointer"
                              />
                              <p className="text-xs text-center mt-1 text-muted-foreground group-hover:text-primary">Bằng lái xe</p>
                            </a>
                          )}
                          {app.vehicle_registration_image && (
                            <a href={app.vehicle_registration_image} target="_blank" rel="noopener noreferrer" className="group">
                              <img 
                                src={app.vehicle_registration_image} 
                                alt="Đăng ký xe" 
                                className="w-full h-32 object-cover rounded-lg border hover:border-primary transition-colors cursor-pointer"
                              />
                              <p className="text-xs text-center mt-1 text-muted-foreground group-hover:text-primary">Đăng ký xe</p>
                            </a>
                          )}
                          {app.id_card_image && (
                            <a href={app.id_card_image} target="_blank" rel="noopener noreferrer" className="group">
                              <img 
                                src={app.id_card_image} 
                                alt="CCCD" 
                                className="w-full h-32 object-cover rounded-lg border hover:border-primary transition-colors cursor-pointer"
                              />
                              <p className="text-xs text-center mt-1 text-muted-foreground group-hover:text-primary">CCCD/CMND</p>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {app.notes && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm mb-4">
                        <p className="text-muted-foreground mb-1">Ghi chú:</p>
                        <p>{app.notes}</p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      Đăng ký: {new Date(app.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Actions */}
                  {app.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setConfirmDialog({
                          open: true,
                          applicationId: app.id,
                          userId: app.user_id,
                          action: 'approve',
                          name: app.full_name,
                        })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Duyệt
                      </Button>
                      <Button
                        onClick={() => setConfirmDialog({
                          open: true,
                          applicationId: app.id,
                          userId: app.user_id,
                          action: 'reject',
                          name: app.full_name,
                        })}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredApplications.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            {filter === 'pending' && 'Không có đơn nào đang chờ duyệt'}
            {filter === 'approved' && 'Chưa có đơn nào được duyệt'}
            {filter === 'rejected' && 'Chưa có đơn nào bị từ chối'}
            {filter === 'all' && 'Chưa có đơn đăng ký nào'}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <AlertDialog open={confirmDialog.open} onOpenChange={(open: boolean) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {confirmDialog.action === 'approve' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Xác nhận duyệt đơn
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Xác nhận từ chối đơn
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.action === 'approve' ? (
                  <>
                    Bạn có chắc muốn duyệt đơn đăng ký của <strong>{confirmDialog.name}</strong>?
                    <br />
                    <br />
                    Người dùng này sẽ trở thành tài xế và có thể đăng chuyến đi.
                  </>
                ) : (
                  <>
                    Bạn có chắc muốn từ chối đơn đăng ký của <strong>{confirmDialog.name}</strong>?
                    <br />
                    <br />
                    Người dùng này sẽ không thể trở thành tài xế.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmDialog.action === 'approve') {
                    handleApprove(confirmDialog.applicationId, confirmDialog.userId)
                  } else {
                    handleReject(confirmDialog.applicationId)
                  }
                  setConfirmDialog(null)
                }}
                className={confirmDialog.action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }
              >
                {confirmDialog.action === 'approve' ? 'Duyệt đơn' : 'Từ chối'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
