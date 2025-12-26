'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Loader2, Ban, CheckCircle, Edit, Trash2, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editRole, setEditRole] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; phone: string } | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const ITEMS_PER_PAGE = 12

  // Format phone number to Vietnamese format (0xxxxxxxxx)
  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A'
    // If starts with +84, convert to 0
    if (phone.startsWith('+84')) {
      return '0' + phone.slice(3)
    }
    return phone
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async (pageNum = 1) => {
    try {
      const from = (pageNum - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      // Staff chỉ thấy passenger và driver, không thấy admin và staff
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (user?.role === 'staff') {
        query = query.in('role', ['passenger', 'driver'])
      }

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      if (pageNum === 1) {
        setUsers(data || [])
      } else {
        setUsers(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE && (count || 0) > to + 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchUsers(nextPage)
  }

  const filteredUsers = users
    .filter(
      (u) =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.full_name?.toLowerCase() || ''
        const nameB = b.full_name?.toLowerCase() || ''
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      } else {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      }
    })

  const toggleSort = (column: 'name' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleEditRole = async (userId: string, newRole: string) => {
    try {
      // Get user info before updating
      const userToUpdate = users.find(u => u.id === userId)
      const oldRole = userToUpdate?.role

      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'user', userId, {
        action: 'change_role',
        user_name: userToUpdate?.full_name,
        user_phone: userToUpdate?.phone,
        old_role: oldRole,
        new_role: newRole,
      })

      toast.success('Cập nhật vai trò thành công!')
      fetchUsers(1)
      setPage(1)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Không thể cập nhật vai trò')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'delete', 'user', deleteConfirm.id, {
        user_name: deleteConfirm.name,
        user_phone: deleteConfirm.phone,
      })

      toast.success('Xóa người dùng thành công!')
      fetchUsers(1)
      setPage(1)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Không thể xóa người dùng')
    }
  }

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
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
            <p className="text-muted-foreground">
              Tổng: {users.length} người dùng
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Users Table */}
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
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Tên
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'name' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">SĐT</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vai trò</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Xác minh</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <button
                        onClick={() => toggleSort('date')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Ngày tạo
                        <ArrowUpDown className={`w-4 h-4 ${sortBy === 'date' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{u.full_name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {u.phone ? (
                          <a 
                            href={`tel:${formatPhone(u.phone)}`}
                            className="text-primary hover:underline"
                          >
                            {formatPhone(u.phone)}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-700'
                            : u.role === 'driver' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role === 'admin' ? 'Quản trị viên' : u.role === 'driver' ? 'Tài xế' : 'Hành khách'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === 'admin' || u.verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Ban className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {u.id === user?.id ? (
                            <span className="text-xs text-muted-foreground italic">
                              (Bạn)
                            </span>
                          ) : editingUser === u.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="passenger">Hành khách</option>
                                <option value="driver">Tài xế</option>
                              </select>
                              <button
                                onClick={() => handleEditRole(u.id, editRole)}
                                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(u.id)
                                  setEditRole(u.role || 'user')
                                }}
                                className="p-2 border rounded-lg hover:bg-muted transition-colors"
                                title="Sửa vai trò"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: u.id, name: u.full_name, phone: u.phone })}
                                className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Xóa người dùng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy người dùng
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredUsers.length > 0 && (
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
                'Xem thêm người dùng'
              )}
            </Button>
          </div>
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
                  <DialogTitle className="text-xl">Xác nhận xóa người dùng</DialogTitle>
                  <DialogDescription className="mt-1">
                    Hành động này không thể hoàn tác
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa người dùng{' '}
                <span className="font-semibold text-foreground">"{deleteConfirm?.name}"</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Tất cả dữ liệu liên quan (chuyến đi, đặt chỗ, đánh giá) sẽ bị ảnh hưởng.
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
                onClick={handleDeleteUser}
              >
                Xóa người dùng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
