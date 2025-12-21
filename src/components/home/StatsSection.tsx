'use client'

import { Car, Users, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = (currentTime - startTime) / (duration * 1000)

      if (progress < 1) {
        setCount(Math.floor(end * progress))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <span>{count.toLocaleString('vi-VN')}</span>
}

export function StatsSection() {
  const stats = [
    {
      icon: Car,
      value: 12400,
      label: 'chuyến xe/tháng',
      color: 'text-primary'
    },
    {
      icon: Users,
      value: 2500,
      label: 'tài xế hoạt động',
      color: 'text-secondary'
    },
    {
      icon: BadgeCheck,
      value: 100,
      label: '% miễn phí',
      color: 'text-accent'
    }
  ]

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="text-center space-y-2 md:space-y-3 p-3 md:p-5 rounded-xl bg-card border shadow-smooth hover:shadow-lg hover:border-primary/30 transition-all">
                <div className={`inline-flex p-2 md:p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20`}>
                  <stat.icon className={`${stat.color}`} size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold gradient-text">
                    <Counter end={stat.value} />
                    {stat.label.includes('%') ? '' : '+'}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs md:text-sm font-medium leading-tight">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
