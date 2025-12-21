'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// Banner display component - renders HTML/Google Ads code

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: string
  sort_order: number
}

interface BannerDisplayProps {
  position: string
  className?: string
}

export function BannerDisplay({ position, className = '' }: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [position])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      // Nếu bảng chưa tồn tại, bỏ qua lỗi
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet - silent fail
          setBanners([])
          return
        }
        throw error
      }

      setBanners(data || [])
    } catch (error) {
      // Silent fail - không log lỗi nếu bảng chưa tạo
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  if (loading || banners.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <div 
          key={banner.id} 
          className="banner-container"
          dangerouslySetInnerHTML={{ __html: banner.image_url }}
        />
      ))}
    </div>
  )
}
