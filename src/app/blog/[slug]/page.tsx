import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Clock, Tag, DollarSign, MapPin, Zap, Users, Leaf, Car, Phone, Mail, CheckCircle, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: ReactNode
  image: string
  category: string
  date: string
  author: string
  readTime: string
  keywords: string[]
}

// Related posts sidebar
const relatedPosts = [
  {
    slug: 'xe-ghep-la-gi-loi-ich-khi-di-xe-ghep',
    title: 'Xe ghép là gì? 7 lợi ích tuyệt vời',
    category: 'Hướng dẫn',
  },
  {
    slug: 'cach-tiet-kiem-chi-phi-di-chuyen-bang-xe-ghep',
    title: 'Cách tiết kiệm 50% chi phí',
    category: 'Tiết kiệm',
  },
  {
    slug: 'an-toan-khi-di-xe-ghep-nhung-dieu-can-luu-y',
    title: 'An toàn khi đi xe ghép',
    category: 'An toàn',
  },
]

const blogPosts: Record<string, BlogPost> = {
  'xe-ghep-la-gi-loi-ich-khi-di-xe-ghep': {
    slug: 'xe-ghep-la-gi-loi-ich-khi-di-xe-ghep',
    title: 'Xe ghép là gì? 7 lợi ích tuyệt vời khi đi xe ghép bạn nên biết',
    excerpt: 'Xe ghép hay đi chung xe đang trở thành xu hướng di chuyển thông minh, tiết kiệm và thân thiện với môi trường.',
    image: 'https://aloifood.com/wp-content/uploads/2025/06/xe-ghep-la-gi.webp',
    category: 'Hướng dẫn',
    date: '2025-01-15',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
    keywords: ['xe ghép', 'đi chung xe', 'chia sẻ chi phí', 'tiết kiệm'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">Xe ghép là gì?</h2>
        <p className="text-lg leading-relaxed">
          <strong>Xe ghép</strong> (hay còn gọi là <strong>đi chung xe</strong>, <strong>carpooling</strong>) là hình thức di chuyển mà nhiều người cùng đi chung một chiếc xe trên cùng tuyến đường, chia sẻ chi phí xăng dầu, phí đường, và các chi phí phát sinh khác.
        </p>
        <p className="text-lg leading-relaxed">
          Tại Việt Nam, xe ghép đang ngày càng phổ biến, đặc biệt là các tuyến đường liên tỉnh như Hà Nội - Hải Phòng, TP.HCM - Vũng Tàu, Hà Nội - Hạ Long...
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">7 lợi ích tuyệt vời khi đi xe ghép</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-3">1. Tiết kiệm chi phí đáng kể</h3>
            <p className="text-lg leading-relaxed mb-4">
              Đây là lợi ích lớn nhất của xe ghép. Thay vì một người gánh toàn bộ chi phí xăng, phí đường, bạn chỉ cần trả một phần nhỏ khi chia sẻ với những người khác.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold mb-2">Ví dụ: Chuyến Hà Nội - Hải Phòng (120km)</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Chi phí tự lái: ~300.000đ (xăng + phí đường)</li>
                <li>Chi phí xe ghép: ~100.000đ/người (tiết kiệm 200.000đ)</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">2. Giảm ùn tắc giao thông</h3>
            <p className="text-lg leading-relaxed">
              Càng nhiều người đi chung xe, càng ít xe trên đường. Điều này giúp giảm tình trạng ùn tắc, đặc biệt vào giờ cao điểm.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">3. Bảo vệ môi trường</h3>
            <p className="text-lg leading-relaxed">
              Mỗi chuyến xe ghép giúp giảm lượng khí thải CO2 ra môi trường. Theo nghiên cứu, xe ghép có thể giảm tới 40% lượng khí thải so với việc mỗi người lái xe riêng.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">4. Tăng cơ hội kết nối</h3>
            <p className="text-lg leading-relaxed">
              Đi xe ghép là cơ hội tuyệt vời để gặp gỡ, trò chuyện và mở rộng mạng lưới quan hệ. Nhiều người đã tìm được bạn bè, đối tác kinh doanh từ những chuyến xe ghép.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">5. An toàn hơn khi đi đường dài</h3>
            <p className="text-lg leading-relaxed">
              Khi đi chung, tài xế sẽ tỉnh táo hơn nhờ có người trò chuyện. Hành khách cũng có thể hỗ trợ quan sát đường, nhắc nhở tài xế khi cần.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">6. Linh hoạt về thời gian</h3>
            <p className="text-lg leading-relaxed">
              Khác với xe khách có giờ cố định, xe ghép thường linh hoạt hơn về thời gian xuất phát và điểm đón/trả.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">7. Tận dụng tối đa chỗ trống</h3>
            <p className="text-lg leading-relaxed">
              Nếu bạn là tài xế và vẫn phải đi dù thế nào, tại sao không tận dụng chỗ trống để kiếm thêm thu nhập và giúp đỡ người khác?
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Làm thế nào để bắt đầu đi xe ghép?</h2>
        <ol className="list-decimal list-inside space-y-2 text-lg">
          <li><strong>Đăng ký tài khoản</strong> trên SanXeGhep.vn</li>
          <li><strong>Tìm chuyến xe</strong> phù hợp với lộ trình của bạn</li>
          <li><strong>Liên hệ tài xế</strong> để thỏa thuận chi tiết</li>
          <li><strong>Đi chung và chia sẻ chi phí</strong></li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-4">Lưu ý khi đi xe ghép</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Luôn xác minh thông tin tài xế/hành khách</li>
          <li>Thỏa thuận rõ ràng về giá cả trước khi đi</li>
          <li>Đúng giờ hẹn</li>
          <li>Tôn trọng không gian chung</li>
          <li>Giữ liên lạc với người thân</li>
        </ul>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-3">Kết luận</h2>
          <p className="text-lg leading-relaxed">
            Xe ghép không chỉ giúp tiết kiệm chi phí mà còn mang lại nhiều lợi ích cho cá nhân và cộng đồng. Hãy thử trải nghiệm và cảm nhận sự khác biệt!
          </p>
        </div>
      </div>
    ),
  },
  'cach-tiet-kiem-chi-phi-di-chuyen-bang-xe-ghep': {
    slug: 'cach-tiet-kiem-chi-phi-di-chuyen-bang-xe-ghep',
    title: 'Cách tiết kiệm 50% chi phí di chuyển bằng xe ghép',
    excerpt: 'Chia sẻ chi phí xăng, phí đường khi đi xe ghép giúp bạn tiết kiệm đáng kể.',
    image: 'https://otogiadinh.top/wp-content/uploads/2022/11/taxi-gia-dinh.jpg',
    category: 'Tiết kiệm',
    date: '2025-01-10',
    author: 'SanXeGhep',
    readTime: '4 phút đọc',
    keywords: ['tiết kiệm', 'chi phí', 'xe ghép', 'chia sẻ'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">Cách tiết kiệm 50% chi phí di chuyển bằng xe ghép</h2>
        <p className="text-lg leading-relaxed">
          Trong bối cảnh giá xăng dầu ngày càng tăng cao, việc tìm kiếm giải pháp di chuyển tiết kiệm là mối quan tâm của nhiều người. <strong>Xe ghép</strong> chính là câu trả lời hoàn hảo!
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Tại sao xe ghép giúp tiết kiệm?</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-3">1. Chia sẻ chi phí xăng dầu</h3>
            <p className="text-lg leading-relaxed mb-4">
              Đây là khoản tiết kiệm lớn nhất. Thay vì một người gánh toàn bộ, 4 người đi chung sẽ chỉ mất 1/4 chi phí.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="font-semibold mb-2">Ví dụ thực tế: Tuyến Hà Nội - Hải Phòng (120km)</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Xăng: 200.000đ</li>
                <li>Phí đường: 100.000đ</li>
                <li><strong>Tổng: 300.000đ</strong></li>
                <li className="text-green-700 font-bold">Chia 4 người: 75.000đ/người (tiết kiệm 225.000đ)</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">2. Chia sẻ phí đường, cầu đường</h3>
            <p className="text-lg leading-relaxed">
              Các tuyến đường cao tốc thường có phí khá cao. Khi đi chung, chi phí này được chia đều cho mọi người.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">3. Giảm chi phí bảo dưỡng xe</h3>
            <p className="text-lg leading-relaxed">
              Với tài xế, việc có thêm hành khách chia sẻ chi phí giúp bù đắp một phần chi phí bảo dưỡng, khấu hao xe.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">So sánh chi phí các phương tiện</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Phương tiện</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Hà Nội - Hải Phòng</th>
                <th className="border border-gray-300 px-4 py-2 text-left">TP.HCM - Vũng Tàu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Xe khách</td>
                <td className="border border-gray-300 px-4 py-2">120.000đ</td>
                <td className="border border-gray-300 px-4 py-2">150.000đ</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Taxi</td>
                <td className="border border-gray-300 px-4 py-2">1.500.000đ</td>
                <td className="border border-gray-300 px-4 py-2">1.200.000đ</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Tự lái</td>
                <td className="border border-gray-300 px-4 py-2">300.000đ</td>
                <td className="border border-gray-300 px-4 py-2">260.000đ</td>
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="border border-gray-300 px-4 py-2">Xe ghép</td>
                <td className="border border-gray-300 px-4 py-2 text-green-700">75.000đ</td>
                <td className="border border-gray-300 px-4 py-2 text-green-700">87.000đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Mẹo tiết kiệm tối đa</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">💡 Đi đúng giờ cao điểm</h4>
            <p className="text-sm">Nhiều tài xế đăng chuyến vào sáng sớm, chiều tối. Dễ tìm và giá tốt!</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">📅 Đặt chuyến trước</h4>
            <p className="text-sm">Đặt trước 1-2 ngày thường có giá tốt hơn đặt gấp.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">🔄 Đi cố định theo lịch</h4>
            <p className="text-sm">Tìm nhóm đi chung cố định để có giá ưu đãi.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">⏰ Linh hoạt thời gian</h4>
            <p className="text-sm">Chọn khung giờ ít người để có nhiều lựa chọn.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-3">Kết luận</h2>
          <p className="text-lg leading-relaxed">
            Xe ghép không chỉ giúp bạn tiết kiệm 50% chi phí di chuyển mà còn mang lại nhiều lợi ích khác. Hãy thử ngay hôm nay!
          </p>
        </div>
      </div>
    ),
  },
  'an-toan-khi-di-xe-ghep-nhung-dieu-can-luu-y': {
    slug: 'an-toan-khi-di-xe-ghep-nhung-dieu-can-luu-y',
    title: 'An toàn khi đi xe ghép - 10 điều cần lưu ý',
    excerpt: 'Đảm bảo an toàn là ưu tiên hàng đầu khi tham gia xe ghép.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-9.jpg',
    category: 'An toàn',
    date: '2025-01-05',
    author: 'SanXeGhep',
    readTime: '6 phút đọc',
    keywords: ['an toàn', 'xe ghép', 'lưu ý', 'bảo mật'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">An toàn khi đi xe ghép - 10 điều cần lưu ý</h2>
        <p className="text-lg leading-relaxed">
          An toàn luôn là ưu tiên hàng đầu khi tham gia xe ghép. Dưới đây là 10 điều quan trọng bạn cần lưu ý để có chuyến đi an toàn và thoải mái.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">10 điều cần lưu ý về an toàn</h2>

        <div className="space-y-6">
          {[
            {
              title: '1. Xác minh thông tin tài xế/hành khách',
              items: ['Kiểm tra số điện thoại, tên đầy đủ', 'Xem đánh giá từ chuyến đi trước', 'Yêu cầu xem CMND/CCCD nếu cần', 'Kiểm tra biển số xe trước khi lên']
            },
            {
              title: '2. Chia sẻ thông tin chuyến đi',
              items: ['Thông tin tài xế (tên, SĐT, biển số)', 'Thời gian xuất phát và dự kiến đến', 'Lộ trình di chuyển', 'Cập nhật vị trí định kỳ']
            },
            {
              title: '3. Gặp mặt tại nơi công cộng',
              items: ['Chọn điểm đón/trả tại nơi đông người', 'Tránh khu vực vắng vẻ, tối tăm', 'Ưu tiên bến xe, trạm xăng, siêu thị']
            },
            {
              title: '4. Tin tưởng trực giác của bạn',
              items: ['Từ chối lên xe nếu cảm thấy không an toàn', 'Yêu cầu dừng xe và xuống', 'Gọi điện cho người thân', 'Liên hệ cơ quan chức năng nếu cần']
            },
            {
              title: '5. Không chia sẻ thông tin nhạy cảm',
              items: ['Không tiết lộ địa chỉ nhà chính xác', 'Không nói về tài sản, thu nhập', 'Giữ kín thông tin ngân hàng', 'Cẩn thận với câu hỏi riêng tư']
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border-l-4 border-primary p-4 rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <ul className="list-disc list-inside space-y-1">
                {item.items.map((subItem, subIdx) => (
                  <li key={subIdx}>{subItem}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mt-8">
          <h3 className="text-xl font-bold mb-3 text-red-800">⚠️ Hành vi nghiêm cấm</h3>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            <li>Tài xế/hành khách có hành vi quấy rối</li>
            <li>Yêu cầu trả tiền cao hơn thỏa thuận</li>
            <li>Lái xe nguy hiểm, vi phạm luật</li>
            <li>Đi sai lộ trình không báo trước</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Quy tắc vàng khi đi xe ghép</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-bold">🛡️ Luôn cảnh giác</p>
            <p className="text-sm mt-1">Nhưng không quá lo lắng</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-bold">💭 Tin tưởng trực giác</p>
            <p className="text-sm mt-1">Của bạn</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-bold">📱 Chia sẻ thông tin</p>
            <p className="text-sm mt-1">Với người thân</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-bold">🤝 Tôn trọng</p>
            <p className="text-sm mt-1">Tài xế và hành khách</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-3">Kết luận</h2>
          <p className="text-lg leading-relaxed">
            An toàn là trách nhiệm của cả tài xế và hành khách. Hãy luôn cảnh giác, tôn trọng và hỗ trợ lẫn nhau để có những chuyến đi an toàn và vui vẻ.
          </p>
        </div>
      </div>
    ),
  },
  'tuyen-duong-xe-ghep-pho-bien-ha-noi-hai-phong': {
    slug: 'tuyen-duong-xe-ghep-pho-bien-ha-noi-hai-phong',
    title: 'Top 5 tuyến đường xe ghép phổ biến Hà Nội - Hải Phòng',
    excerpt: 'Tuyến Hà Nội - Hải Phòng là một trong những tuyến xe ghép sôi động nhất miền Bắc.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-17.jpg',
    category: 'Tuyến đường',
    date: '2025-01-12',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
    keywords: ['Hà Nội', 'Hải Phòng', 'tuyến đường', 'xe ghép'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">Top 5 tuyến đường xe ghép phổ biến Hà Nội - Hải Phòng</h2>
        <p className="text-lg leading-relaxed">
          Tuyến Hà Nội - Hải Phòng (120km) là một trong những tuyến xe ghép sôi động nhất miền Bắc với hàng trăm chuyến mỗi ngày. Cùng khám phá các tuyến đường phổ biến nhất!
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-blue-600" size={20} />
            <p className="font-semibold">Khoảng cách: 120km</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600" size={20} />
            <p className="font-semibold">Thời gian: 1.5 - 2 giờ</p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="text-blue-600" size={20} />
            <p className="font-semibold">Chi phí xe ghép: 70.000đ - 100.000đ/người</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">5 tuyến đường phổ biến</h2>

        <div className="space-y-6">
          <div className="bg-white border-2 border-primary/20 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3 text-primary">1. Cao tốc Hà Nội - Hải Phòng (Tuyến chính)</h3>
            <p className="text-lg mb-3">Tuyến cao tốc hiện đại nhất, nhanh nhất và an toàn nhất.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ưu điểm:</strong> Nhanh, an toàn, ít tắc đường</li>
              <li><strong>Nhược điểm:</strong> Phí đường cao (100.000đ)</li>
              <li><strong>Thời gian:</strong> 1.5 giờ</li>
              <li><strong>Phù hợp:</strong> Người cần đi gấp, đi công tác</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">2. Quốc lộ 5 (Tuyến cũ)</h3>
            <p className="text-lg mb-3">Tuyến đường truyền thống, đi qua nhiều thị trấn.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ưu điểm:</strong> Không phí đường, dễ đón/trả khách</li>
              <li><strong>Nhược điểm:</strong> Chậm hơn, nhiều đèn đỏ</li>
              <li><strong>Thời gian:</strong> 2.5 - 3 giờ</li>
              <li><strong>Phù hợp:</strong> Người muốn tiết kiệm, không gấp</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">3. Hà Nội - Hưng Yên - Hải Phòng</h3>
            <p className="text-lg mb-3">Tuyến kết hợp, đi qua Hưng Yên.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ưu điểm:</strong> Linh hoạt, nhiều điểm dừng</li>
              <li><strong>Thời gian:</strong> 2 - 2.5 giờ</li>
              <li><strong>Phù hợp:</strong> Người ở Hưng Yên, muốn ghé thăm</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">4. Hà Nội - Hải Dương - Hải Phòng</h3>
            <p className="text-lg mb-3">Tuyến đi qua Hải Dương, phù hợp ghép khách.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ưu điểm:</strong> Nhiều khách, dễ ghép đầy xe</li>
              <li><strong>Thời gian:</strong> 2 - 2.5 giờ</li>
              <li><strong>Phù hợp:</strong> Tài xế muốn tối ưu lợi nhuận</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">5. Tuyến kết hợp (Cao tốc + QL5)</h3>
            <p className="text-lg mb-3">Đi cao tốc một đoạn, xuống QL5 để đón/trả khách.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ưu điểm:</strong> Cân bằng giữa tốc độ và chi phí</li>
              <li><strong>Thời gian:</strong> 2 giờ</li>
              <li><strong>Phù hợp:</strong> Đa số người đi xe ghép</li>
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Mẹo chọn tuyến đường</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
            <Zap className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Đi gấp?</h4>
              <p className="text-sm">Chọn cao tốc, chấp nhận phí cao hơn</p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
            <DollarSign className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Tiết kiệm?</h4>
              <p className="text-sm">Chọn QL5, thời gian dài hơn nhưng rẻ</p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
            <Car className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Là tài xế?</h4>
              <p className="text-sm">Tuyến kết hợp để dễ đón/trả khách</p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
            <Clock className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Giờ cao điểm?</h4>
              <p className="text-sm">Ưu tiên cao tốc để tránh tắc đường</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-3">Kết luận</h2>
          <p className="text-lg leading-relaxed">
            Mỗi tuyến đường có ưu nhược điểm riêng. Hãy chọn tuyến phù hợp với nhu cầu và thời gian của bạn!
          </p>
        </div>
      </div>
    ),
  },
  'lam-tai-xe-xe-ghep-thu-nhap-them-hap-dan': {
    slug: 'lam-tai-xe-xe-ghep-thu-nhap-them-hap-dan',
    title: 'Làm tài xế xe ghép - Thu nhập thêm hấp dẫn 2025',
    excerpt: 'Tận dụng chuyến đi hàng ngày để kiếm thêm thu nhập.',
    image: 'https://xetienchuyencantho.com/wp-content/uploads/2024/09/xe-ghep-la-gi-15.jpg',
    category: 'Tài xế',
    date: '2025-01-08',
    author: 'SanXeGhep',
    readTime: '7 phút đọc',
    keywords: ['tài xế', 'thu nhập', 'kiếm tiền', 'xe ghép'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">Làm tài xế xe ghép - Thu nhập thêm hấp dẫn 2025</h2>
        <p className="text-lg leading-relaxed">
          Bạn đang đi làm hàng ngày và có xe riêng? Tại sao không tận dụng chỗ trống để kiếm thêm thu nhập từ xe ghép? Đây là cơ hội tuyệt vời để tối ưu chi phí và tăng thu nhập!
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="text-xl font-bold">Thu nhập ước tính</h3>
          </div>
          <ul className="space-y-2">
            <li><strong>Tuyến ngắn (30-50km):</strong> 3-5 triệu/tháng</li>
            <li><strong>Tuyến trung (50-100km):</strong> 5-10 triệu/tháng</li>
            <li><strong>Tuyến dài (100km+):</strong> 10-20 triệu/tháng</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Tại sao nên làm tài xế xe ghép?</h2>

        <div className="space-y-6">
          <div className="bg-white border-l-4 border-primary p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">1. Tận dụng chuyến đi sẵn có</h3>
            <p className="text-lg">
              Bạn vẫn phải đi làm hàng ngày. Tại sao không chia sẻ chỗ trống để có thêm thu nhập và giảm chi phí xăng?
            </p>
          </div>

          <div className="bg-white border-l-4 border-primary p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">2. Linh hoạt thời gian</h3>
            <p className="text-lg">
              Bạn quyết định khi nào đi, đón khách ở đâu. Không bị ràng buộc như taxi hay Grab.
            </p>
          </div>

          <div className="bg-white border-l-4 border-primary p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">3. Không cần đầu tư thêm</h3>
            <p className="text-lg">
              Chỉ cần xe đang dùng, không cần mua xe mới hay đầu tư thiết bị đắt tiền.
            </p>
          </div>

          <div className="bg-white border-l-4 border-primary p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">4. Mở rộng mạng lưới</h3>
            <p className="text-lg">
              Gặp gỡ nhiều người mới, có thể tìm được khách hàng, đối tác kinh doanh.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Cách tính thu nhập</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Ví dụ: Tuyến Hà Nội - Hải Phòng</h3>
          <div className="space-y-2">
            <p><strong>Chi phí 1 chuyến:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Xăng: 200.000đ</li>
              <li>Phí đường: 100.000đ</li>
              <li>Tổng: 300.000đ</li>
            </ul>
            <p className="mt-4"><strong>Thu nhập:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Chở 3 khách x 100.000đ = 300.000đ</li>
              <li>Lợi nhuận = 300.000đ (chi phí được bù đắp hoàn toàn)</li>
            </ul>
            <p className="mt-4 text-green-700 font-bold">
              → Đi 20 chuyến/tháng = Tiết kiệm 6 triệu đồng chi phí xăng!
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Bắt đầu như thế nào?</h2>
        <ol className="list-decimal list-inside space-y-3 text-lg">
          <li><strong>Đăng ký tài khoản</strong> tài xế trên SanXeGhep.vn</li>
          <li><strong>Cung cấp thông tin xe:</strong> Biển số, loại xe, số chỗ</li>
          <li><strong>Đăng lịch trình:</strong> Tuyến đường, giờ đi thường xuyên</li>
          <li><strong>Nhận khách và đi:</strong> Hệ thống sẽ kết nối khách phù hợp</li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-4">Mẹo tăng thu nhập</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
            <Calendar className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Đi đều đặn</h4>
              <p className="text-sm">Khách quen sẽ đặt cố định, thu nhập ổn định</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
            <Star className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Dịch vụ tốt</h4>
              <p className="text-sm">Đúng giờ, lịch sự → Đánh giá cao → Nhiều khách hơn</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
            <Car className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Xe sạch sẽ</h4>
              <p className="text-sm">Khách thích xe sạch, thoải mái</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
            <Users className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold mb-1">Thân thiện</h4>
              <p className="text-sm">Tạo không khí vui vẻ, khách sẽ quay lại</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mt-12">
          <h2 className="text-2xl font-bold mb-3">Kết luận</h2>
          <p className="text-lg leading-relaxed">
            Làm tài xế xe ghép là cách tuyệt vời để tối ưu chi phí và tăng thu nhập. Bắt đầu ngay hôm nay để tận dụng cơ hội này!
          </p>
        </div>
      </div>
    ),
  },
  'xe-ghep-va-moi-truong-giam-khi-thai-carbon': {
    slug: 'xe-ghep-va-moi-truong-giam-khi-thai-carbon',
    title: 'Xe ghép và môi trường: Giảm 40% khí thải carbon',
    excerpt: 'Đi xe ghép không chỉ tiết kiệm chi phí mà còn góp phần bảo vệ môi trường.',
    image: 'https://danviet.ex-cdn.com/files/f1/296231569849192448/2024/2/14/xe-ghep-xe-tien-chuyen-17079120483251974896436.jpeg',
    category: 'Môi trường',
    date: '2025-01-03',
    author: 'SanXeGhep',
    readTime: '5 phút đọc',
    keywords: ['môi trường', 'khí thải', 'carbon', 'xe ghép', 'xanh'],
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mt-8 mb-4">Xe ghép và môi trường: Giảm 40% khí thải carbon</h2>
        <p className="text-lg leading-relaxed">
          Trong bối cảnh biến đổi khí hậu ngày càng nghiêm trọng, mỗi hành động nhỏ đều có ý nghĩa. <strong>Xe ghép</strong> không chỉ giúp tiết kiệm chi phí mà còn là giải pháp xanh cho môi trường!
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="text-green-600" size={24} />
            <h3 className="text-xl font-bold text-green-800">Tác động tích cực</h3>
          </div>
          <ul className="space-y-2 text-green-700">
            <li className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span><strong>Giảm 40%</strong> lượng khí thải CO2</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span><strong>Giảm 50%</strong> số xe trên đường</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span><strong>Tiết kiệm</strong> hàng triệu lít xăng mỗi năm</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span><strong>Giảm</strong> ùn tắc giao thông</span>
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Tại sao xe ghép tốt cho môi trường?</h2>

        <div className="space-y-6">
          <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">1. Giảm lượng xe trên đường</h3>
            <p className="text-lg mb-3">
              Thay vì 4 người lái 4 xe riêng, chỉ cần 1 xe chở 4 người. Điều này giảm 75% số xe trên đường!
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold">Ví dụ thực tế:</p>
              <p>Tuyến Hà Nội - Hải Phòng có ~1000 xe/ngày</p>
              <p>Nếu 50% đi xe ghép → Chỉ còn 500 xe</p>
              <p className="text-green-700 font-bold">→ Giảm 500 xe = Giảm hàng tấn CO2!</p>
            </div>
          </div>

          <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">2. Tiết kiệm nhiên liệu</h3>
            <p className="text-lg">
              Mỗi lít xăng đốt cháy thải ra ~2.3kg CO2. Khi chia sẻ xe, lượng xăng tiêu thụ giảm đáng kể.
            </p>
          </div>

          <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">3. Giảm ùn tắc</h3>
            <p className="text-lg">
              Ít xe hơn = Ít tắc đường hơn = Xe chạy nhanh hơn = Tiêu thụ ít xăng hơn = Ít khí thải hơn!
            </p>
          </div>

          <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow-sm">
            <h3 className="text-xl font-bold mb-3">4. Giảm nhu cầu xây đường</h3>
            <p className="text-lg">
              Ít xe → Không cần mở rộng đường → Bảo vệ cây xanh và đất đai.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Con số ấn tượng</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
            <p className="text-lg">Giảm khí thải CO2</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">50%</div>
            <p className="text-lg">Giảm số xe trên đường</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">30%</div>
            <p className="text-lg">Giảm ùn tắc giao thông</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
            <p className="text-lg">Tấn CO2 tiết kiệm/năm</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4">Bạn có thể làm gì?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white p-4 rounded-lg border">
            <Car className="text-primary flex-shrink-0" size={32} />
            <div>
              <h4 className="font-bold mb-1">Tham gia xe ghép</h4>
              <p className="text-sm text-muted-foreground">Thay vì tự lái, hãy tìm xe ghép hoặc chia sẻ chỗ trống</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 rounded-lg border">
            <Users className="text-primary flex-shrink-0" size={32} />
            <div>
              <h4 className="font-bold mb-1">Chia sẻ với bạn bè</h4>
              <p className="text-sm text-muted-foreground">Lan tỏa thông điệp xe ghép xanh đến mọi người</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 rounded-lg border">
            <Leaf className="text-primary flex-shrink-0" size={32} />
            <div>
              <h4 className="font-bold mb-1">Thay đổi thói quen</h4>
              <p className="text-sm text-muted-foreground">Mỗi chuyến xe ghép là một đóng góp cho môi trường</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 rounded-xl mt-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf size={40} />
            <h2 className="text-3xl font-bold">Cùng nhau bảo vệ hành tinh xanh!</h2>
          </div>
          <p className="text-lg mb-6">
            Mỗi chuyến xe ghép là một bước nhỏ, nhưng khi hàng triệu người cùng làm, chúng ta sẽ tạo ra sự thay đổi lớn!
          </p>
          <p className="text-xl font-bold">
            Hãy bắt đầu từ hôm nay!
          </p>
        </div>
      </div>
    ),
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]
  
  if (!post) {
    return {
      title: 'Bài viết không tồn tại | SanXeGhep.vn',
      description: 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
    }
  }

  const siteUrl = 'https://sanxeghep.vn'
  const postUrl = `${siteUrl}/blog/${slug}`

  return {
    title: `${post.title} | SanXeGhep.vn`,
    description: post.excerpt,
    keywords: post.keywords.join(', '),
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: 'SanXeGhep.vn',
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'SanXeGhep.vn',
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'vi_VN',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
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
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  const otherPosts = relatedPosts.filter(p => p.slug !== slug)

  const siteUrl = 'https://sanxeghep.vn'
  const postUrl = `${siteUrl}/blog/${slug}`

  // Structured Data (JSON-LD) cho SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SanXeGhep.vn',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    inLanguage: 'vi-VN',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft size={16} />
            <span>Quay lại Blog</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Left: Article Content */}
          <article className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {post.content}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={18} className="text-muted-foreground" />
                {post.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-center">
              <h3 className="text-2xl font-bold mb-3">
                Sẵn sàng bắt đầu tiết kiệm?
              </h3>
              <p className="mb-6 text-white/90">
                Tìm chuyến xe ghép phù hợp hoặc đăng chuyến đi ngay hôm nay
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/tim-chuyen" className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Tìm chuyến xe
                </Link>
                <Link href="/dang-chuyen" className="px-6 py-3 bg-white/10 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/20 transition-colors">
                  Đăng chuyến đi
                </Link>
              </div>
            </div>
          </article>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            {/* Related Posts */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Bài viết liên quan</h3>
              <div className="space-y-4">
                {otherPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.slug} 
                    href={`/blog/${relatedPost.slug}`}
                    className="block group"
                  >
                    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-xs text-primary font-semibold">{relatedPost.category}</span>
                      <h4 className="font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
              <div className="space-y-2">
                <Link href="/tim-chuyen" className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <MapPin size={18} className="text-primary" />
                  <span>Tìm chuyến xe</span>
                </Link>
                <Link href="/dang-chuyen" className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <Car size={18} className="text-primary" />
                  <span>Đăng chuyến đi</span>
                </Link>
                <Link href="/tai-xe" className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <Users size={18} className="text-primary" />
                  <span>Trở thành tài xế</span>
                </Link>
                <Link href="/lien-he" className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <Phone size={18} className="text-primary" />
                  <span>Liên hệ hỗ trợ</span>
                </Link>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 bg-primary text-white">
              <h3 className="text-lg font-bold mb-4">Hỗ trợ 24/7</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <div>
                    <p className="font-semibold mb-1">Hotline</p>
                    <a href="tel:0857994994" className="text-white/90 hover:text-white">
                      0857 994 994
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <a href="mailto:support@sanxeghep.vn" className="text-white/90 hover:text-white">
                      support@sanxeghep.vn
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
