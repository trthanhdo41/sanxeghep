'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  customerName: string
  phone: string
  description: string
}

// Mockup data - random bookings (giống noibai.vn)
const mockBookings: Omit<Booking, 'id'>[] = [
  { customerName: 'Văn Thắng', phone: '098.250.2***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Minh Tâm', phone: '097.486.2***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Tiến Lập', phone: '090.270.2***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Quốc Dũng', phone: '098.853.3***', description: 'vừa đặt xe đi tỉnh' },
  { customerName: 'Vinh Dang', phone: '096.674.2***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Tuấn Linh', phone: '033.322.3***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Thu Hương', phone: '091.234.5***', description: 'vừa đặt xe đi Hải Phòng' },
  { customerName: 'Đức Minh', phone: '098.765.4***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Phạm Tuấn', phone: '097.123.4***', description: 'vừa đặt xe đi Nam Định' },
  { customerName: 'Thanh Lan', phone: '090.888.9***', description: 'vừa đặt xe đi Ninh Bình' },
  { customerName: 'Đức Hải', phone: '084.567.8***', description: 'vừa đặt xe đi Hạ Long' },
  { customerName: 'Văn Nam', phone: '093.456.7***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Phương Mai', phone: '088.999.1***', description: 'vừa đặt xe đi Thái Bình' },
  { customerName: 'Tuấn Quân', phone: '092.345.6***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Hoàng Long', phone: '091.678.9***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Ngọc Phương', phone: '098.234.5***', description: 'vừa đặt xe đi Vũng Tàu' },
  { customerName: 'Anh Tuấn', phone: '097.890.1***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Thị Hoa', phone: '090.123.4***', description: 'vừa đặt xe đi Đà Nẵng' },
  { customerName: 'Minh Khoa', phone: '094.567.8***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Hồng Linh', phone: '089.234.5***', description: 'vừa đặt xe đi Sapa' },
  { customerName: 'Văn Đức', phone: '096.789.0***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Quang Bình', phone: '093.890.1***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Thị Thu', phone: '091.456.7***', description: 'vừa đặt xe đi Huế' },
  { customerName: 'Văn Cường', phone: '098.567.8***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Thanh Nga', phone: '090.678.9***', description: 'vừa đặt xe đi Nha Trang' },
  { customerName: 'Văn Tùng', phone: '092.789.0***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Tiến Đạt', phone: '097.234.5***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Văn Hùng', phone: '094.345.6***', description: 'vừa đặt xe đi Phú Quốc' },
  { customerName: 'Huyền Trang', phone: '088.456.7***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Minh Sơn', phone: '091.567.8***', description: 'vừa đặt xe đi Cần Thơ' },
  { customerName: 'Văn Thành', phone: '096.890.1***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Thu Nhung', phone: '093.678.9***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Quốc Toàn', phone: '089.789.0***', description: 'vừa đặt xe đi Đà Lạt' },
  { customerName: 'Thị Hằng', phone: '090.234.5***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Đức Kiên', phone: '098.345.6***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Ngọc Dung', phone: '092.456.7***', description: 'vừa đặt xe đi Hội An' },
  { customerName: 'Văn Hải', phone: '097.567.8***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Văn Thành', phone: '094.678.9***', description: 'vừa đặt xe đi Quy Nhơn' },
  { customerName: 'Hồng Yến', phone: '091.789.0***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Văn Phong', phone: '088.890.1***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Minh Tú', phone: '096.123.4***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Ngọc Thảo', phone: '093.234.5***', description: 'vừa đặt xe đi Phan Thiết' },
  { customerName: 'Văn Lâm', phone: '090.345.6***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Đức Hiếu', phone: '089.456.7***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Phương Oanh', phone: '098.678.9***', description: 'vừa đặt xe đi Vinh' },
  { customerName: 'Văn Trung', phone: '092.890.1***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Minh Phúc', phone: '097.901.2***', description: 'vừa đặt xe đi sân bay' },
  { customerName: 'Thu Hà', phone: '094.012.3***', description: 'vừa đặt xe từ sân bay về' },
  { customerName: 'Văn Đông', phone: '091.123.4***', description: 'vừa đặt xe đi Thanh Hóa' },
  { customerName: 'Hoàng Vũ', phone: '088.234.5***', description: 'vừa đặt xe từ sân bay về' },
]

export function RealtimeBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Generate 6 initial bookings on mount
    const initialBookings = mockBookings
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map((booking, index) => ({
        id: `initial-${index}`,
        ...booking,
      }))
    
    setBookings(initialBookings)
    setMounted(true)

    // Generate random booking every 2-4 seconds
    const interval = setInterval(() => {
      const randomBooking = mockBookings[Math.floor(Math.random() * mockBookings.length)]
      
      const newBooking: Booking = {
        id: Date.now().toString(),
        ...randomBooking,
      }

      setBookings((prev) => {
        // Keep only last 6 bookings
        const updated = [...prev, newBooking].slice(-6)
        return updated
      })
    }, Math.random() * 2000 + 2000) // Random 2-4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-8 bg-gradient-to-br from-green-50/50 via-background to-primary/5 border-y overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-40" />
            <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
          </div>
          <h3 className="text-base font-bold text-center">
            Khách hàng vừa đặt chuyến
          </h3>
        </div>

        {/* List chạy từ dưới lên - mượt hơn */}
        <div className="max-w-3xl mx-auto h-[200px] overflow-hidden relative rounded-xl border border-border/50 bg-background/30 backdrop-blur-sm select-text">
          {/* Gradient fade top */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background via-background/60 to-transparent z-10 pointer-events-none" />
          
          <div className="p-2 space-y-1.5">
            {mounted && (
              <AnimatePresence mode="popLayout">
                {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ 
                    opacity: index < 4 ? 1 : 0.3, 
                    y: 0, 
                    scale: 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -40, 
                    scale: 0.95,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.3 }
                  }}
                  className="relative group"
                >
                  <div className="glass p-2 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 select-text">
                    <p className="text-xs leading-relaxed text-center select-text cursor-text">
                      <span className="font-bold text-primary select-text">KH: </span>
                      <span className="font-semibold text-foreground select-text">{booking.customerName} </span>
                      <span className="font-medium text-muted-foreground/80 select-text">{booking.phone} </span>
                      <span className="text-muted-foreground select-text">{booking.description}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            )}
          </div>

          {/* Gradient fade bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
