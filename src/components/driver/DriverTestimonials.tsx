'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Anh Minh',
    role: 'Tài xế 7 chỗ - Hà Nội',
    avatar: 'AM',
    content: 'Từ khi dùng SanXeGhep tôi có thêm 15-20 chuyến mỗi tháng. Không mất phí, không chia tiền, thu nhập tăng rõ rệt!',
    rating: 5,
    bgColor: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Chị Lan',
    role: 'Tài xế 4 chỗ - TP.HCM',
    avatar: 'CL',
    content: 'Đăng ký siêu dễ, chỉ 5 phút là xong. Khách liên hệ nhiều, giá cả tự thỏa thuận nên rất linh hoạt.',
    rating: 5,
    bgColor: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Anh Tuấn',
    role: 'Tài xế 16 chỗ - Đà Nẵng',
    avatar: 'AT',
    content: 'Tôi chạy tuyến Đà Nẵng - Huế, mỗi tuần đầy xe nhờ SanXeGhep. Không lo ghế trống nữa!',
    rating: 5,
    bgColor: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Anh Hùng',
    role: 'Tài xế 5 chỗ - Nam Định',
    avatar: 'AH',
    content: 'Nền tảng miễn phí mà chất lượng. Hỗ trợ nhiệt tình, khách hàng tin tưởng. Rất hài lòng!',
    rating: 5,
    bgColor: 'from-green-500 to-emerald-500',
  },
]

export function DriverTestimonials() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Tài Xế Nói Gì Về Chúng Tôi</h2>
        <p className="text-muted-foreground">Hơn 1000+ tài xế đã tin tưởng và sử dụng</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/50 transition-all">
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 opacity-10">
              <Quote className="w-16 h-16 text-primary" />
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.bgColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="font-bold">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Content */}
            <p className="text-muted-foreground leading-relaxed italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
