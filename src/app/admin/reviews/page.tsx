'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Search, Star, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  from_user: {
    full_name: string
  }
  to_user: {
    full_name: string
  }
  trip: {
    from_location: string
    to_location: string
  } | null
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reviewId: string } | null>(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      router.push('/')
      return
    }
    fetchReviews()
  }, [user])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          from_user:users!reviews_from_user_id_fkey(full_name),
          to_user:users!reviews_to_user_id_fkey(full_name),
          trip:trips(from_location, to_location)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    try {
      // Get review details before deleting
      const { data: review } = await supabase
        .from('reviews')
        .select('*, from_user:users!reviews_from_user_id_fkey(full_name), to_user:users!reviews_to_user_id_fkey(full_name)')
        .eq('id', reviewId)
        .single()

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'delete', 'review', reviewId, {
        from_user: review?.from_user?.full_name,
        to_user: review?.to_user?.full_name,
        rating: review?.rating,
      })

      toast.success('Đã xóa đánh giá')
      fetchReviews()
    } catch (error: any) {
      console.error('Error deleting review:', error)
      toast.error('Không thể xóa', {
        description: error.message,
      })
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      review.from_user.full_name.toLowerCase().includes(search) ||
      review.to_user.full_name.toLowerCase().includes(search) ||
      review.comment?.toLowerCase().includes(search)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE)
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    fourStar: reviews.filter((r) => r.rating === 4).length,
    threeStar: reviews.filter((r) => r.rating === 3).length,
    twoStar: reviews.filter((r) => r.rating === 2).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý đánh giá</h1>
            <p className="text-muted-foreground">
              Tổng: {stats.total} đánh giá • Trung bình: {stats.average} ⭐
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Tổng</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.fiveStar}</div>
            <div className="text-xs text-muted-foreground">5 ⭐</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.fourStar}</div>
            <div className="text-xs text-muted-foreground">4 ⭐</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.threeStar}</div>
            <div className="text-xs text-muted-foreground">3 ⭐</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.twoStar}</div>
            <div className="text-xs text-muted-foreground">2 ⭐</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.oneStar}</div>
            <div className="text-xs text-muted-foreground">1 ⭐</div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Tìm theo tên, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>{review.from_user.full_name}</strong> đánh giá{' '}
                      <strong>{review.to_user.full_name}</strong>
                      {review.trip && (
                        <span className="text-muted-foreground">
                          {' '}• {review.trip.from_location} → {review.trip.to_location}
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, reviewId: review.id })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} ({filteredReviews.length} kết quả)
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
        )}

        {paginatedReviews.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy đánh giá nào
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteDialog && (
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa đánh giá</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(deleteDialog.reviewId)
                  setDeleteDialog(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
