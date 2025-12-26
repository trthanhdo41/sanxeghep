'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Clock, Users, Banknote, Car, Loader2, Crown, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { searchLocations } from '@/lib/vietnam-locations'

export default function DangChuyenPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    departureDate: '',
    departureTime: '',
    seatsAvailable: '',
    totalSeats: '',
    price: '',
    vehicleType: '',
    notes: '',
  })

  // Gợi ý địa điểm
  const fromSuggestions = useMemo(() => searchLocations(formData.fromLocation), [formData.fromLocation])
  const toSuggestions = useMemo(() => searchLocations(formData.toLocation), [formData.toLocation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      const errorMsg = 'Vui lòng đăng nhập để đăng chuyến'
      setError(errorMsg)
      toast.error('Chưa đăng nhập', {
        description: errorMsg,
      })
      return
    }

    // Check if user is driver
    if (!user.is_driver) {
      toast.error('Bạn chưa đăng ký làm tài xế', {
        description: 'Vui lòng đăng ký làm tài xế trước khi đăng chuyến',
      })
      router.push('/tai-xe')
      return
    }

    setError('')
    setLoading(true)
    const loadingToast = toast.loading('Đang kiểm tra...', {
      description: 'Vui lòng đợi trong giây lát',
    })

    try {
      // Validate session for driver (prevent concurrent login)
      const localSessionId = localStorage.getItem('sanxeghep_session')
      if (!localSessionId) {
        toast.error('Phiên đăng nhập không hợp lệ', {
          description: 'Vui lòng đăng nhập lại',
          id: loadingToast,
        })
        router.push('/')
        return
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('users')
        .select('active_session_id')
        .eq('id', user.id)
        .single()

      if (sessionError || sessionData.active_session_id !== localSessionId) {
        toast.error('Tài khoản đã đăng nhập từ thiết bị khác', {
          description: 'Vui lòng đăng nhập lại để tiếp tục',
          id: loadingToast,
        })
        localStorage.removeItem('sanxeghep_user')
        localStorage.removeItem('sanxeghep_session')
        router.push('/')
        return
      }
      // Check if user is premium or expired
      const isPremium = user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date())
      
      // Check for duplicate trip (same driver, route, date)
      const { data: existingTrips, error: checkError } = await supabase
        .from('trips')
        .select('id')
        .eq('driver_id', user.id)
        .eq('from_location', formData.fromLocation)
        .eq('to_location', formData.toLocation)
        .eq('date', formData.departureDate)
        .eq('status', 'active')

      if (checkError) {
        console.error('Check error:', checkError)
        throw new Error('Không thể kiểm tra chuyến đi trùng lặp')
      }

      if (existingTrips && existingTrips.length > 0) {
        toast.error('Chuyến đi đã tồn tại!', {
          description: `Bạn đã đăng chuyến ${formData.fromLocation} → ${formData.toLocation} vào ngày ${new Date(formData.departureDate).toLocaleDateString('vi-VN')} rồi. Vui lòng chỉnh sửa chuyến cũ hoặc chọn ngày khác.`,
          id: loadingToast,
          duration: 5000,
        })
        setLoading(false)
        return
      }

      // Check trip limit for FREE users
      if (!isPremium) {
        const { count: activeTripsCount, error: countError } = await supabase
          .from('trips')
          .select('id', { count: 'exact', head: true })
          .eq('driver_id', user.id)
          .eq('status', 'active')

        if (countError) {
          console.error('Count error:', countError)
          throw new Error('Không thể kiểm tra số chuyến đã đăng')
        }

        if (activeTripsCount !== null && activeTripsCount >= 5) {
          toast.error('Đã đạt giới hạn!', {
            description: 'Tài khoản FREE chỉ được đăng tối đa 5 chuyến cùng lúc. Nâng cấp lên VIP để đăng không giới hạn.',
            id: loadingToast,
            duration: 7000,
          })
          setError('Bạn đã đạt giới hạn 5 chuyến. Vui lòng liên hệ Admin để nâng cấp VIP.')
          setLoading(false)
          return
        }
      }

      toast.loading('Đang đăng chuyến...', {
        description: 'Vui lòng đợi trong giây lát',
        id: loadingToast,
      })

      const tripData = {
        driver_id: user.id,
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        date: formData.departureDate,
        time: formData.departureTime,
        seats_available: parseInt(formData.seatsAvailable),
        total_seats: parseInt(formData.totalSeats),
        vehicle_type: formData.vehicleType,
        price: parseFloat(formData.price),
        price_negotiable: false,
        notes: formData.notes || null,
        status: 'active',
      }

      console.log('Inserting trip data:', tripData)

      const { data: insertedData, error: insertError } = await supabase
        .from('trips')
        .insert(tripData)
        .select()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw insertError
      }

      console.log('Trip inserted successfully:', insertedData)

      toast.success('Đăng chuyến thành công!', {
        description: 'Chuyến đi của bạn đã được đăng',
        id: loadingToast,
      })
      
      // Success - redirect to home
      setTimeout(() => router.push('/'), 1000)
    } catch (err: any) {
      const errorMsg = err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errorMsg)
      toast.error('Đăng chuyến thất bại', {
        description: errorMsg,
        id: loadingToast,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground">Bạn cần đăng nhập để đăng chuyến đi</p>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  // Check if user is driver (using is_driver flag instead of role)
  if (!user.is_driver && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Chỉ dành cho tài xế</h1>
          <p className="text-muted-foreground">
            Bạn cần đăng ký làm tài xế để đăng chuyến đi
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/tai-xe')}>Đăng ký tài xế</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Về trang chủ</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 bg-muted/30">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="gradient-text">Đăng chuyến đi</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Chia sẻ chuyến đi của bạn và tiết kiệm chi phí
            </p>
            
            {/* Premium Status */}
            {user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()) ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 dark:text-amber-100">
                        Tài khoản VIP
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Hết hạn: {expiresAt.toLocaleDateString('vi-VN')}
                          </span>
                          <span className="font-semibold">
                            Còn {daysLeft} ngày
                          </span>
                        </div>
                        <div className="w-full h-2 bg-amber-200 dark:bg-amber-900/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-full text-sm">
                  <span>Tài khoản FREE - Tối đa 5 chuyến cùng lúc</span>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                      <Crown className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">
                        Nâng cấp lên VIP để đăng không giới hạn!
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Tài khoản VIP được đăng không giới hạn số chuyến, ưu tiên hiển thị và nhiều tính năng khác.
                      </p>
                    </div>
                    <a href="/lien-he">
                      <Button size="default" className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        <Phone className="w-4 h-4" />
                        Liên hệ Admin để nâng cấp
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
            {/* From - To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from">Điểm đi *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                  <Input
                    id="from"
                    placeholder="VD: Hà Nội, Bắc Ninh..."
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    className="pl-10"
                    autoComplete="off"
                    required
                  />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
                      {fromSuggestions.map((location, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, fromLocation: location })
                            setShowFromSuggestions(false)
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

              <div className="space-y-2">
                <Label htmlFor="to">Điểm đến *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10" size={18} />
                  <Input
                    id="to"
                    placeholder="VD: Hải Phòng, Quảng Ninh..."
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    className="pl-10"
                    autoComplete="off"
                    required
                  />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
                      {toSuggestions.map((location, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, toLocation: location })
                            setShowToSuggestions(false)
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

            {/* Date - Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Ngày đi *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="date"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Giờ đi *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="time"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Loại xe *</Label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                  required
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4 chỗ">Xe 4 chỗ</SelectItem>
                    <SelectItem value="5 chỗ">Xe 5 chỗ</SelectItem>
                    <SelectItem value="7 chỗ">Xe 7 chỗ</SelectItem>
                    <SelectItem value="16 chỗ">Xe 16 chỗ</SelectItem>
                    <SelectItem value="29 chỗ">Xe 29 chỗ</SelectItem>
                    <SelectItem value="45 chỗ">Xe 45 chỗ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Tổng số ghế *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="totalSeats"
                    type="number"
                    placeholder="VD: 4 (tổng số ghế trên xe)"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    className="pl-10"
                    min="1"
                    max="16"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatsAvailable">Số ghế trống *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <Input
                    id="seatsAvailable"
                    type="number"
                    placeholder="VD: 2 (số ghế còn trống)"
                    value={formData.seatsAvailable}
                    onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                    className="pl-10"
                    min="1"
                    max={formData.totalSeats || "16"}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Giá mỗi ghế (VNĐ) *</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="price"
                  type="text"
                  placeholder="VD: 120.000"
                  value={formData.price ? parseInt(formData.price).toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, price: value })
                  }}
                  className="pl-10 pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">đ</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Giá hiển thị: {formData.price ? `${parseInt(formData.price).toLocaleString('vi-VN')} đ` : '0 đ'}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
              <textarea
                id="notes"
                placeholder="Ví dụ: Có điều hòa, nhạc nhẹ, không hút thuốc..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full min-h-[100px] px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-6 text-lg bg-gradient-to-r from-primary to-accent"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                'Đăng chuyến ngay'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
