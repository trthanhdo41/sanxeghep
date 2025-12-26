'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    trip_id: string
    driver_id: string
    passenger_id: string
    driver_name?: string
    passenger_name?: string
  }
  reviewType: 'driver' | 'passenger' // Tài xế đánh giá khách, hoặc khách đánh giá tài xế
  onSuccess?: () => void
}

export function ReviewModal({ open, onOpenChange, booking, reviewType, onSuccess }: ReviewModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao')
      return
    }

    setLoading(true)

    try {
      // Xác định người đánh giá và người được đánh giá
      const from_user_id = user.id
      const to_user_id = reviewType === 'driver' 
        ? booking.driver_id 
        : booking.passenger_id

      // Kiểm tra xem đã đánh giá chưa
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('from_user_id', from_user_id)
        .single()

      if (existingReview) {
        toast.error('Bạn đã đánh giá chuyến này rồi')
        onOpenChange(false)
        return
      }

      // Tạo review mới
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          trip_id: booking.trip_id,
          from_user_id,
          to_user_id,
          rating,
          comment: comment.trim() || null,
        })

      if (error) throw error

      toast.success('Đánh giá thành công!', {
        description: 'Cảm ơn bạn đã chia sẻ trải nghiệm',
      })

      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setRating(0)
      setComment('')
    } catch (error: any) {
      console.error('Error creating review:', error)
      toast.error('Đánh giá thất bại', {
        description: error.message || 'Vui lòng thử lại',
      })
    } finally {
      setLoading(false)
    }
  }

  const revieweeName = reviewType === 'driver' 
    ? booking.driver_name 
    : booking.passenger_name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Đánh giá {reviewType === 'driver' ? 'tài xế' : 'hành khách'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reviewee Info */}
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Bạn cảm thấy thế nào về chuyến đi với
            </p>
            <p className="text-lg font-semibold">{revieweeName || 'người này'}?</p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={40}
                  className={`
                    ${(hoveredRating || rating) >= star
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                    }
                    transition-colors
                  `}
                />
              </button>
            ))}
          </div>

          {/* Rating Text */}
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Xuất sắc'}
            </p>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nhận xét (không bắt buộc)
            </label>
            <Textarea
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              placeholder={
                reviewType === 'driver'
                  ? 'VD: Tài xế lái xe an toàn, đúng giờ, thân thiện...'
                  : 'VD: Hành khách đúng giờ, lịch sự, dễ chịu...'
              }
              className="resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
