// Helper functions for admin access control

export function isAdmin(userRole?: string): boolean {
  return userRole === 'admin'
}

export function isStaff(userRole?: string): boolean {
  return userRole === 'staff'
}

export function canAccessAdmin(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'staff'
}

export function canAccessStaffManagement(userRole?: string): boolean {
  // Only admin can manage staff
  return userRole === 'admin'
}
