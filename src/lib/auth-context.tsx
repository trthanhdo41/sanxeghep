'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

interface UserProfile {
  id: string
  phone: string
  full_name: string
  role: string
  is_passenger: boolean
  is_driver: boolean
  avatar_url?: string
  verified: boolean
  created_at: string
  is_premium?: boolean
  premium_expires_at?: string
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (phone: string, password: string) => Promise<UserProfile>
  signUp: (phone: string, name: string, password: string, asDriver?: boolean) => Promise<void>
  upgradeToDriver: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('sanxeghep_user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      // Refresh user data from database to get latest role
      refreshUserData(userData.id)
    } else {
      setLoading(false)
    }
  }, [])

  // Separate useEffect for session validation
  useEffect(() => {
    // Chỉ chạy nếu user là tài xế
    if (!user?.is_driver) return

    // Kiểm tra session định kỳ cho tài xế (mỗi 30 giây)
    const sessionCheckInterval = setInterval(() => {
      validateDriverSession()
    }, 30000) // 30 seconds

    return () => clearInterval(sessionCheckInterval)
  }, [user?.id, user?.is_driver]) // Chỉ phụ thuộc vào id và is_driver

  const refreshUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        localStorage.setItem('sanxeghep_user', JSON.stringify(data))
        setUser(data)
      } else {
        // Keep localStorage data if fetch fails
        const storedUser = localStorage.getItem('sanxeghep_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      const storedUser = localStorage.getItem('sanxeghep_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (phone: string, password: string) => {
    try {
      // Kiểm tra xem user có tồn tại không
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)

      if (checkError) {
        console.error('Check user error:', checkError)
        throw new Error('Không thể kiểm tra tài khoản. Vui lòng thử lại.')
      }

      if (!existingUsers || existingUsers.length === 0) {
        throw new Error('Số điện thoại chưa được đăng ký. Vui lòng đăng ký trước.')
      }

      // User tồn tại
      const userData = existingUsers[0]

      // Kiểm tra mật khẩu
      if (userData.role === 'admin') {
        // Admin dùng admin_password (legacy)
        if (userData.admin_password !== password) {
          throw new Error('Mật khẩu không đúng.')
        }
      } else {
        // User thường dùng password
        if (!userData.password) {
          throw new Error('Tài khoản chưa có mật khẩu. Vui lòng liên hệ admin.')
        }
        
        // Kiểm tra xem password có phải là bcrypt hash không (bắt đầu bằng $2a$ hoặc $2b$)
        const isBcryptHash = userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$')
        
        if (isBcryptHash) {
          // Verify bằng bcrypt
          const isPasswordValid = await bcrypt.compare(password, userData.password)
          if (!isPasswordValid) {
            throw new Error('Mật khẩu không đúng.')
          }
        } else {
          // Plain text password (legacy)
          if (userData.password !== password) {
            throw new Error('Mật khẩu không đúng.')
          }
        }
      }

      // Nếu là tài xế, kiểm tra session (chặn đăng nhập đồng thời)
      if (userData.is_driver) {
        const newSessionId = crypto.randomUUID()
        
        // Cập nhật session mới, đẩy session cũ ra
        const { error: updateError } = await supabase
          .from('users')
          .update({
            active_session_id: newSessionId,
            last_active_at: new Date().toISOString()
          })
          .eq('id', userData.id)

        if (updateError) {
          console.error('Update session error:', updateError)
          throw new Error('Không thể tạo phiên đăng nhập. Vui lòng thử lại.')
        }

        // Lưu session ID vào localStorage
        localStorage.setItem('sanxeghep_session', newSessionId)
        userData.active_session_id = newSessionId
      }

      // Đăng nhập thành công
      localStorage.setItem('sanxeghep_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (phone: string, name: string, password: string, asDriver: boolean = false) => {
    try {
      // Kiểm tra xem user đã tồn tại chưa
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)

      if (checkError) {
        console.error('Check user error:', checkError)
        throw new Error('Không thể kiểm tra tài khoản. Vui lòng thử lại.')
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Số điện thoại đã được đăng ký. Vui lòng đăng nhập.')
      }

      // Hash password trước khi lưu
      const hashedPassword = await bcrypt.hash(password, 10)

      // Tạo user mới
      const newUser = {
        id: crypto.randomUUID(),
        phone: phone,
        full_name: name,
        password: hashedPassword, // Lưu mật khẩu đã hash
        role: asDriver ? 'driver' : 'passenger',
        is_passenger: true, // Mặc định ai cũng có thể là hành khách
        is_driver: asDriver, // Chỉ set true nếu đăng ký làm tài xế
        verified: false,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw new Error('Không thể tạo tài khoản. Vui lòng thử lại sau.')
      }

      // Lưu vào localStorage và state
      localStorage.setItem('sanxeghep_user', JSON.stringify(data))
      setUser(data)
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const upgradeToDriver = async () => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập trước')
    }

    // NOTE: Không set is_driver = true ngay
    // Chỉ tạo driver application, chờ admin duyệt
    // Admin sẽ set is_driver = true khi duyệt
    
    // Function này giờ chỉ dùng để refresh user data
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Update local state
      localStorage.setItem('sanxeghep_user', JSON.stringify(data))
      setUser(data)
    } catch (error: any) {
      console.error('Refresh user error:', error)
      throw error
    }
  }

  const validateDriverSession = async () => {
    if (!user?.is_driver) return

    const localSessionId = localStorage.getItem('sanxeghep_session')
    if (!localSessionId) {
      // Không có session local, clear và logout
      localStorage.removeItem('sanxeghep_user')
      setUser(null)
      return
    }

    try {
      // Lấy session hiện tại từ database
      const { data, error } = await supabase
        .from('users')
        .select('active_session_id')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Session validation error:', error)
        return
      }

      // Nếu session không khớp, nghĩa là đã đăng nhập từ thiết bị khác
      if (data.active_session_id !== localSessionId) {
        localStorage.removeItem('sanxeghep_user')
        localStorage.removeItem('sanxeghep_session')
        setUser(null)
        
        // Trigger custom event để hiển thị modal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session-expired'))
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
    }
  }

  const signOut = async () => {
    // Xóa session từ database nếu là tài xế
    if (user?.is_driver) {
      try {
        await supabase
          .from('users')
          .update({
            active_session_id: null,
            last_active_at: new Date().toISOString()
          })
          .eq('id', user.id)
      } catch (error) {
        console.error('Clear session error:', error)
      }
    }

    localStorage.removeItem('sanxeghep_user')
    localStorage.removeItem('sanxeghep_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        upgradeToDriver,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
