'use client'

import { Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'

const testimonials = [
  {
    name: 'Nguyễn Phương Oanh',
    role: 'Kế toán',
    email: 'oanhnp***@gmail.com',
    avatar: 'NP',
    rating: 5,
    comment: 'Rất đúng hẹn, dịch vụ chuyên nghiệp, giá hợp lý, ủng hộ và mình sẽ thường xuyên gọi SanXeGhep khi cần.',
  },
  {
    name: 'Phạm Đức Tuấn',
    role: 'Kỹ sư tại Thanh Xuân, HN',
    email: 'tuan.pham88***@gmail.com',
    avatar: 'PT',
    rating: 5,
    comment: 'Giao diện đẹp, rất dễ đặt và thao tác, hi vọng dịch vụ các bạn sẽ phát triển rộng rãi trong thời gian tới để tất cả mọi người đều được sử dụng dịch vụ này.',
  },
  {
    name: 'Trần Minh Long',
    role: 'Giảng viên ngoại ngữ',
    email: 'longtrant***@yahoo.com.vn',
    avatar: 'TL',
    rating: 5,
    comment: 'Tôi thường xuyên đi công tác và phải đặt xe đi sân bay. Từ lúc đặt xe trên SanXeGhep thì thực sự rất tiện, giá hợp lý và thuận tiện. Rất cảm ơn!',
  },
  {
    name: 'Lê Thị Hương',
    role: 'Chuyên viên Marketing',
    email: 'huongle***@gmail.com',
    avatar: 'LH',
    rating: 5,
    comment: 'Tài xế lịch sự, xe sạch sẽ, đúng giờ. Giá cả phải chăng hơn nhiều so với taxi truyền thống. Sẽ tiếp tục sử dụng dịch vụ!',
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Chuyển đổi mỗi 5 giây

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-8 md:py-12 bg-white dark:bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2 mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Khách hàng nói gì</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Hàng nghìn khách hàng đã tin tưởng sử dụng
          </p>
        </motion.div>
      </div>

      <div className="container relative min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass p-6 md:p-8 rounded-xl space-y-4 max-w-3xl mx-auto"
          >
            {/* Rating */}
            <div className="flex items-center justify-center gap-1">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
              ))}
            </div>

            {/* Comment */}
            <p className="text-base md:text-lg text-center text-muted-foreground leading-relaxed">
              "{testimonials[currentIndex].comment}"
            </p>

            {/* User Info */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                  {testimonials[currentIndex].avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Xem đánh giá ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
