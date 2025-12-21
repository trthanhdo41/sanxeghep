import { Target, Users, Shield, Zap, Heart, TrendingUp } from 'lucide-react'

export default function VeChungToiPage() {
  const values = [
    {
      icon: Shield,
      title: 'An toàn & Uy tín',
      description: 'Xác minh tài xế, đánh giá minh bạch, bảo vệ quyền lợi người dùng',
    },
    {
      icon: Zap,
      title: 'Nhanh chóng & Tiện lợi',
      description: 'Kết nối tức thì, tìm chuyến dễ dàng, liên hệ trực tiếp',
    },
    {
      icon: Heart,
      title: 'Miễn phí 100%',
      description: 'Không thu phí trung gian, tài xế và khách tự thỏa thuận',
    },
    {
      icon: TrendingUp,
      title: 'Phát triển bền vững',
      description: 'Giảm chi phí đi lại, bảo vệ môi trường, kết nối cộng đồng',
    },
  ]

  const stats = [
    { number: '12.400+', label: 'Chuyến xe mỗi tháng' },
    { number: '2.500+', label: 'Tài xế hoạt động' },
    { number: '8.000+', label: 'Hành khách tin dùng' },
    { number: '100%', label: 'Miễn phí' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Về Chúng Tôi
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            SanXeGhep - Nền tảng kết nối xe ghép hàng đầu Việt Nam
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Sứ Mệnh</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Kết nối tài xế và hành khách trên toàn quốc, giúp tiết kiệm chi phí đi lại, 
                  tối ưu hóa việc sử dụng phương tiện, và xây dựng cộng đồng chia sẻ chuyến đi 
                  an toàn, tiện lợi, thân thiện với môi trường.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Câu Chuyện</h2>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                SanXeGhep ra đời từ mong muốn giải quyết bài toán chi phí đi lại ngày càng tăng cao 
                và tình trạng lãng phí tài nguyên khi nhiều xe chạy với ghế trống.
              </p>
              <p>
                Chúng tôi tin rằng, bằng cách kết nối những người có cùng hành trình, chúng ta không chỉ 
                giúp tiết kiệm chi phí mà còn góp phần bảo vệ môi trường và xây dựng một cộng đồng 
                chia sẻ văn minh, hiện đại.
              </p>
              <p>
                Với nền tảng công nghệ hiện đại, giao diện thân thiện và dịch vụ miễn phí 100%, 
                SanXeGhep cam kết mang đến trải nghiệm tốt nhất cho cả tài xế và hành khách.
              </p>
              <p className="font-semibold text-foreground">
                Hãy cùng chúng tôi xây dựng một cộng đồng chia sẻ chuyến đi an toàn, tiện lợi và bền vững!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
