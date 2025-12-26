'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, Star, BadgeCheck, Phone, Calendar, CheckCircle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { TripDetailModal } from './TripDetailModal'
import { BookingModal } from '@/components/booking/BookingModal'
import { useAuth } from '@/lib/auth-context'

interface TripCardProps {
  trip: {
    id: string
    driver: {
      id: string
      name: string
      avatar?: string
      rating: number
      totalTrips: number
      verified: boolean
    }
    from: string
    to: string
    date: string
    time: string
    departureTime: string
    seatsAvailable: number
    totalSeats: number
    price: number
    vehicleType: string
  }
  onBookingSuccess?: () => void
}

export function TripCard({ trip, onBookingSuccess }: TripCardProps) {
  const { user } = useAuth()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setShowDetailModal(true)}
      >
        <Card className="overflow-hidden shadow-smooth hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-primary/20">
        <div className="p-6 space-y-4">
          {/* Driver Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={trip.driver.avatar} alt={trip.driver.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                  {getInitials(trip.driver.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{trip.driver.name}</h3>
                  {trip.driver.verified && (
                    <BadgeCheck className="text-primary" size={16} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={14} />
                    <span>{trip.driver.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{trip.driver.totalTrips} chuyến</span>
                </div>
                {/* Huy hiệu uy tín */}
                <div className="flex items-center gap-2 mt-1">
                  {trip.driver.rating >= 4.5 && (
                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Uy tín
                    </Badge>
                  )}
                  {trip.driver.totalTrips >= 10 && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 flex items-center gap-1">
                      <TrendingUp size={12} />
                      Hoạt động tích cực
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {trip.vehicleType}
            </Badge>
          </div>

          {/* Route */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-muted-foreground to-primary" />
                <MapPin className="text-primary" size={16} />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Điểm đi</p>
                  <p className="font-medium">{trip.from}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điểm đến</p>
                  <p className="font-medium">{trip.to}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Seats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{trip.date} • {trip.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{trip.seatsAvailable}/{trip.totalSeats} chỗ trống</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Giá</p>
              {user ? (
                <p className="text-2xl font-bold text-primary">
                  {trip.price.toLocaleString('vi-VN')}đ
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="text-xl font-bold text-muted-foreground">
                    ***{(trip.price % 1000).toString().padStart(3, '0')}đ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Đăng nhập để xem
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="font-semibold hover:bg-primary/5 hover:border-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetailModal(true)
                }}
              >
                <Phone size={16} className="mr-1" />
                Liên hệ
              </Button>
              <Button 
                size="sm"
                className="relative bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl group-hover:scale-105 transition-all btn-glow overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBookingModal(true)
                }}
              >
                <span className="relative z-10 flex items-center gap-1">
                  <Calendar size={16} />
                  Đặt chỗ
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>

    <TripDetailModal 
      trip={trip}
      open={showDetailModal}
      onOpenChange={setShowDetailModal}
    />

    <BookingModal
      open={showBookingModal}
      onOpenChange={setShowBookingModal}
      trip={{
        id: trip.id,
        driver_id: trip.driver.id,
        driver_name: trip.driver.name,
        from_location: trip.from,
        to_location: trip.to,
        departure_time: trip.departureTime,
        available_seats: trip.seatsAvailable,
        price_per_seat: trip.price,
      }}
      onSuccess={() => {
        onBookingSuccess?.()
      }}
    />
    </>
  )
}

