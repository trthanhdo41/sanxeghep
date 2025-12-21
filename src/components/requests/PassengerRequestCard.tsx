'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, Package, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { PassengerRequestDetailModal } from './PassengerRequestDetailModal'

interface PassengerRequestCardProps {
  request: {
    id: string
    user_id: string
    from_location: string
    to_location: string
    date: string
    time: string
    passengers: number
    luggage?: string
    notes?: string
    status: string
    created_at: string
    user?: {
      full_name: string
      phone: string
      avatar_url?: string
    }
  }
}

export function PassengerRequestCard({ request }: PassengerRequestCardProps) {
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
            {/* User Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={request.user?.avatar_url} alt={request.user?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {request.user?.full_name ? getInitials(request.user.full_name) : 'KH'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{request.user?.full_name || 'Khách hàng'}</h3>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {request.passengers} người
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
                    <p className="font-medium">{request.from_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Điểm đến</p>
                    <p className="font-medium">{request.to_location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time & Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{new Date(request.date).toLocaleDateString('vi-VN')} • {request.time}</span>
              </div>
              {request.luggage && (
                <div className="flex items-center gap-1.5">
                  <Package size={16} />
                  <span className="truncate">{request.luggage}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Liên hệ ngay</p>
                <p className="text-lg font-bold text-primary">
                  {request.user?.phone || 'Chưa có SĐT'}
                </p>
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
                  Chi tiết
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <PassengerRequestDetailModal 
        request={request}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  )
}
