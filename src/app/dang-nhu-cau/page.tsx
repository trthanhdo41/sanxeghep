'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Package, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { searchLocations } from '@/lib/vietnam-locations'
import { toast } from 'sonner'

export default function DangNhuCauPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    date: '',
    time: '',
    passengers: '1',
    luggage: '',
    notes: '',
  })

  // Location suggestions
  const fromSuggestions = useMemo(() => searchLocations(formData.fromLocation), [formData.fromLocation])
  const toSuggestions = useMemo(() => searchLocations(formData.toLocation), [formData.toLocation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng nhu cầu')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('passenger_requests').insert({
        user_id: user.id,
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        date: formData.date,
        time: formData.time,
        passengers: parseInt(formData.passengers),
        luggage: formData.luggage || null,
        notes: formData.notes || null,
        status: 'active',
      })

      if (error) throw error

      toast.success('Đăng nhu cầu thành công!', {
        description: 'Tài xế sẽ liên hệ với bạn sớm nhất',
      })

      router.push('/')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Có lỗi xảy ra', {
        description: error.message || 'Vui lòng thử lại sau',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để đăng nhu cầu đi xe
          </p>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Đăng Nhu Cầu Đi Xe
            </h1>
            <p className="text-lg text-muted-foreground">
              Cho tài xế biết bạn cần đi đâu, họ sẽ chủ động liên hệ với bạn
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From - To */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <Label htmlFor="from">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Điểm đi
                  </Label>
                  <Input
                    id="from"
                    placeholder="Hà Nội"
                    value={formData.fromLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, fromLocation: e.target.value })
                    }
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    autoComplete="off"
                    required
                  />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-50">
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

                <div className="space-y-2 relative">
                  <Label htmlFor="to">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Điểm đến
                  </Label>
                  <Input
                    id="to"
                    placeholder="Hải Phòng"
                    value={formData.toLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, toLocation: e.target.value })
                    }
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    autoComplete="off"
                    required
                  />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-50">
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

              {/* Date - Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Ngày đi
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Giờ đi (dự kiến)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Passengers - Luggage */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passengers">
                    <Users className="w-4 h-4 inline mr-2" />
                    Số người đi
                  </Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.passengers}
                    onChange={(e) =>
                      setFormData({ ...formData, passengers: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage">
                    <Package className="w-4 h-4 inline mr-2" />
                    Hành lý (tùy chọn)
                  </Label>
                  <Input
                    id="luggage"
                    placeholder="VD: 2 vali lớn, 1 túi xách"
                    value={formData.luggage}
                    onChange={(e) =>
                      setFormData({ ...formData, luggage: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Ghi chú (tùy chọn)
                </Label>
                <textarea
                  id="notes"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="VD: Cần ghế trẻ em, có thú cưng, điểm đón cụ thể..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Lưu ý:</strong> Sau khi đăng nhu cầu, tài xế có chuyến phù hợp sẽ chủ động liên hệ với bạn. 
                  Vui lòng để ý điện thoại và kiểm tra thông báo.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  'Đăng nhu cầu'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
