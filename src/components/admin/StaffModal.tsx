'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { PERMISSION_GROUPS, PERMISSIONS, PERMISSION_TEMPLATES, type Permission, logAction } from '@/lib/permissions'

interface StaffModalProps {
  staff: any | null
  onClose: () => void
  onSuccess: () => void
}

export function StaffModal({ staff, onClose, onSuccess }: StaffModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set())

  useEffect(() => {
    if (staff) {
      setFormData({
        full_name: staff.full_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        password: '',
      })
      fetchPermissions()
    }
  }, [staff])

  const fetchPermissions = async () => {
    if (!staff) return
    
    try {
      const { data } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', staff.id)
      
      if (data) {
        setSelectedPermissions(new Set(data.map(p => p.permission as Permission)))
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const togglePermission = (permission: Permission) => {
    const newSet = new Set(selectedPermissions)
    if (newSet.has(permission)) {
      newSet.delete(permission)
    } else {
      newSet.add(permission)
    }
    setSelectedPermissions(newSet)
  }

  const applyTemplate = (templateName: keyof typeof PERMISSION_TEMPLATES) => {
    const permissions = PERMISSION_TEMPLATES[templateName]
    setSelectedPermissions(new Set(permissions))
    toast.success(`Đã áp dụng mẫu "${templateName}"`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (staff) {
        // Cập nhật staff qua API
        const response = await fetch('/api/admin/update-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staff_id: staff.id,
            full_name: formData.full_name,
            phone: formData.phone,
            password: formData.password || undefined,
            permissions: Array.from(selectedPermissions),
            admin_id: user!.id,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update staff')
        }

        toast.success('Đã cập nhật nhân viên')
      } else {
        // Tạo staff mới qua API (không cần session)
        const response = await fetch('/api/admin/create-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            phone: formData.phone,
            permissions: Array.from(selectedPermissions),
            admin_id: user!.id,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create staff')
        }

        toast.success('Đã tạo nhân viên mới')
      }

      // Đợi một chút để đảm bảo database đã commit
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onSuccess()
    } catch (error: any) {
      console.error('Error saving staff:', error)
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!staff}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu {staff ? '(để trống nếu không đổi)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!staff}
                />
              </div>
            </div>
          </div>

          {/* Mẫu quyền nhanh */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Mẫu quyền nhanh</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(PERMISSION_TEMPLATES).map((templateName) => (
                <Button
                  key={templateName}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(templateName as keyof typeof PERMISSION_TEMPLATES)}
                >
                  {templateName}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions(new Set())}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Phân quyền */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Phân quyền ({selectedPermissions.size}/{Object.keys(PERMISSIONS).length})
            </h3>
            
            <div className="space-y-6">
              {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                <div key={group} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">{group}</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(permission as Permission)}
                          onChange={() => togglePermission(permission as Permission)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{PERMISSIONS[permission as Permission]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-accent">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
