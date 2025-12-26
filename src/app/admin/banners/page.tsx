'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Loader2, Plus, Trash2, Eye, EyeOff, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { BannerFormModal } from '@/components/admin/BannerFormModal'
import { logAction } from '@/lib/permissions'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: string
  category: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function AdminBannersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

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

    fetchBanners()
  }, [user, authLoading, router])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Không thể tải danh sách banner')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const banner = banners.find(b => b.id === bannerId)

      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', bannerId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'banner', bannerId, {
        action: !currentStatus ? 'enable' : 'disable',
        title: banner?.title,
      })

      toast.success(!currentStatus ? 'Đã bật banner' : 'Đã tắt banner')
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return

    try {
      const banner = banners.find(b => b.id === bannerId)

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'delete', 'banner', bannerId, {
        title: banner?.title,
        position: banner?.position,
      })

      toast.success('Đã xóa banner')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Không thể xóa banner')
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingBanner(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingBanner(null)
    fetchBanners()
  }

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (banner.category && banner.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          <div className="flex-1 mx-8">
            <h1 className="text-3xl font-bold">Quản lý Banner/Ads</h1>
            <p className="text-muted-foreground">
              Quản lý banner quảng cáo trên website
            </p>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, vị trí, danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm mới
          </Button>
        </div>

        {/* Banners Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Hình ảnh</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Vị trí</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Thứ tự</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-20 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{banner.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {banner.image_url.length > 50 
                            ? banner.image_url.substring(0, 50) + '...' 
                            : banner.image_url}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {banner.category || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {banner.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {banner.sort_order}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {banner.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Eye className="w-3 h-3" />
                          Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <EyeOff className="w-3 h-3" />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant={banner.is_active ? 'outline' : 'default'}
                          onClick={() => toggleActive(banner.id, banner.is_active)}
                        >
                          {banner.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBanner(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBanners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery ? 'Không tìm thấy banner nào' : 'Chưa có banner nào'}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <BannerFormModal
          banner={editingBanner}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
