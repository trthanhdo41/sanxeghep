'use client'

import { Search, MessageCircle, Car, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Tìm kiếm chuyến đi',
      description: 'Nhập điểm đi, điểm đến và thời gian. Hệ thống sẽ hiển thị các chuyến phù hợp.',
      color: 'from-primary to-accent'
    },
    {
      icon: MessageCircle,
      title: 'Liên hệ trực tiếp',
      description: 'Gọi điện hoặc nhắn tin Zalo với tài xế để thỏa thuận chi tiết chuyến đi.',
      color: 'from-accent to-secondary'
    },
    {
      icon: Car,
      title: 'Lên xe và đi',
      description: 'Gặp tài xế tại điểm hẹn, thanh toán trực tiếp và bắt đầu hành trình.',
      color: 'from-secondary to-primary'
    },
    {
      icon: CheckCircle,
      title: 'Đánh giá sau chuyến',
      description: 'Đánh giá tài xế/hành khách để xây dựng cộng đồng uy tín và chất lượng.',
      color: 'from-primary to-accent'
    }
  ]

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2 mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Cách hoạt động</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Chỉ 4 bước đơn giản để bắt đầu
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative flex items-center"
            >
              <div className="text-center space-y-2 md:space-y-3 flex-1">
                {/* Step number */}
                <div className="relative inline-block mb-2">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="text-white" size={24} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 md:border-4 border-background z-10">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Arrow between steps - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    <ArrowRight className="text-primary" size={32} strokeWidth={2.5} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
