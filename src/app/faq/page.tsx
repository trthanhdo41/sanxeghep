import { FAQ } from '@/components/home/FAQ'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text leading-tight">
            Câu Hỏi Thường Gặp
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Giải đáp những thắc mắc phổ biến về SanXeGhep
          </p>
        </div>

        {/* FAQ Component */}
        <FAQ />
      </div>
    </div>
  )
}
