'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Car, Phone, User, FileText, Calendar, Loader2, CheckCircle, 
  ArrowRight, ArrowLeft, Shield, Check, AlertCircle, Upload, Image as ImageIcon, X
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface DriverRegistrationWizardProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const steps = [
  {
    id: 1,
    title: 'Thông tin cá nhân',
    description: 'Cung cấp thông tin cơ bản của bạn',
    icon: User,
  },
  {
    id: 2,
    title: 'Thông tin xe',
    description: 'Chi tiết về phương tiện của bạn',
    icon: Car,
  },
  {
    id: 3,
    title: 'Hình ảnh xe',
    description: 'Tải lên ảnh xe của bạn',
    icon: Upload,
  },
  {
    id: 4,
    title: 'Xác nhận',
    description: 'Xem lại và gửi đơn đăng ký',
    icon: CheckCircle,
  },
]

const requirements = [
  'Có phương tiện đăng ký đầy đủ giấy tờ',
  'Tuân thủ luật giao thông và quy định an toàn',
  'Thái độ thân thiện, lịch sự với hành khách',
  'Cam kết không sử dụng rượu bia khi lái xe',
  'Giữ xe sạch sẽ, thoáng mát',
]

export function DriverRegistrationWizard({ open, onClose, onSuccess }: DriverRegistrationWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleType: '',
    licensePlate: '',
    vehicleImage: '', // Đổi từ licenseImage thành vehicleImage
    experienceYears: '',
    notes: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  // Auto-fill user data when available
  useEffect(() => {
    if (user && open) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user, open])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleImageUpload = async (file: File, field: 'vehicleImage') => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB')
      return
    }

    setUploadingImage(field)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const response = await fetch('https://api.imgbb.com/1/upload?key=ae21ac039240a7d40788bcda9a822d8e', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data && data.data.url) {
        setFormData(prev => ({ ...prev, [field]: data.data.url }))
        toast.success('Tải ảnh lên thành công')
      } else {
        throw new Error(data.error?.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Không thể tải ảnh lên. Vui lòng thử lại')
    } finally {
      setUploadingImage(null)
    }
  }

  const handleRemoveImage = (field: 'vehicleImage') => {
    setFormData(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      toast.error('Chưa đồng ý điều khoản', {
        description: 'Bạn cần đồng ý với điều khoản tài xế để đăng ký',
      })
      return
    }

    setLoading(true)

    try {
      // KHÔNG set is_driver = true ngay
      // Chỉ tạo driver application, chờ admin duyệt
      // Admin sẽ set is_driver = true khi duyệt đơn

      // Tạo đơn đăng ký tài xế
      const { error } = await supabase
        .from('driver_applications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate.toUpperCase(),
          vehicle_image: formData.vehicleImage || null,
          experience_years: parseInt(formData.experienceYears) || 0,
          notes: formData.notes || null,
          status: 'pending',
        })

      if (error) throw error

      toast.success('Đăng ký thành công!', {
        description: 'Đơn của bạn đang chờ admin xét duyệt',
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Vui lòng thử lại',
      })
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName && formData.phone
      case 1:
        return formData.vehicleType && formData.licensePlate
      case 2:
        return formData.vehicleImage && formData.experienceYears
      default:
        return true
    }
  }

  return (
    <>
    <Dialog open={open && !showTerms} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 flex flex-col sm:flex-row overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Đăng ký làm tài xế - Bước {currentStep + 1} / {steps.length}</DialogTitle>
        </VisuallyHidden>
        
        {/* Sidebar - Steps (Hidden on mobile, show as progress bar) */}
        <div className="hidden sm:block sm:w-80 bg-gradient-to-br from-primary/10 to-accent/10 p-8 border-r overflow-y-auto flex-shrink-0">
            <h2 className="text-2xl font-bold mb-8">Đăng ký tài xế</h2>
            
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon
                const isActive = idx === currentStep
                const isCompleted = idx < currentStep
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 transition-all ${
                      isActive ? 'scale-105' : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-gradient-to-br from-primary to-accent text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isActive ? 'text-foreground' : ''}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Requirements */}
            <div className="mt-8 p-4 bg-white/50 rounded-xl">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Yêu cầu tài xế
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Progress Bar */}
          <div className="sm:hidden bg-gradient-to-r from-primary/10 to-accent/10 p-4 pr-12 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Đăng ký tài xế</h2>
              <span className="text-sm text-muted-foreground font-semibold">
                Bước {currentStep + 1}/{steps.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {steps[currentStep].title}
            </p>
          </div>

          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Step 0: Personal Info */}
                {currentStep === 0 && (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Thông tin cá nhân</h3>
                      <p className="text-muted-foreground">
                        Cung cấp thông tin cơ bản để chúng tôi liên hệ với bạn
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Nhập họ và tên đầy đủ"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Nhập số điện thoại"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 1: Vehicle Info */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Thông tin xe</h3>
                      <p className="text-muted-foreground">
                        Chi tiết về phương tiện bạn sẽ sử dụng
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleType">Loại xe *</Label>
                        <Select
                          value={formData.vehicleType}
                          onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại xe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4 chỗ">Xe 4 chỗ</SelectItem>
                            <SelectItem value="5 chỗ">Xe 5 chỗ</SelectItem>
                            <SelectItem value="7 chỗ">Xe 7 chỗ</SelectItem>
                            <SelectItem value="16 chỗ">Xe 16 chỗ</SelectItem>
                            <SelectItem value="29 chỗ">Xe 29 chỗ</SelectItem>
                            <SelectItem value="45 chỗ">Xe 45 chỗ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licensePlate">Biển số xe *</Label>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="licensePlate"
                            value={formData.licensePlate}
                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                            placeholder="VD: 30A-12345"
                            className="pl-10 uppercase"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Vehicle Image & Experience */}
                {currentStep === 2 && (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Hình ảnh xe & Kinh nghiệm</h3>
                      <p className="text-muted-foreground">
                        Tải lên ảnh xe và cho biết kinh nghiệm lái xe của bạn
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Vehicle Image */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ImageIcon size={18} className="text-primary" />
                          Hình ảnh xe *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Tải lên ảnh xe của bạn (mặt trước hoặc toàn cảnh)
                        </p>
                        {formData.vehicleImage ? (
                          <div className="relative group">
                            <img 
                              src={formData.vehicleImage} 
                              alt="Xe" 
                              className="w-full h-64 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('vehicleImage')}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {uploadingImage === 'vehicleImage' ? (
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                              ) : (
                                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                              )}
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Bấm để tải ảnh</span> hoặc kéo thả
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'vehicleImage')}
                              disabled={uploadingImage === 'vehicleImage'}
                            />
                          </label>
                        )}
                      </div>

                      {/* Experience Years */}
                      <div className="space-y-2">
                        <Label htmlFor="experienceYears">Số năm kinh nghiệm lái xe *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="experienceYears"
                            type="number"
                            value={formData.experienceYears}
                            onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                            placeholder="VD: 5"
                            className="pl-10"
                            min="0"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nhập số năm bạn đã có kinh nghiệm lái xe
                        </p>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú thêm (tùy chọn)</Label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="VD: Xe có điều hòa, ghế da, âm thanh tốt..."
                          className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Xác nhận thông tin</h3>
                      <p className="text-muted-foreground">
                        Vui lòng kiểm tra lại thông tin trước khi gửi
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Họ và tên</p>
                          <p className="font-semibold">{formData.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          <p className="font-semibold">{formData.phone}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Loại xe</p>
                            <p className="font-semibold">{formData.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Biển số</p>
                            <p className="font-semibold">{formData.licensePlate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Kinh nghiệm lái xe</p>
                          <p className="font-semibold">{formData.experienceYears} năm</p>
                        </div>
                        
                        {/* Vehicle Image */}
                        {formData.vehicleImage && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Hình ảnh xe</p>
                            <img src={formData.vehicleImage} alt="Xe" className="w-full h-48 object-cover rounded-lg border" />
                          </div>
                        )}

                        {formData.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground">Ghi chú</p>
                            <p className="font-semibold">{formData.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                          <p>
                            Đơn đăng ký của bạn sẽ được admin xem xét trong vòng 24-48 giờ. 
                            Vui lòng đảm bảo thông tin chính xác để tránh bị từ chối.
                          </p>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="driver-terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <label htmlFor="driver-terms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            Tôi đã đọc và đồng ý với{' '}
                            <button
                              type="button"
                              onClick={() => setShowTerms(true)}
                              className="text-primary hover:underline font-semibold"
                            >
                              Điều khoản tài xế
                            </button>{' '}
                            của Sàn Xe Ghép
                          </label>
                        </div>
                        {!agreedToTerms && (
                          <p className="text-xs text-red-600 ml-8">
                            * Bạn cần đồng ý với điều khoản để hoàn tất đăng ký
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-gradient-to-r from-primary to-accent w-full sm:w-auto order-1 sm:order-2"
                >
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !agreedToTerms}
                  className="bg-gradient-to-r from-primary to-accent w-full sm:w-auto order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Gửi đơn đăng ký
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Terms Modal - Using Portal to render outside Dialog */}
    {showTerms && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTerms(false)
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold">Điều khoản tài xế</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Vui lòng đọc kỹ trước khi đăng ký
                </p>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Điều khoản tài xế */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-xl font-bold text-primary">ĐIỀU KHOẢN DÀNH CHO TÀI XẾ</h4>
                
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    LƯU Ý CỰC KỲ QUAN TRỌNG:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside ml-4">
                    <li><strong>Sàn Xe Ghép chỉ là nơi kết nối.</strong> Khách và tài xế tự thỏa thuận giá và chịu trách nhiệm về chuyến đi.</li>
                    <li><strong>Mọi vấn đề phát sinh trong chuyến đi</strong> do tài xế và hành khách tự giải quyết với nhau.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg">I. Vai trò của Sàn Xe Ghép</h5>
                  <ul className="text-sm space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-2">
                    <li>Công ty là trung gian kết nối tài xế và hành khách.</li>
                    <li>Tài xế tự chịu trách nhiệm pháp lý về hành trình, phương tiện, an toàn giao thông.</li>
                    <li>Công ty không sở hữu xe, không điều phối xe, không thu phí trừ khi có thông báo khác.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg">II. Điều kiện trở thành tài xế</h5>
                  <p className="text-xs sm:text-sm font-semibold">Tài xế phải:</p>
                  <ul className="text-sm space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-2">
                    <li>Có GPLX hợp lệ theo loại xe.</li>
                    <li>Có CCCD còn hiệu lực.</li>
                    <li>Xe có đăng ký, đăng kiểm đầy đủ.</li>
                    <li>Cam kết trung thực khi khai báo thông tin.</li>
                    <li>Không đăng tin giả, spam, lừa đảo hoặc câu khách không trung thực.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg">III. Nghĩa vụ của tài xế</h5>
                  <ul className="text-sm space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-2">
                    <li>Cập nhật chính xác lịch trình, giờ chạy, giá dự kiến (nếu có).</li>
                    <li>Liên hệ với hành khách đúng mục đích.</li>
                    <li>Không tự ý thu phí cao hơn thỏa thuận.</li>
                    <li>Không hủy chuyến với lý do không chính đáng.</li>
                    <li>Tự đảm bảo an toàn cho hành khách.</li>
                    <li>Không sử dụng hình ảnh, dữ liệu khách để spam hoặc mục đích riêng.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg">IV. Quyền của tài xế</h5>
                  <ul className="text-sm space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-2">
                    <li>Đăng chuyến miễn phí.</li>
                    <li>Chọn khách theo nhu cầu.</li>
                    <li>Quyền báo cáo hành khách vi phạm.</li>
                    <li>Quyền yêu cầu xóa tài khoản bất kỳ lúc nào.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg text-red-700 dark:text-red-400">V. Các hành vi nghiêm cấm</h5>
                  <ul className="text-sm space-y-2 list-disc list-inside text-red-700 dark:text-red-400 ml-2">
                    <li>Đăng tin giả, chuyến ảo.</li>
                    <li>Ghép thêm khách vượt quá số ghế an toàn.</li>
                    <li>Gạ gẫm, quấy rối, xúc phạm hành khách.</li>
                    <li>Thỏa thuận ăn chia bất hợp pháp gây tranh chấp.</li>
                    <li>Sử dụng app để lừa đảo hoặc buôn bán trái phép.</li>
                  </ul>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h5 className="font-bold text-sm sm:text-lg">VI. Xử lý vi phạm</h5>
                  <ul className="text-sm space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-2">
                    <li>Nhắc nhở</li>
                    <li>Khóa tài khoản</li>
                    <li>Cấm vĩnh viễn</li>
                    <li>Báo cơ quan chức năng nếu vi phạm pháp luật</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowTerms(false)}
                variant="outline"
                className="flex-1 order-2 sm:order-1"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setAgreedToTerms(true)
                  setShowTerms(false)
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent order-1 sm:order-2"
              >
                Đồng ý
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
  </>
  )
}
