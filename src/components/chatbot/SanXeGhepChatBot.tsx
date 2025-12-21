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

export function SanXeGhepChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Xin chào! Mình là trợ lý ảo của SanXeGhep 😊\n\nBạn cần hỗ trợ về đăng ký tài xế, đăng chuyến hay tìm chuyến đi?',
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase()

    // Đăng ký tài xế
    if (msg.includes('đăng ký') || msg.includes('tài xế') || msg.includes('làm tài xế')) {
      return 'Để đăng ký làm tài xế:\n\n1️⃣ Bấm nút "Đăng ký Tài Xế Miễn Phí" ở trên\n2️⃣ Điền thông tin: Tên, SĐT, loại xe, biển số\n3️⃣ Upload ảnh GPLX và đăng ký xe\n4️⃣ Chờ admin duyệt (24-48h)\n\n✅ 100% miễn phí, không ràng buộc!'
    }

    // Đăng chuyến
    if (msg.includes('đăng chuyến') || msg.includes('post') || msg.includes('chuyến đi')) {
      return 'Để đăng chuyến đi:\n\n📍 Điểm đi → Điểm đến\n📅 Ngày giờ khởi hành\n🚗 Loại xe & số ghế trống\n💰 Giá mỗi ghế\n\n➡️ Vào trang "Đăng Chuyến" để bắt đầu nhé!'
    }

    // Tìm chuyến
    if (msg.includes('tìm') || msg.includes('khách') || msg.includes('hành khách')) {
      return 'Tìm chuyến đi:\n\n🔍 Vào trang "Tìm Chuyến"\n📍 Chọn điểm đi - điểm đến\n📅 Chọn ngày\n\n👥 Xem danh sách chuyến phù hợp và liên hệ tài xế!'
    }

    // Giá cả
    if (msg.includes('giá') || msg.includes('phí') || msg.includes('tiền')) {
      return '💰 Giá cả:\n\n✅ Đăng ký tài xế: MIỄN PHÍ\n✅ Đăng chuyến: MIỄN PHÍ\n✅ Tìm chuyến: MIỄN PHÍ\n✅ Không hoa hồng, không trung gian\n\nTài xế và khách thỏa thuận giá trực tiếp!'
    }

    // Liên hệ
    if (msg.includes('liên hệ') || msg.includes('hỗ trợ') || msg.includes('zalo') || msg.includes('phone')) {
      return '📞 Liên hệ hỗ trợ:\n\n📱 Zalo: 0888889805\n☎️ Hotline: 0888889805\n🌐 Website: sanxeghep.vn\n\nHỗ trợ 24/7! 😊'
    }

    // Yêu cầu tài xế
    if (msg.includes('yêu cầu') || msg.includes('điều kiện') || msg.includes('cần gì')) {
      return 'Yêu cầu tài xế:\n\n✅ Có bằng lái phù hợp\n✅ Phương tiện đảm bảo an toàn\n✅ Tuân thủ luật giao thông\n✅ Ứng xử văn minh\n✅ Không sử dụng rượu bia\n\nĐơn giản vậy thôi! 😊'
    }

    // Default
    return 'Mình có thể giúp bạn về:\n\n🚗 Đăng ký làm tài xế\n📝 Đăng chuyến đi\n🔍 Tìm chuyến\n💰 Giá cả & phí\n📞 Liên hệ hỗ trợ\n\nBạn cần hỗ trợ gì nhỉ? 😊'
  }

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

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(textToSend)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
          isBot: true,
          timestamp: new Date(),
        },
      ])
    }, 800)
  }

  const quickReplies = ['Đăng ký tài xế', 'Đăng chuyến', 'Tìm chuyến', 'Giá cả', 'Liên hệ']

  return (
    <>
      {/* Chat Button with Greeting */}
      <div className="fixed bottom-6 left-6 z-[60] flex items-end gap-3">
        {/* Greeting Bubble */}
        {!isOpen && (
          <div className="animate-in slide-in-from-left-5 duration-500 mb-2">
            <div className="bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[250px] border-2 border-primary/20 relative">
              <p className="text-sm font-medium text-gray-800">Cần hỗ trợ? Chat với mình nhé! 😊</p>
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
        <div className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[550px] bg-background rounded-2xl shadow-2xl border-2 border-primary/20 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
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
                  Trả lời ngay lập tức
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-secondary/5 to-background">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%]`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                      msg.isBot ? 'bg-white border border-gray-200 text-gray-800' : 'bg-gradient-to-br from-primary to-accent text-white'
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
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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
