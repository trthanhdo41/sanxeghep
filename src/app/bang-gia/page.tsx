import { Car, Users, Bus } from 'lucide-react'

export default function BangGiaPage() {
  const priceData = [
    {
      vehicleType: 'Xe 4 chỗ',
      icon: Car,
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '200.000 - 250.000đ' },
        { from: 'Hà Nội', to: 'Ninh Bình', price: '150.000 - 180.000đ' },
        { from: 'Hà Nội', to: 'Hạ Long', price: '250.000 - 300.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '180.000 - 220.000đ' },
        { from: 'HCM', to: 'Đà Lạt', price: '400.000 - 500.000đ' },
        { from: 'Đà Nẵng', to: 'Hội An', price: '100.000 - 120.000đ' },
      ],
    },
    {
      vehicleType: 'Xe 7 chỗ',
      icon: Users,
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '150.000 - 180.000đ' },
        { from: 'Hà Nội', to: 'Ninh Bình', price: '120.000 - 150.000đ' },
        { from: 'Hà Nội', to: 'Hạ Long', price: '180.000 - 220.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '130.000 - 160.000đ' },
        { from: 'HCM', to: 'Đà Lạt', price: '300.000 - 400.000đ' },
        { from: 'Đà Nẵng', to: 'Hội An', price: '80.000 - 100.000đ' },
      ],
    },
    {
      vehicleType: 'Xe 16 chỗ',
      icon: Bus,
      routes: [
        { from: 'Hà Nội', to: 'Hải Phòng', price: '100.000 - 120.000đ' },
        { from: 'Hà Nội', to: 'Ninh Bình', price: '80.000 - 100.000đ' },
        { from: 'Hà Nội', to: 'Hạ Long', price: '120.000 - 150.000đ' },
        { from: 'HCM', to: 'Vũng Tàu', price: '90.000 - 110.000đ' },
        { from: 'HCM', to: 'Đà Lạt', price: '200.000 - 250.000đ' },
        { from: 'Đà Nẵng', to: 'Hội An', price: '50.000 - 70.000đ' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Bảng Giá Tham Khảo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Giá cả chỉ mang tính chất tham khảo. Tài xế và hành khách tự thỏa thuận giá phù hợp với từng chuyến đi.
          </p>
        </div>

        {/* Price Tables */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {priceData.map((vehicle, idx) => {
            const Icon = vehicle.icon
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{vehicle.vehicleType}</h2>
                </div>

                {/* Routes */}
                <div className="space-y-4">
                  {vehicle.routes.map((route, routeIdx) => (
                    <div
                      key={routeIdx}
                      className="flex justify-between items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {route.from} → {route.to}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary whitespace-nowrap">
                          {route.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 text-amber-900 dark:text-amber-100">
              Lưu ý quan trọng
            </h3>
            <ul className="space-y-2 text-amber-800 dark:text-amber-200">
              <li className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Giá trên chỉ mang tính chất tham khảo, không phải giá cố định</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Tài xế và hành khách tự thỏa thuận giá phù hợp với từng chuyến đi</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>Giá có thể thay đổi tùy theo thời gian, điểm đón/trả, số lượng hành lý</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>SanXeGhep không can thiệp vào việc định giá giữa tài xế và hành khách</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
