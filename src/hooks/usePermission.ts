import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { hasPermission, getUserPermissions, type Permission } from '@/lib/permissions'

// Hook để check 1 permission
export function usePermission(permission: Permission) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!user) {
      setHasAccess(false)
      setLoading(false)
      return
    }
    
    hasPermission(user.id, permission)
      .then(setHasAccess)
      .finally(() => setLoading(false))
  }, [user, permission])
  
  return { hasAccess, loading }
}

// Hook để lấy tất cả permissions
export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!user) {
      setPermissions([])
      setLoading(false)
      return
    }
    
    getUserPermissions(user.id)
      .then(setPermissions)
      .finally(() => setLoading(false))
  }, [user])
  
  const hasPermission = (permission: Permission) => {
    return permissions.includes(permission)
  }
  
  return { permissions, hasPermission, loading }
}
