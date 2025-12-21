'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface Message {
  text: string
  isBot: boolean
  timestamp: Date
}

const greetingMessages = [
  'Cần hỗ trợ? Chat với AI ngay! 😊',
  'Tìm xe ghép nhanh chóng! 🚗',
  'Đăng chuyến miễn phí 100%! ⚡',
  'Có câu hỏi? Hỏi AI ngay! 💬',
  'Hỗ trợ 24/7 - Luôn sẵn sàng! 🌟',
]

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Xin chào! Mình là trợ lý AI của SanXeGhep 😊\n\nBạn cần hỗ trợ gì về đăng chuyến, tìm xe ghép hay đăng ký làm tài xế?',
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Groq API Configuration
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Rotate greeting messages every 5 seconds
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setCurrentGreetingIndex((prev) => (prev + 1) % greetingMessages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isTyping) return

    setInput('')

    const userMsg: Message = {
      text: textToSend,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const systemPrompt = `Bạn là chatbot AI của SanXeGhep - nền tảng kết nối tài xế và hành khách đi chung xe. Nói chuyện thân thiện, tự nhiên và chuyên nghiệp.

THÔNG TIN SANXEGHEP:
- Tên: SanXeGhep (sanxeghep.vn)
- Mô tả: Nền tảng kết nối tài xế và hành khách đi chung xe, chia sẻ chi phí xăng, tối ưu hóa ghế trống
- Đặc điểm: 100% miễn phí, không thu hoa hồng, không trung gian, tài xế và khách tự thương lượng trực tiếp

DỊCH VỤ CHO TÀI XẾ:
- Đăng chuyến đi miễn phí: Tài xế tự đăng lộ trình, thời gian, số ghế trống, giá chia sẻ
- Nhận khách trực tiếp: Khách liên hệ qua SĐT, tài xế và khách tự thỏa thuận
- Không mất phí: Không hoa hồng, không phí duy trì, không ràng buộc
- Tự do linh hoạt: Chạy khi rảnh, tự chủ lịch trình
- Tăng thu nhập: Tận dụng ghế trống, chia sẻ chi phí xăng

DỊCH VỤ CHO HÀNH KHÁCH:
- Tìm xe ghép: Tìm chuyến đi phù hợp theo lộ trình, thời gian
- Đăng nhu cầu: Đăng nhu cầu đi xe, tài xế sẽ liên hệ
- Giá rẻ: Chỉ chia sẻ chi phí xăng, không phải trả thêm phí
- An toàn: Xem thông tin tài xế, đánh giá, số điện thoại trước khi đi

CÁCH THỨC HOẠT ĐỘNG:
1. Tài xế đăng ký tài khoản (miễn phí)
2. Tài xế đăng chuyến đi: Điểm đi, điểm đến, thời gian, số ghế, giá
3. Hành khách tìm chuyến hoặc đăng nhu cầu
4. Khách liên hệ tài xế qua SĐT
5. Tài xế và khách tự thỏa thuận chi tiết
6. Lên xe và đi

YÊU CẦU TÀI XẾ:
- Có bằng lái phù hợp
- Tuân thủ luật giao thông
- Phương tiện đảm bảo an toàn
- Ứng xử văn minh
- Không sử dụng rượu bia khi lái xe

LIÊN HỆ:
- Hotline: 0857994994
- Zalo: 0857994994
- Website: sanxeghep.vn

PHONG CÁCH TRẢ LỜI:
- Trả lời ngắn gọn, rõ ràng (2-3 câu)
- Thân thiện, chuyên nghiệp
- Dùng emoji vừa phải: 😊, 🚗, 🎯, ⚡, ✨ (1-2 emoji)
- Tập trung vào lợi ích: miễn phí, không hoa hồng, tự do
- Luôn kết thúc bằng câu hỏi hoặc gợi ý để tạo tương tác
- Khi khách hỏi về đăng ký: Hướng dẫn đăng ký miễn phí, không mất phí
- Khi khách hỏi về giá: Nhấn mạnh chỉ chia sẻ chi phí xăng, không hoa hồng`

      const conversationHistory = messages
        .slice(1)
        .map((msg) => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text,
        }))

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: textToSend },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const botResponse =
        data.choices[0]?.message?.content ||
        'Xin lỗi, tôi không hiểu. Bạn có thể hỏi lại được không? 😊'

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('API Error:', error)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          text: 'Xin lỗi, có lỗi xảy ra. Vui lòng liên hệ Zalo: 0857994994 để được hỗ trợ! 😊',
          isBot: true,
          timestamp: new Date(),
        },
      ])
    }
  }

  const quickReplies = ['Đăng ký tài xế', 'Tìm xe ghép', 'Đăng chuyến', 'Đăng nhu cầu', 'Liên hệ']

  return (
    <>
      {/* Chat Button - Right Side */}
      <div className="fixed bottom-6 right-6 z-[60] flex items-end gap-3">
        {/* Greeting Bubble */}
        {!isOpen && (
          <div 
            key={currentGreetingIndex}
            className="animate-in fade-in slide-in-from-right-5 duration-500 mb-2"
          >
            <div className="bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[250px] border-2 border-primary/20 relative">
              <p className="text-sm font-medium text-gray-800">
                {greetingMessages[currentGreetingIndex]}
              </p>
              <div className="absolute -right-2 bottom-4 w-4 h-4 bg-white border-r-2 border-b-2 border-primary/20 transform rotate-[-45deg]"></div>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <div className="relative">
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 bg-gradient-to-br from-primary via-accent to-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[550px] bg-background rounded-2xl shadow-2xl border-2 border-primary/20 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="relative p-4 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50 p-2">
                  <Image src="/logo.png" alt="SanXeGhep" width={40} height={40} className="object-contain" />
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base flex items-center gap-2">
                  SanXeGhep Assistant
                  <Sparkles className="h-4 w-4" />
                </h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Trả lời trong 1 giây
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-secondary/5 to-background">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}
              >
                <div className={`max-w-[85%]`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                      msg.isBot
                        ? 'bg-white border border-gray-200 text-gray-800'
                        : 'bg-gradient-to-br from-primary to-accent text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-2">
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {quickReplies.map((reply, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="text-xs whitespace-nowrap border-primary/30 hover:bg-primary hover:text-white hover:border-primary transition-colors flex-shrink-0"
                  onClick={() => handleSend(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border-2 focus:border-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
