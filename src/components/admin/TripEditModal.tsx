'use client'

import { useState, useMemo } from 'react'
import { MapPin, Calendar, Clock, Users, Banknote, Car, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { searchLocations } from '@/lib/vietnam-locations'

interface TripEditModalProps {
  trip: any
  open: boolean
  onClose: () => void
  onSave: (trip: any) => Promise<void>
}

export function TripEditModal({ trip, open, onClose, onSave }: TripEditModalProps) {
  const [editData, setEditData] = useState(trip)
  const [saving, setSaving] = useState(false)
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const fromSuggestions = useMemo(() => searchLocations(editData.from_location || ''), [editData.from_location])
  const toSuggestions = useMemo(() => searchLocations(editData.to_location || ''), [editData.to_location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(editData)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '')
    return num ? parseInt(num).toLocaleString('vi-VN') : ''
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setEditData({ ...editData, price: value ? parseFloat(value) : 0 })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sửa chuyến đi</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chuyến đi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Điểm đi - Điểm đến */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label htmlFor="from" className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Điểm đi *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="from"
                  placeholder="VD: Hà Nội, Bắc Ninh..."
                  value={editData.from_location}
                  onChange={(e) => setEditData({ ...editData, from_location: e.target.value })}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                  className="pl-10"
                  required
                />
              </div>
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
                  {fromSuggestions.map((location, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditData({ ...editData, from_location: location })
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
              <Label htmlFor="to" className="flex items-center gap-2">
                <MapPin size={18} className="text-accent" />
                Điểm đến *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="to"
                  placeholder="VD: Hải Phòng, Quảng Ninh..."
                  value={editData.to_location}
                  onChange={(e) => setEditData({ ...editData, to_location: e.target.value })}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                  className="pl-10"
                  required
                />
              </div>
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
                  {toSuggestions.map((location, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditData({ ...editData, to_location: location })
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

          {/* Ngày đi - Giờ đi */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Ngày đi *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="date"
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Giờ đi *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="time"
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  className="pl-10"
                  placeholder="--:--"
                  required
                />
              </div>
            </div>
          </div>

          {/* Loại xe */}
          <div className="space-y-2">
            <Label htmlFor="vehicle" className="flex items-center gap-2">
              <Car size={18} className="text-primary" />
              Loại xe *
            </Label>
            <Select
              value={editData.vehicle_type}
              onValueChange={(value) => setEditData({ ...editData, vehicle_type: value })}
            >
              <SelectTrigger className="pl-10">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <SelectValue placeholder="Chọn loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4 chỗ">4 chỗ</SelectItem>
                <SelectItem value="5 chỗ">5 chỗ</SelectItem>
                <SelectItem value="7 chỗ">7 chỗ</SelectItem>
                <SelectItem value="16 chỗ">16 chỗ</SelectItem>
                <SelectItem value="29 chỗ">29 chỗ</SelectItem>
                <SelectItem value="45 chỗ">45 chỗ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tổng số ghế - Số ghế trống */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalSeats" className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Tổng số ghế *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="totalSeats"
                  type="number"
                  placeholder="VD: 4 (tổng số ghế trên xe)"
                  value={editData.total_seats}
                  onChange={(e) => setEditData({ ...editData, total_seats: parseInt(e.target.value) })}
                  className="pl-10"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatsAvailable" className="flex items-center gap-2">
                <Users size={18} className="text-accent" />
                Số ghế trống *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="seatsAvailable"
                  type="number"
                  placeholder="VD: 2 (số ghế còn trống)"
                  value={editData.seats_available}
                  onChange={(e) => setEditData({ ...editData, seats_available: parseInt(e.target.value) })}
                  className="pl-10"
                  min="0"
                  max={editData.total_seats}
                  required
                />
              </div>
            </div>
          </div>

          {/* Giá */}
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <Banknote size={18} className="text-primary" />
              Giá mỗi ghế (VNĐ) *
            </Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="price"
                type="text"
                placeholder="VD: 120.000"
                value={formatPrice(editData.price?.toString() || '')}
                onChange={handlePriceChange}
                className="pl-10"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                đ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Giá hiện tại: {editData.price ? `${editData.price.toLocaleString('vi-VN')} đ` : '0 đ'}
            </p>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <textarea
              id="notes"
              placeholder="VD: Có điều hòa, nhạc nhẹ, không hút thuốc..."
              value={editData.notes || ''}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={editData.status}
              onValueChange={(value) => setEditData({ ...editData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
