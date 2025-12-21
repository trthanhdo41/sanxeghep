'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionExpiredModal } from './SessionExpiredModal'

export function SessionExpiredHandler() {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleSessionExpired = () => {
      setShowModal(true)
    }

    window.addEventListener('session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired)
    }
  }, [])

  const handleClose = () => {
    setShowModal(false)
    router.push('/')
    router.refresh()
  }

  return <SessionExpiredModal show={showModal} onClose={handleClose} />
}
