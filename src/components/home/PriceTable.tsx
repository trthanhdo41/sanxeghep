'use client'

import { Car } from 'lucide-react'
import { motion } from 'framer-motion'

export function PriceTable() {
  // Nội dung mẫu - sẽ cập nhật sau khi có giá thật
  const priceData = [
    {
      vehicleType: 'Xe 4 chỗ',
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '150.000đ - 200.000đ' },
        { from: 'Hà Nội', to: 'Nam Định', price: '120.000đ - 150.000đ' },
        { from: 'Hà Nội', to: 'Nội Bài', price: '80.000đ - 120.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '180.000đ - 250.000đ' }
      ]
    },
    {
      vehicleType: 'Xe 7 chỗ',
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '180.000đ - 250.000đ' },
        { from: 'Hà Nội', to: 'Nam Định', price: '150.000đ - 180.000đ' },
        { from: 'Hà Nội', to: 'Nội Bài', price: '100.000đ - 150.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '220.000đ - 300.000đ' }
      ]
    },
    {
      vehicleType: 'Xe 16 chỗ',
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '100.000đ - 150.000đ' },
        { from: 'Hà Nội', to: 'Nam Định', price: '80.000đ - 120.000đ' },
        { from: 'Hà Nội', to: 'Nội Bài', price: '50.000đ - 80.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '120.000đ - 180.000đ' }
      ]
    }
  ]

  return (
    <section className="py-6 md:py-10 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2 mb-4 md:mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Bảng giá tham khảo</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Giá ước tính các tuyến phổ biến
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {priceData.map((vehicle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all bg-card h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-accent p-2 md:p-3 text-white">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Car size={16} strokeWidth={2.5} />
                    <h3 className="text-sm md:text-base font-bold">{vehicle.vehicleType}</h3>
                  </div>
                </div>

                {/* Routes */}
                <div className="p-2 md:p-3 space-y-1.5 md:space-y-2">
                  {vehicle.routes.map((route, routeIndex) => (
                    <div
                      key={routeIndex}
                      className="flex items-center justify-between py-1.5 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="text-xs md:text-sm font-medium">{route.from} → {route.to}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs md:text-sm font-bold text-primary whitespace-nowrap">{route.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer note */}
                <div className="px-2 md:px-3 pb-2 md:pb-3">
                  <p className="text-[10px] md:text-xs text-muted-foreground text-center italic">
                    * Giá có thể thay đổi
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-4 md:mt-6 text-center"
        >
          <div className="inline-block p-2 md:p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs md:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Lưu ý:</span> Giá tham khảo. 
              Giá thực tế do tài xế và hành khách thỏa thuận.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
