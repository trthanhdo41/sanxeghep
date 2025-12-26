'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Star, Car, Calendar, Edit2, Loader2, Crown, MessageCircle, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { searchLocations } from '@/lib/vietnam-locations'

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
    address: '',
  })
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    rating: 0,
    completedTrips: 0,
    totalReviews: 0,
  })
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  
  // Gợi ý địa điểm
  const addressSuggestions = useMemo(() => searchLocations(profile.address), [profile.address])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
    } else {
      router.push('/')
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          address: data.address || data.location || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Count trips as driver (active trips)
      const { count: activeTripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'active')

      // Count all trips as driver
      const { count: totalTripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)

      // Count bookings as passenger
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('passenger_id', user?.id)

      // Count pending bookings as driver
      const { count: pendingBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'pending')

      // Count confirmed bookings as driver
      const { count: confirmedBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .eq('status', 'confirmed')

      // Get rating and completed trips from users table
      const { data: userData } = await supabase
        .from('users')
        .select('rating, completed_trips, total_reviews')
        .eq('id', user?.id)
        .single()

      setStats({
        totalTrips: totalTripsCount || 0,
        activeTrips: activeTripsCount || 0,
        totalBookings: bookingsCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        confirmedBookings: confirmedBookingsCount || 0,
        rating: userData?.rating || 0,
        completedTrips: userData?.completed_trips || 0,
        totalReviews: userData?.total_reviews || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('https://api.imgbb.com/1/upload?key=8ec193d21d89729f860c58d5ba830152', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (data.success) {
        const avatarUrl = data.data.url
        
        // Update avatar in database
        const { error } = await supabase
          .from('users')
          .update({ 
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString() 
          })
          .eq('id', user?.id)

        if (error) throw error

        setProfile({ ...profile, avatar_url: avatarUrl })
        toast.success('Cập nhật ảnh đại diện thành công!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!profile.full_name.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    if (!profile.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    // Validate phone number (10 digits, starts with 0)
    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(profile.phone)) {
      toast.error('Số điện thoại phải có 10 số và bắt đầu bằng 0')
      return
    }

    setSaving(true)
    try {
      // Chỉ update các field có trong database
      const updateData: any = {
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      }
      
      // Thêm address nếu có giá trị
      if (profile.address) {
        updateData.address = profile.address
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Cập nhật thông tin thành công!')
      setEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Có lỗi xảy ra', {
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Thông Tin Cá Nhân
            </h1>
            <p className="text-muted-foreground">
              Quản lý thông tin và hoạt động của bạn
            </p>
          </div>

          {/* VIP Status Banner */}
          {user?.is_driver && (
            <>
              {user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()) ? (
                <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-2 border-amber-300 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg animate-pulse">
                      <Crown className="w-8 h-8 text-white animate-[wiggle_1s_ease-in-out_infinite]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                        Tài khoản VIP
                      </h3>
                      <p className="text-base text-amber-700 dark:text-amber-300">
                        Đăng không giới hạn số chuyến
                      </p>
                    </div>
                  </div>
                  
                  {user.premium_expires_at && (() => {
                    const now = new Date()
                    const expiresAt = new Date(user.premium_expires_at)
                    const totalDays = 30 // Assuming 30 days VIP
                    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                            <Calendar className="w-4 h-4" />
                            Hết hạn: {expiresAt.toLocaleDateString('vi-VN', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="font-bold text-amber-800 dark:text-amber-200">
                            Còn {daysLeft} ngày
                          </span>
                        </div>
                        <div className="w-full h-3 bg-amber-200 dark:bg-amber-900/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <Card className="p-6 mb-8 bg-muted/50 border-2 border-dashed">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        Tài khoản FREE
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Giới hạn 5 chuyến cùng lúc. Nâng cấp VIP để đăng không giới hạn!
                      </p>
                      <a href="/lien-he">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-2">
                          <Crown className="w-4 h-4" />
                          Nâng cấp VIP
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* For Drivers */}
            {user?.is_driver && (
              <>
                <Card className="p-4 text-center hover:shadow-lg transition-all">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 w-fit mx-auto mb-2">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.activeTrips}
                  </div>
                  <div className="text-xs text-muted-foreground">Chuyến đang đăng</div>
                </Card>

                <Card className="p-4 text-center hover:shadow-lg transition-all">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 w-fit mx-auto mb-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {stats.pendingBookings}
                  </div>
                  <div className="text-xs text-muted-foreground">Chờ xác nhận</div>
                </Card>

                <Card className="p-4 text-center hover:shadow-lg transition-all">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 w-fit mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.confirmedBookings}
                  </div>
                  <div className="text-xs text-muted-foreground">Đã xác nhận</div>
                </Card>
              </>
            )}

            {/* For Passengers */}
            {!user?.is_driver && (
              <Card className="p-4 text-center hover:shadow-lg transition-all">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 w-fit mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.totalBookings}
                </div>
                <div className="text-xs text-muted-foreground">Chuyến đã đặt</div>
              </Card>
            )}

            {/* Common Stats */}
            <Card className="p-4 text-center hover:shadow-lg transition-all">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 w-fit mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {stats.completedTrips}
              </div>
              <div className="text-xs text-muted-foreground">Chuyến hoàn thành</div>
            </Card>

            <Card className="p-4 text-center hover:shadow-lg transition-all">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 w-fit mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {stats.rating > 0 ? stats.rating.toFixed(1) : '0.0'}
              </div>
              <div className="text-xs text-muted-foreground">Đánh giá ({stats.totalReviews})</div>
            </Card>

            <Card className="p-4 text-center hover:shadow-lg transition-all">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-pink-200 w-fit mx-auto mb-2">
                <Car className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {stats.totalTrips}
              </div>
              <div className="text-xs text-muted-foreground">Tổng chuyến đăng</div>
            </Card>
          </div>

          {/* Profile Info */}
          <Card className="p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
              {!editing ? (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      fetchProfile()
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-primary to-accent"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Lưu'
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                {editing && (
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={saving}
                    >
                      {saving ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-2" />
                    Họ và tên
                  </Label>
                  <Input
                    id="name"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    placeholder="Chọn tỉnh/thành phố"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    onFocus={() => editing && setShowAddressSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                    disabled={!editing}
                    autoComplete="off"
                  />
                  {editing && showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
                      {addressSuggestions.map((location, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProfile({ ...profile, address: location })
                            setShowAddressSuggestions(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                        >
                          <MapPin size={16} className="text-muted-foreground" />
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push('/dang-chuyen')}
            >
              <Car className="w-5 h-5 mr-2" />
              Đăng chuyến mới
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push('/tim-chuyen')}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Tìm chuyến đi
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push('/profile/my-bookings')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Chuyến đi của tôi
            </Button>
            {user?.is_driver && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push('/profile/bookings')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Quản lý đặt chỗ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
