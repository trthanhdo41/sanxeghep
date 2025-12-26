'use client'

import { useState, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'
import { useAuth } from '@/lib/auth-context'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: string
  category: string | null
  sort_order: number
  is_active: boolean
}

interface BannerFormModalProps {
  banner: Banner | null
  onClose: () => void
}

export function BannerFormModal({ banner, onClose }: BannerFormModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    image_url: banner?.image_url || '', // Lưu HTML code
    link_url: banner?.link_url || '',
    position: banner?.position || 'home_top',
    category: banner?.category || '',
    sort_order: banner?.sort_order || 0,
    is_active: banner?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    if (!formData.image_url.trim()) {
      toast.error('Vui lòng nhập code HTML/Google Ads')
      return
    }

    setLoading(true)

    try {
      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from('banners')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            position: formData.position,
            category: formData.category || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', banner.id)

        if (error) throw error

        // Log action
        if (user) {
          await logAction(user.id, 'update', 'banner', banner.id, {
            title: formData.title,
            position: formData.position,
          })
        }

        toast.success('Cập nhật banner thành công')
      } else {
        // Create new banner
        const { data, error } = await supabase
          .from('banners')
          .insert({
            title: formData.title,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            position: formData.position,
            category: formData.category || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .select()
          .single()

        if (error) throw error

        // Log action
        if (user && data) {
          await logAction(user.id, 'create', 'banner', data.id, {
            title: formData.title,
            position: formData.position,
          })
        }

        toast.success('Thêm banner thành công')
      }

      onClose()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('Không thể lưu banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card">
          <h2 className="text-2xl font-bold">
            {banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="VD: Google Ads - Trang chủ đầu"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tiêu đề để phân biệt các banner (không hiển thị ra ngoài)
            </p>
          </div>

          {/* HTML Code */}
          <div>
            <Label htmlFor="html_code">Code HTML/Google Ads *</Label>
            <textarea
              id="html_code"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="Paste code Google Ads hoặc HTML của bạn vào đây..."
              className="mt-2 w-full px-3 py-2 border rounded-lg bg-background min-h-[200px] font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste code từ Google Ads hoặc bất kỳ HTML nào vào đây
            </p>
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position">Vị trí *</Label>
            <select
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="mt-2 w-full px-3 py-2 border rounded-lg bg-background"
            >
              <option value="home_top">Trang chủ - Đầu trang</option>
              <option value="home_middle">Trang chủ - Giữa trang</option>
              <option value="home_bottom">Trang chủ - Cuối trang</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Danh mục (tùy chọn)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="VD: Quảng cáo, Khuyến mãi, Tin tức..."
              className="mt-2"
            />
          </div>

          {/* Sort Order */}
          <div>
            <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Số nhỏ hơn sẽ hiển thị trước
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Hiển thị banner
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                banner ? 'Cập nhật' : 'Thêm mới'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
