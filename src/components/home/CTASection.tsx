'use client'

import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function CTASection() {
  return (
    <section className="py-8 md:py-10 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://taxiquanganh.com/wp-content/uploads/2022/10/xe-tien-chuyen.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
      </div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-accent/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3 md:space-y-4"
        >
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Sẵn sàng bắt đầu hành trình?
          </h2>
          <p className="text-xs md:text-sm text-white/90 max-w-2xl mx-auto drop-shadow-lg">
            Tìm chuyến xe ghép phù hợp hoặc đăng chuyến của bạn ngay hôm nay. Tiết kiệm chi phí, kết nối cộng đồng!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 pt-2 md:pt-4">
            <Link href="/tim-chuyen">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 md:px-10 py-3 md:py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all btn-glow overflow-hidden w-full sm:w-auto sm:min-w-[200px]"
              >
                <span className="relative z-10">Tìm chuyến ngay</span>
              </motion.button>
            </Link>

            <Link href="/dang-chuyen">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 md:px-10 py-3 md:py-4 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 text-white font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all btn-glow overflow-hidden w-full sm:w-auto sm:min-w-[200px]"
              >
                <span className="relative z-10">Đăng chuyến đi</span>
              </motion.button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="pt-4 md:pt-6 space-y-2 md:space-y-3">
            <p className="text-xs md:text-sm font-semibold text-white drop-shadow-lg">Cần hỗ trợ? Liên hệ ngay:</p>
            <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-md mx-auto">
              {/* Hotline */}
              <a
                href="tel:0857994994"
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-card border-2 hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="text-primary" size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] md:text-xs text-muted-foreground">Hotline</div>
                  <div className="text-xs md:text-sm font-bold">0857 994 994</div>
                </div>
              </a>

              {/* Zalo */}
              <a
                href="https://zalo.me/0857994994"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-card border-2 hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                  <Image 
                    src="/zalo-icon.svg" 
                    alt="Zalo" 
                    width={28} 
                    height={28}
                    className="object-contain md:w-8 md:h-8"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[10px] md:text-xs text-muted-foreground">Chat Zalo</div>
                  <div className="text-xs md:text-sm font-bold">Nhắn tin ngay</div>
                </div>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
