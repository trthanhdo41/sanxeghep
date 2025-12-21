// Danh sách 63 tỉnh thành Việt Nam + các địa điểm phổ biến
export const vietnamLocations = [
  // Thành phố trực thuộc TW
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  
  // Miền Bắc
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Cao Bằng",
  "Điện Biên",
  "Hà Giang",
  "Hà Nam",
  "Hải Dương",
  "Hòa Bình",
  "Hưng Yên",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Nam Định",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ninh",
  "Sơn La",
  "Thái Bình",
  "Thái Nguyên",
  "Tuyên Quang",
  "Vĩnh Phúc",
  "Yên Bái",
  
  // Miền Trung
  "Bình Định",
  "Bình Thuận",
  "Đắk Lắk",
  "Đắk Nông",
  "Gia Lai",
  "Hà Tĩnh",
  "Khánh Hòa",
  "Kon Tum",
  "Lâm Đồng",
  "Nghệ An",
  "Ninh Thuận",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Trị",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  
  // Miền Nam
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bến Tre",
  "Bình Dương",
  "Bình Phước",
  "Cà Mau",
  "Đồng Nai",
  "Đồng Tháp",
  "Hậu Giang",
  "Kiên Giang",
  "Long An",
  "Sóc Trăng",
  "Tây Ninh",
  "Tiền Giang",
  "Trà Vinh",
  "Vĩnh Long",
  
  // Địa điểm phổ biến
  "Sân bay Nội Bài",
  "Sân bay Tân Sơn Nhất",
  "Sân bay Đà Nẵng",
  "Sân bay Cam Ranh",
  "Nha Trang",
  "Vũng Tàu",
  "Đà Lạt",
  "Huế",
  "Hội An",
  "Sapa",
  "Hạ Long",
  "Phú Quốc",
  "Mũi Né",
].sort()

// Hàm tìm kiếm địa điểm
export function searchLocations(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return vietnamLocations // Hiện tất cả địa điểm
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  return vietnamLocations.filter(location => 
    location.toLowerCase().includes(normalizedQuery)
  )
}
