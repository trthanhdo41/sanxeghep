'use client'

import Link from 'next/link'
import { MapPin, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export function PopularRoutes() {
  // Nội dung mẫu - sẽ thay bằng data thật từ Supabase
  const routes = [
    {
      from: 'Hà Nội',
      to: 'Hải Phòng',
      distance: '120 km',
      priceFrom: '150.000đ',
      trips: 45
    },
    {
      from: 'Hà Nội',
      to: 'Nam Định',
      distance: '90 km',
      priceFrom: '120.000đ',
      trips: 32
    },
    {
      from: 'Hà Nội',
      to: 'Ninh Bình',
      distance: '95 km',
      priceFrom: '130.000đ',
      trips: 28
    },
    {
      from: 'HCM',
      to: 'Vũng Tàu',
      distance: '125 km',
      priceFrom: '180.000đ',
      trips: 56
    },
    {
      from: 'HCM',
      to: 'Đà Lạt',
      distance: '300 km',
      priceFrom: '350.000đ',
      trips: 38
    },
    {
      from: 'Hà Nội',
      to: 'Nội Bài',
      distance: '35 km',
      priceFrom: '80.000đ',
      trips: 89
    }
  ]

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
            <span className="gradient-text">Tuyến đường phổ biến</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Các tuyến xe ghép được tìm kiếm nhiều nhất
          </p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {routes.map((route, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/tim-chuyen?from=${route.from}&to=${route.to}`}>
                <Card className="p-2 md:p-3 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group h-full">
                  {/* From Location */}
                  <div className="flex flex-col items-center gap-0.5 mb-1">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MapPin className="text-primary" size={12} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs md:text-sm">{route.from}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center my-1">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowDown className="text-white" size={10} />
                    </div>
                  </div>

                  {/* To Location */}
                  <div className="flex flex-col items-center gap-0.5 mb-2">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <MapPin className="text-accent" size={12} />
                    </div>
                    <div className="font-bold text-xs md:text-sm text-center">{route.to}</div>
                  </div>

                  <div className="pt-2 border-t text-center space-y-0.5">
                    <div className="text-xs md:text-sm font-bold text-primary">{route.priceFrom}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{route.trips} chuyến</div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 md:mt-8"
        >
          <Link href="/tim-chuyen">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg border-2 border-primary text-primary font-semibold text-xs md:text-sm hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent transition-all shadow-md hover:shadow-lg"
            >
              Xem tất cả tuyến đường
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
