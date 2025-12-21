'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function LienHePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          status: 'new'
        })

      if (error) throw error

      toast.success('Gửi tin nhắn thành công!', {
        description: 'Chúng tôi sẽ phản hồi trong vòng 24 giờ',
      })

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error: any) {
      console.error('Error submitting contact form:', error)
      toast.error('Gửi tin nhắn thất bại', {
        description: 'Vui lòng thử lại sau',
      })
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Hotline',
      content: '1900 xxxx',
      description: 'Hỗ trợ 24/7',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@sanxeghep.vn',
      description: 'Phản hồi trong 24h',
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: 'Hà Nội, Việt Nam',
      description: 'Trụ sở chính',
    },
    {
      icon: MessageCircle,
      title: 'Zalo',
      content: '0xxx xxx xxx',
      description: 'Chat trực tiếp',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Thông Tin Liên Hệ</h2>
            <div className="space-y-4 mb-8">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-lg font-medium text-primary mb-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {info.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Bản đồ sẽ được cập nhật</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Gửi Tin Nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên của bạn"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0xxx xxx xxx"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Tiêu đề</Label>
                <Input
                  id="subject"
                  placeholder="Vấn đề cần hỗ trợ"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent"
                disabled={loading}
              >
                {loading ? (
                  'Đang gửi...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi tin nhắn
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
