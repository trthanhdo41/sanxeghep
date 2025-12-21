'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionExpiredModalProps {
  show: boolean
  onClose: () => void
}

export function SessionExpiredModal({ show, onClose }: SessionExpiredModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Phiên đăng nhập hết hạn
            </h3>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">
          Tài khoản của bạn đã đăng nhập từ thiết bị khác. Để bảo mật, bạn đã bị đăng xuất khỏi thiết bị này.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Lưu ý:</strong> Tài khoản tài xế chỉ được đăng nhập trên 1 thiết bị cùng lúc để đảm bảo an toàn.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsVisible(false)
            onClose()
          }}
          className="w-full bg-gradient-to-r from-primary to-accent"
        >
          Đã hiểu
        </Button>
      </div>
    </div>
  )
}
