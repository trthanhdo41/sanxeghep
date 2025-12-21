'use client'

import { Zap, DollarSign, Shield, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export function WhyChooseUs() {
  const features = [
    {
      icon: Zap,
      title: 'Kết nối nhanh chóng',
      description: 'Tìm chuyến xe phù hợp chỉ trong vài giây. Hệ thống tự động gợi ý tài xế phù hợp nhất.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: DollarSign,
      title: '100% miễn phí',
      description: 'Không thu phí trung gian. Tài xế và hành khách tự thỏa thuận giá cả trực tiếp.',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Shield,
      title: 'An toàn & uy tín',
      description: 'Tài xế được xác minh giấy tờ. Hệ thống đánh giá minh bạch từ cộng đồng.',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      icon: Clock,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn mọi lúc mọi nơi.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ]

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2 mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Tại sao chọn SanXeGhep?</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Nền tảng kết nối xe ghép hàng đầu Việt Nam
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-4 md:p-6 rounded-xl border hover:border-primary/50 transition-all hover:shadow-lg bg-card h-full">
                <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-3 md:mb-4`}>
                  <feature.icon className={`${feature.color}`} size={24} strokeWidth={2} />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
