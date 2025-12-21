'use client'

import { TripCard } from '@/components/trips/TripCard'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Trip {
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

export function FeaturedTrips() {
  const { user, loading: authLoading } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('Query error:', error)
          throw error
        }

        if (!data || data.length === 0) {
          setTrips([])
          setLoading(false)
          return
        }

        // Fetch driver info separately
        const driverIds = data.map(t => t.driver_id).filter(Boolean)
        const { data: driversData } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, phone')
          .in('id', driverIds)

        const driversMap = new Map(driversData?.map(d => [d.id, d]) || [])

        const formattedTrips: Trip[] = data.map((trip: any) => {
          const driver = driversMap.get(trip.driver_id)
          
          return {
            id: trip.id,
            driver: {
              name: driver?.full_name || 'Tài xế',
              avatar: driver?.avatar_url || '',
              phone: driver?.phone || '',
              rating: 4.5,
              totalTrips: 0,
              verified: true,
            },
            from: trip.from_location || 'N/A',
            to: trip.to_location || 'N/A',
            date: trip.date ? new Date(trip.date).toLocaleDateString('vi-VN') : 'N/A',
            time: trip.time ? trip.time.slice(0, 5) : '00:00',
            seatsAvailable: trip.seats_available || 0,
            totalSeats: trip.total_seats || 0,
            price: trip.price || 0,
            vehicleType: trip.vehicle_type || '4 chỗ',
            notes: trip.notes || '',
          }
        })

        setTrips(formattedTrips)
      } catch (error) {
        console.error('Error fetching trips:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  // Ẩn với tài xế (tránh cãi giá)
  // Hiển thị cho: chưa đăng nhập + hành khách
  if (authLoading) {
    return null // Đang load auth
  }

  if (user?.is_driver) {
    return null // Tài xế không được xem
  }

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2 mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Chuyến đi nổi bật</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Các chuyến xe ghép đang chờ bạn
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/tim-chuyen">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-10 py-4 rounded-xl border-2 border-primary text-primary font-bold text-lg hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-xl overflow-hidden btn-glow"
                >
                  <span className="relative z-10">Xem tất cả chuyến đi</span>
                </motion.button>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Chưa có chuyến đi nào. Hãy là người đầu tiên đăng chuyến!
            </p>
            <Link href="/dang-chuyen">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl btn-glow"
              >
                Đăng chuyến ngay
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
