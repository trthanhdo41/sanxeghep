'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DangKyHanhKhachPage() {
  const router = useRouter()

  // Redirect to home page (use AuthModal instead)
  useEffect(() => {
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
