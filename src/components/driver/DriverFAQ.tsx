'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Đăng ký làm tài xế có mất phí không?',
    answer: '100% MIỄN PHÍ! Không thu phí đăng ký, không thu hoa hồng, không có chi phí ẩn. Bạn chỉ cần có bằng lái và phương tiện hợp lệ.',
  },
  {
    question: 'Tôi có thể đăng bao nhiêu chuyến mỗi ngày?',
    answer: 'Tài xế thường: 2-3 chuyến/ngày. Tài xế xác minh (có dấu tích xanh): Không giới hạn khi mua gói tháng.',
  },
  {
    question: 'Làm sao để trở thành tài xế xác minh?',
    answer: 'Upload đầy đủ CCCD, bằng lái xe, đăng ký xe. Admin sẽ xét duyệt trong 24-48h. Tài xế xác minh có dấu tích xanh và được ưu tiên hiển thị.',
  },
  {
    question: 'Tôi nhận tiền từ khách như thế nào?',
    answer: 'Khách trả tiền trực tiếp cho bạn (tiền mặt hoặc chuyển khoản). SanXeGhep KHÔNG trung gian, KHÔNG giữ tiền, KHÔNG chia hoa hồng.',
  },
  {
    question: 'Nếu khách hủy chuyến thì sao?',
    answer: 'Bạn và khách thỏa thuận trực tiếp về chính sách hủy chuyến. Nên thống nhất rõ trước khi nhận khách để tránh hiểu lầm.',
  },
  {
    question: 'Tôi có cần mua bảo hiểm gì không?',
    answer: 'Nên có bảo hiểm xe và bảo hiểm trách nhiệm dân sự. SanXeGhep chỉ là nền tảng kết nối, không cung cấp bảo hiểm.',
  },
  {
    question: 'Làm sao để tăng số lượng khách đặt chuyến?',
    answer: 'Đăng chuyến đều đặn, giá cả hợp lý, mô tả rõ ràng, phản hồi nhanh. Tài xế xác minh được ưu tiên hiển thị và có nhiều khách hơn.',
  },
  {
    question: 'Tôi có thể hủy tài khoản tài xế không?',
    answer: 'Có! Hoàn toàn không ràng buộc. Liên hệ admin qua Zalo 0857994994 để hủy tài khoản bất cứ lúc nào.',
  },
]

export function DriverFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Câu Hỏi Thường Gặp</h2>
        <p className="text-muted-foreground">Giải đáp mọi thắc mắc của bạn</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold pr-4">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-muted-foreground animate-in slide-in-from-top-2">
                <p className="leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
