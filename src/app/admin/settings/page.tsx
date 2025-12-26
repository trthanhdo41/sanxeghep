'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Save, Phone, Mail, MapPin, Clock, Building, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'

interface SiteSetting {
  id: string
  key: string
  value: string
  description: string
  category: string
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'contact' | 'company' | 'legal'>('contact')

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

    fetchSettings()
  }, [user, authLoading, router])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw error

      setSettings(data || [])
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Không thể tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, value } : s))
    )
  }

  const saveSetting = async (setting: SiteSetting) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          value: setting.value,
          updated_at: new Date().toISOString()
        })
        .eq('key', setting.key)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'update', 'settings', setting.key, {
        setting_key: setting.key,
        setting_description: setting.description,
      })

      toast.success('Đã lưu thành công')
    } catch (error) {
      console.error('Error saving setting:', error)
      toast.error('Không thể lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      const updates = settings.map(setting =>
        supabase
          .from('site_settings')
          .update({ 
            value: setting.value,
            updated_at: new Date().toISOString()
          })
          .eq('key', setting.key)
      )

      await Promise.all(updates)

      // Log action
      await logAction(user!.id, 'update', 'settings', 'bulk_update', {
        total_settings: settings.length,
        categories: [...new Set(settings.map(s => s.category))],
      })

      toast.success('Đã lưu tất cả thành công')
    } catch (error) {
      console.error('Error saving all settings:', error)
      toast.error('Không thể lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const contactSettings = settings.filter(s => s.category === 'contact')
  const companySettings = settings.filter(s => s.category === 'company')
  const legalSettings = settings.filter(s => s.category === 'legal')

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
            <h1 className="text-3xl font-bold">Cài đặt Website</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin liên hệ, công ty và nội dung pháp lý
            </p>
          </div>
          <Button onClick={saveAll} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Lưu tất cả
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Thông tin liên hệ
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'company'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Thông tin công ty
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'legal'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Nội dung pháp lý
          </button>
        </div>

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
            {contactSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.description}</Label>
                <div className="flex gap-2">
                  <Input
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    placeholder={setting.description}
                  />
                  <Button
                    variant="outline"
                    onClick={() => saveSetting(setting)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Company Settings */}
        {activeTab === 'company' && (
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Thông tin công ty</h2>
            {companySettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.description}</Label>
                <div className="flex gap-2">
                  <Input
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    placeholder={setting.description}
                  />
                  <Button
                    variant="outline"
                    onClick={() => saveSetting(setting)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legal Settings */}
        {activeTab === 'legal' && (
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Nội dung pháp lý</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Bạn có thể sử dụng HTML để định dạng nội dung
            </p>
            {legalSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.description}</Label>
                <div className="space-y-2">
                  <textarea
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    placeholder={setting.description}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[200px] font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => saveSetting(setting)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
