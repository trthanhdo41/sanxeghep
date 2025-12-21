import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { RealtimeBookings } from '@/components/home/RealtimeBookings'
import { FeaturedTrips } from '@/components/home/FeaturedTrips'
import { PopularRoutes } from '@/components/home/PopularRoutes'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { HowItWorks } from '@/components/home/HowItWorks'
import { PriceTable } from '@/components/home/PriceTable'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { CTASection } from '@/components/home/CTASection'
import { BannerDisplay } from '@/components/home/BannerDisplay'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      
      {/* Banner Top */}
      <div className="container py-4">
        <BannerDisplay position="home_top" />
      </div>
      
      <StatsSection />
      <RealtimeBookings />
      <FeaturedTrips />
      
      {/* Banner Middle */}
      <div className="container py-4">
        <BannerDisplay position="home_middle" />
      </div>
      
      <PopularRoutes />
      <WhyChooseUs />
      <HowItWorks />
      <PriceTable />
      <Testimonials />
      {/* FAQ with title */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              <span className="gradient-text">Câu hỏi thường gặp</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Giải đáp những thắc mắc phổ biến về SanXeGhep
            </p>
          </div>
          <FAQ />
        </div>
      </section>
      
      {/* Banner Bottom */}
      <div className="container py-4">
        <BannerDisplay position="home_bottom" />
      </div>
      
      <CTASection />
    </>
  )
}
