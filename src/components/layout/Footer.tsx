'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Mail, Phone, MapPin, Clock, Shield, Zap, Users, MessageCircle, Instagram, Youtube } from 'lucide-react'
import { useSiteSettings } from '@/lib/use-site-settings'

export function Footer() {
  const { getSetting } = useSiteSettings()
  return (
    <footer className="relative border-t bg-white">
      {/* Main Footer */}
      <div className="container py-8 md:py-12">
        {/* Logo & Description - Full width */}
        <div className="mb-6 md:mb-8">
          <div className="space-y-3 md:space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 md:h-14 w-48 md:w-56">
                <Image 
                  src="/logo.png" 
                  alt="SanXeGhep" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Nền tảng kết nối xe ghép toàn quốc. Tiết kiệm chi phí, an toàn và tiện lợi.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="text-lg md:text-xl font-bold text-primary">12K+</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Chuyến/tháng</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/5">
                <div className="text-lg md:text-xl font-bold text-secondary">2.5K+</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Tài xế</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-accent/5">
                <div className="text-lg md:text-xl font-bold text-accent">100%</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Miễn phí</div>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                <Facebook size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                <Instagram size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                <Youtube size={16} />
              </Link>
              <Link href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                <MessageCircle size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Links Grid - 2 cols on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Dịch vụ */}
          <div>
            <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              Dịch vụ
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="/tim-chuyen" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Tìm chuyến xe ghép
              </Link></li>
              <li><Link href="/dang-chuyen" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Đăng chuyến đi
              </Link></li>
              <li><Link href="/tai-xe" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Trở thành tài xế
              </Link></li>
              <li><Link href="/dang-nhu-cau" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Đăng nhu cầu đi xe
              </Link></li>
            </ul>
          </div>

          {/* Công ty */}
          <div>
            <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
              <Shield size={18} className="text-secondary" />
              Công ty
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="/ve-chung-toi" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Về chúng tôi
              </Link></li>
              <li><Link href="/dieu-khoan-su-dung" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Điều khoản sử dụng
              </Link></li>
              <li><Link href="/chinh-sach-bao-mat" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Chính sách bảo mật
              </Link></li>
              <li><Link href="/quy-dinh-chung" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Quy định chung
              </Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Câu hỏi thường gặp
              </Link></li>
              <li><Link href="/tuyen-dung" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Tuyển dụng
              </Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
              <Users size={18} className="text-accent" />
              Liên hệ
            </h4>
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Hotline</div>
                  <a href={`tel:${getSetting('contact_hotline', '0857994994')}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {getSetting('contact_hotline', '0857 994 994')}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Email</div>
                  <a href={`mailto:${getSetting('contact_email', 'support@sanxeghep.vn')}`} className="text-muted-foreground hover:text-primary transition-colors break-all">
                    {getSetting('contact_email', 'support@sanxeghep.vn')}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Địa chỉ</div>
                  <p className="text-muted-foreground">{getSetting('contact_address', 'Thôn 8, Xã Thanh Hà, TP Hải Phòng')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Giờ làm việc</div>
                  <p className="text-muted-foreground">{getSetting('contact_working_hours', '24/7 - Hỗ trợ mọi lúc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info Bar */}
      <div className="border-t bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container py-4 md:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
                <Shield size={16} className="text-primary" />
                <p className="text-sm font-bold text-foreground">
                  {getSetting('company_name', 'Công ty TNHH Công Nghệ Sàn Xe Ghép')}
                </p>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getSetting('company_name_en', 'SAN XE GHEP TECHNOLOGY COMPANY LIMITED')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  <span>{getSetting('contact_address', 'Thôn 8, Xã Thanh Hà, TP Hải Phòng')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-primary" />
                  <a href={`tel:${getSetting('contact_hotline', '0857994994')}`} className="hover:text-primary transition-colors font-medium">
                    {getSetting('contact_hotline', '0857 994 994')}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>GPKD: {getSetting('company_business_code', 'xxxxxxx')}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>MST: {getSetting('company_tax_code', 'xxxzzz')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t bg-gray-50">
        <div className="container py-3">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SanXeGhep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
