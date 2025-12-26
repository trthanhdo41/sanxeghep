import { supabase } from './supabase'

// Danh sách tất cả permissions
export const PERMISSIONS = {
  // Người dùng
  'users:view': 'Xem danh sách người dùng',
  'users:lock': 'Khóa/Mở khóa tài khoản',
  'users:delete': 'Xóa tài khoản',
  
  // Chuyến đi
  'trips:view': 'Xem danh sách chuyến đi',
  'trips:delete': 'Xóa chuyến đi',
  
  // Đặt chỗ
  'bookings:view': 'Xem danh sách đặt chỗ',
  'bookings:manage': 'Quản lý đặt chỗ',
  
  // Đánh giá
  'reviews:view': 'Xem danh sách đánh giá',
  'reviews:delete': 'Xóa đánh giá',
  
  // Tài xế
  'drivers:verify': 'Xác minh tài xế',
  'drivers:premium': 'Quản lý VIP',
  
  // Tin nhắn
  'messages:view': 'Xem tin nhắn',
  'messages:reply': 'Trả lời tin nhắn',
  
  // Đặt lại mật khẩu
  'password_resets:manage': 'Xử lý yêu cầu đặt lại MK',
  
  // Banner
  'banners:manage': 'Quản lý banner/ads',
  
  // Cài đặt
  'settings:manage': 'Cài đặt website',
  
  // Báo cáo
  'reports:view': 'Xem báo cáo thống kê',
  
  // Nhân viên
  'staff:manage': 'Quản lý nhân viên',
  
  // Audit Logs
  'audit_logs:view': 'Xem lịch sử hoạt động',
} as const

export type Permission = keyof typeof PERMISSIONS

// Nhóm permissions theo category
export const PERMISSION_GROUPS = {
  'Người dùng': ['users:view', 'users:lock', 'users:delete'],
  'Chuyến đi': ['trips:view', 'trips:delete'],
  'Đặt chỗ': ['bookings:view', 'bookings:manage'],
  'Đánh giá': ['reviews:view', 'reviews:delete'],
  'Tài xế': ['drivers:verify', 'drivers:premium'],
  'Tin nhắn': ['messages:view', 'messages:reply'],
  'Đặt lại mật khẩu': ['password_resets:manage'],
  'Banner/Ads': ['banners:manage'],
  'Cài đặt': ['settings:manage'],
  'Báo cáo': ['reports:view'],
  'Nhân viên': ['staff:manage'],
  'Audit Logs': ['audit_logs:view'],
} as const

// Check xem user có permission không
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    // Lấy thông tin user
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    // Admin có toàn quyền
    if (user?.role === 'admin') return true
    
    // Staff phải check permission
    if (user?.role === 'staff') {
      const { data } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId)
        .eq('permission', permission)
        .single()
      
      return !!data
    }
    
    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

// Lấy tất cả permissions của user
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    // Admin có toàn quyền
    if (user?.role === 'admin') {
      return Object.keys(PERMISSIONS) as Permission[]
    }
    
    // Staff lấy từ database
    if (user?.role === 'staff') {
      const { data } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId)
      
      return (data?.map(p => p.permission) || []) as Permission[]
    }
    
    return []
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

// Ghi audit log
export async function logAction(
  userId: string,
  action: 'create' | 'update' | 'delete' | 'view',
  resource: string,
  resourceId?: string,
  details?: any
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: null, // Có thể lấy từ request nếu cần
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  } catch (error) {
    console.error('Error logging action:', error)
  }
}

// Permission templates (mẫu quyền nhanh)
export const PERMISSION_TEMPLATES = {
  'Hỗ trợ khách hàng': [
    'users:view',
    'bookings:view',
    'messages:view',
    'messages:reply',
    'password_resets:manage',
  ] as Permission[],
  
  'Kiểm duyệt viên': [
    'trips:view',
    'trips:delete',
    'reviews:view',
    'reviews:delete',
    'messages:view',
    'messages:reply',
    'banners:manage',
  ] as Permission[],
  
  'Quản lý': [
    'users:view',
    'users:lock',
    'trips:view',
    'trips:delete',
    'bookings:view',
    'bookings:manage',
    'reviews:view',
    'drivers:verify',
    'drivers:premium',
    'messages:view',
    'messages:reply',
    'reports:view',
  ] as Permission[],
}
