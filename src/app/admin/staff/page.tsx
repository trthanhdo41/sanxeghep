'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Loader2, Edit, Trash2, Shield, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { StaffModal } from '@/components/admin/StaffModal'
import { logAction, PERMISSIONS } from '@/lib/permissions'

interface StaffMember {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  created_at: string
  permissions_count?: number
}

export default function AdminStaffPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (user.role !== 'admin') {
      router.push('/admin')
      toast.error('Bạn không có quyền truy cập trang này')
      return
    }
    fetchStaff()
  }, [user, authLoading, router])

  const fetchStaff = async () => {
    try {
      // Lấy danh sách staff
      const { data: staffData, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone, role, created_at')
        .eq('role', 'staff')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched staff:', staffData?.length)

      // Đếm số permissions của từng staff
      const staffWithPermissions = await Promise.all(
        (staffData || []).map(async (s) => {
          const { count, error: countError } = await supabase
            .from('user_permissions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', s.id)
          
          if (countError) {
            console.error('Error counting permissions for', s.full_name, countError)
          }
          
          console.log(`Permissions for ${s.full_name}:`, count)
          
          return {
            ...s,
            permissions_count: count || 0,
          }
        })
      )

      setStaff(staffWithPermissions)
    } catch (error: any) {
      console.error('Error fetching staff:', error)
      toast.error('Không thể tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (staffMember: StaffMember) => {
    if (!confirm(`Bạn có chắc muốn xóa nhân viên "${staffMember.full_name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', staffMember.id)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'delete', 'staff', staffMember.id, {
        staff_name: staffMember.full_name,
        staff_email: staffMember.email,
      })

      toast.success('Đã xóa nhân viên')
      fetchStaff()
    } catch (error: any) {
      console.error('Error deleting staff:', error)
      toast.error('Không thể xóa nhân viên')
    }
  }

  const filteredStaff = staff.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
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
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Quản lý nhân viên
              </h1>
              <p className="text-muted-foreground">
                Tạo tài khoản và phân quyền cho nhân viên
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedStaff(null)
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhân viên
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="text-sm text-muted-foreground">
              Tổng: <span className="font-semibold">{filteredStaff.length}</span> nhân viên
            </div>
          </div>
        </Card>

        {/* Staff List */}
        {filteredStaff.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {search ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {search ? 'Thử tìm kiếm với từ khóa khác' : 'Bấm "Thêm nhân viên" để tạo tài khoản mới'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((s) => (
              <Card key={s.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold">{s.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Quyền:</span>
                    <span className="font-semibold">{s.permissions_count}/{Object.keys(PERMISSIONS).length}</span>
                  </div>
                  {s.phone && (
                    <div className="text-sm text-muted-foreground">
                      SĐT: {s.phone}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Tạo: {new Date(s.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedStaff(s)
                      setShowModal(true)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(s)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <StaffModal
            staff={selectedStaff}
            onClose={() => {
              setShowModal(false)
              setSelectedStaff(null)
            }}
            onSuccess={() => {
              setShowModal(false)
              setSelectedStaff(null)
              fetchStaff()
            }}
          />
        )}
      </div>
    </div>
  )
}
