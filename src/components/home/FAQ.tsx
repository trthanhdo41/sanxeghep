'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  // Nội dung mẫu - sẽ cập nhật sau
  const faqs = [
    {
      question: 'SanXeGhep là gì?',
      answer: 'SanXeGhep là nền tảng kết nối xe ghép toàn quốc, giúp tài xế và hành khách tìm kiếm nhau dễ dàng. Chúng tôi không thu phí trung gian, hai bên tự thỏa thuận và thanh toán trực tiếp.'
    },
    {
      question: 'Tôi có phải trả phí khi sử dụng không?',
      answer: 'Hoàn toàn miễn phí! SanXeGhep không thu bất kỳ khoản phí nào từ tài xế hay hành khách. Bạn chỉ thanh toán tiền xe trực tiếp cho tài xế theo thỏa thuận.'
    },
    {
      question: 'Làm sao để đăng chuyến đi?',
      answer: 'Rất đơn giản! Đăng nhập vào tài khoản, chọn "Đăng chuyến", điền thông tin điểm đi, điểm đến, thời gian, số ghế trống và giá. Hệ thống sẽ hiển thị chuyến của bạn cho hành khách tìm kiếm.'
    },
    {
      question: 'Tôi có thể hủy chuyến đã đăng không?',
      answer: 'Có, bạn có thể hủy chuyến bất kỳ lúc nào. Tuy nhiên, nếu đã có hành khách đặt chỗ, vui lòng thông báo trước để tránh ảnh hưởng đến uy tín của bạn.'
    },
    {
      question: 'Làm sao để liên hệ với tài xế/hành khách?',
      answer: 'Sau khi tìm thấy chuyến phù hợp, bạn có thể xem số điện thoại hoặc Zalo của tài xế/hành khách để liên hệ trực tiếp và thỏa thuận chi tiết.'
    },
    {
      question: 'Tài xế cần cung cấp giấy tờ gì?',
      answer: 'Để được xác minh, tài xế cần cung cấp: CCCD, bằng lái xe, đăng ký xe, biển số xe và ảnh chân dung. Tài xế đã xác minh sẽ có dấu tích xanh và được ưu tiên hiển thị.'
    },
    {
      question: 'Nếu có tranh chấp thì giải quyết như thế nào?',
      answer: 'Bạn có thể báo cáo qua hệ thống hoặc liên hệ hotline hỗ trợ. Chúng tôi sẽ xem xét và xử lý theo quy định. Tuy nhiên, SanXeGhep chỉ là nền tảng kết nối, hai bên tự chịu trách nhiệm về thỏa thuận của mình.'
    },
    {
      question: 'Tôi có thể đánh giá tài xế/hành khách không?',
      answer: 'Có! Sau mỗi chuyến đi, bạn có thể đánh giá và để lại nhận xét. Điều này giúp xây dựng cộng đồng uy tín và giúp người dùng khác có thêm thông tin tham khảo.'
    }
  ]

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-sm pr-3">{faq.question}</span>
                  <ChevronDown
                    className={`shrink-0 text-primary transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    size={18}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 text-muted-foreground text-sm leading-relaxed border-t pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
      ))}
    </div>
  )
}
