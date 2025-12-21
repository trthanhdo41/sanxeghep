'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, Star, BadgeCheck, Phone, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { TripDetailModal } from './TripDetailModal'
import { useAuth } from '@/lib/auth-context'

interface TripCardProps {
  trip: {
    id: string
    driver: {
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
    seatsAvailable: number
    totalSeats: number
    price: number
    vehicleType: string
  }
}

export function TripCard({ trip }: TripCardProps) {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
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
        onClick={() => setShowModal(true)}
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
          <div className="flex items-center justify-between pt-4 border-t">
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
            <Button 
              className="relative bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl group-hover:scale-105 transition-all btn-glow overflow-hidden"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Phone size={16} />
                Liên hệ
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>

    <TripDetailModal 
      trip={trip}
      open={showModal}
      onOpenChange={setShowModal}
    />
    </>
  )
}
