import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Blog - Tin tức xe ghép | SanXeGhep.vn',
  description: 'Cập nhật tin tức, kinh nghiệm đi xe ghép, chia sẻ chi phí di chuyển thông minh tại Việt Nam. Mẹo tiết kiệm, an toàn khi đi chung xe.',
  keywords: 'blog xe ghép, tin tức xe ghép, kinh nghiệm đi xe ghép, chia sẻ chi phí, đi chung xe, carpooling việt nam',
  authors: [{ name: 'SanXeGhep' }],
  creator: 'SanXeGhep',
  publisher: 'SanXeGhep.vn',
  alternates: {
    canonical: 'https://sanxeghep.vn/blog',
  },
  openGraph: {
    title: 'Blog - Tin tức xe ghép | SanXeGhep.vn',
    description: 'Cập nhật tin tức, kinh nghiệm đi xe ghép, chia sẻ chi phí di chuyển thông minh tại Việt Nam.',
    url: 'https://sanxeghep.vn/blog',
    siteName: 'SanXeGhep.vn',
    images: [
      {
        url: 'https://sanxeghep.vn/logo.png',
        width: 1200,
        height: 630,
        alt: 'SanXeGhep - Sàn xe ghép uy tín',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Tin tức xe ghép | SanXeGhep.vn',
    description: 'Cập nhật tin tức, kinh nghiệm đi xe ghép, chia sẻ chi phí di chuyển thông minh tại Việt Nam.',
    images: ['https://sanxeghep.vn/logo.png'],
    creator: '@sanxeghep',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const blogPosts = [
  {
    slug: 'xe-ghep-la-gi-loi-ich-khi-di-xe-ghep',
    title: 'Xe ghép là gì? 7 lợi ích tuyệt vời khi đi xe ghép bạn nên biết',
    excerpt: 'Xe ghép hay đi chung xe đang trở thành xu hướng di chuyển thông minh, tiết kiệm và thân thiện với môi trường. Cùng tìm hiểu những lợi ích tuyệt vời của hình thức này.',
    image: 'https://aloifood.com/wp-content/uploads/2025/06/xe-ghep-la-gi.webp',
    category: 'Hướng dẫn',
    date: '2025-01-15',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
  },
  {
    slug: 'cach-tiet-kiem-chi-phi-di-chuyen-bang-xe-ghep',
    title: 'Cách tiết kiệm 50% chi phí di chuyển bằng xe ghép',
    excerpt: 'Chia sẻ chi phí xăng, phí đường, phí cầu đường khi đi xe ghép giúp bạn tiết kiệm đáng kể. Khám phá cách tính toán và tối ưu chi phí hiệu quả nhất.',
    image: 'https://otogiadinh.top/wp-content/uploads/2022/11/taxi-gia-dinh.jpg',
    category: 'Tiết kiệm',
    date: '2025-01-10',
    author: 'SanXeGhep',
    readTime: '4 phút đọc',
  },
  {
    slug: 'an-toan-khi-di-xe-ghep-nhung-dieu-can-luu-y',
    title: 'An toàn khi đi xe ghép - 10 điều cần lưu ý',
    excerpt: 'Đảm bảo an toàn là ưu tiên hàng đầu khi tham gia xe ghép. Tìm hiểu những lưu ý quan trọng để có chuyến đi an toàn và thoải mái.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-9.jpg',
    category: 'An toàn',
    date: '2025-01-05',
    author: 'SanXeGhep',
    readTime: '6 phút đọc',
  },
  {
    slug: 'tuyen-duong-xe-ghep-pho-bien-ha-noi-hai-phong',
    title: 'Top 5 tuyến đường xe ghép phổ biến Hà Nội - Hải Phòng',
    excerpt: 'Tuyến Hà Nội - Hải Phòng là một trong những tuyến xe ghép sôi động nhất miền Bắc. Khám phá các tuyến đường, giá cả và kinh nghiệm đi xe ghép trên tuyến này.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-17.jpg',
    category: 'Tuyến đường',
    date: '2025-01-12',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
  },
  {
    slug: 'lam-tai-xe-xe-ghep-thu-nhap-them-hap-dan',
    title: 'Làm tài xế xe ghép - Thu nhập thêm hấp dẫn 2025',
    excerpt: 'Tận dụng chuyến đi hàng ngày để kiếm thêm thu nhập. Tìm hiểu cách trở thành tài xế xe ghép và tối ưu hóa lợi nhuận từ việc chia sẻ chuyến đi.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-15.jpg',
    category: 'Tài xế',
    date: '2025-01-08',
    author: 'SanXeGhep',
    readTime: '7 phút đọc',
  },
  {
    slug: 'xe-ghep-va-moi-truong-giam-khi-thai-carbon',
    title: 'Xe ghép và môi trường: Giảm 40% khí thải carbon',
    excerpt: 'Đi xe ghép không chỉ tiết kiệm chi phí mà còn góp phần bảo vệ môi trường. Tìm hiểu tác động tích cực của xe ghép đến môi trường Việt Nam.',
    image: 'https://danviet.ex-cdn.com/files/f1/296231569849192448/2024/2/14/xe-ghep-xe-tien-chuyen-17079120483251974896436.jpeg',
    category: 'Môi trường',
    date: '2025-01-03',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog & Tin tức
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Cập nhật kiến thức, kinh nghiệm và xu hướng mới nhất về xe ghép, đi chung xe tại Việt Nam
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{post.author}</span>
                      </div>
                      <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Bắt đầu tiết kiệm chi phí di chuyển ngay hôm nay
            </h2>
            <p className="text-muted-foreground mb-8">
              Tham gia cộng đồng xe ghép lớn nhất Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/tim-chuyen"
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Tìm chuyến xe
              </Link>
              <Link 
                href="/dang-chuyen"
                className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                Đăng chuyến đi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
