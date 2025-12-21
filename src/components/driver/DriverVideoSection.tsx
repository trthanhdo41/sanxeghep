'use client'

import { Play } from 'lucide-react'

export function DriverVideoSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Cách Thức Hoạt Động</h2>
        <p className="text-muted-foreground">Xem video 30 giây để hiểu rõ hơn</p>
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 group cursor-pointer hover:border-primary transition-colors">
        {/* Placeholder - Replace with actual video */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl">
            <Play className="w-10 h-10 text-primary ml-1" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Tài xế đăng chuyến → Khách liên hệ → Không mất phí</p>
          <p className="text-sm text-muted-foreground mt-2">Bấm để xem video hướng dẫn</p>
        </div>

        {/* Actual video embed - Uncomment when you have video URL */}
        {/* <iframe
          className="w-full h-full"
          src="YOUR_VIDEO_URL"
          title="SanXeGhep - Hướng dẫn sử dụng"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe> */}
      </div>

      {/* Video Benefits */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-card border border-border rounded-xl">
          <div className="text-2xl font-bold text-primary mb-1">30s</div>
          <p className="text-sm text-muted-foreground">Thời lượng ngắn gọn</p>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-xl">
          <div className="text-2xl font-bold text-primary mb-1">3 bước</div>
          <p className="text-sm text-muted-foreground">Đơn giản dễ hiểu</p>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-xl">
          <div className="text-2xl font-bold text-primary mb-1">100%</div>
          <p className="text-sm text-muted-foreground">Miễn phí sử dụng</p>
        </div>
      </div>
    </div>
  )
}
