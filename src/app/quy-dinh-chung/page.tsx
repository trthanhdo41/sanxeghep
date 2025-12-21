'use client'

import { Loader2 } from 'lucide-react'
import { useSiteSettings } from '@/lib/use-site-settings'

export default function GeneralRulesPage() {
  const { getSetting, loading } = useSiteSettings()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const content = getSetting('general_rules', '<h2>Quy định chung</h2><p>Đang cập nhật...</p>')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto bg-card border rounded-xl p-8">
          <div 
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
}
