'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PassengerRequestCard } from '@/components/requests/PassengerRequestCard'
import { MapPin, Calendar, Loader2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { searchLocations } from '@/lib/vietnam-locations'
import { useAuth } from '@/lib/auth-context'

interface PassengerRequest {
  id: string
  user_id: string
  from_location: string
  to_location: string
  date: string
  time: string
  passengers: number
  luggage?: string
  notes?: string
  status: string
  created_at: string
  user?: {
    full_name: string
    phone: string
    avatar_url?: string
  }
}

export default function NhuCauHanhKhachPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState<PassengerRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<PassengerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const ITEMS_PER_PAGE = 12

  // Location suggestions
  const fromSuggestions = useMemo(() => searchLocations(searchFrom), [searchFrom])
  const toSuggestions = useMemo(() => searchLocations(searchTo), [searchTo])

  // Check if user is driver or admin
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground">Bạn cần đăng nhập để xem nhu cầu hành khách</p>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  if (user.role !== 'driver' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Chỉ dành cho tài xế</h1>
          <p className="text-muted-foreground">
            Trang này chỉ dành cho tài xế để xem nhu cầu của hành khách
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/tai-xe')}>Đăng ký tài xế</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Về trang chủ</Button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchRequests(true)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [requests, searchFrom, searchTo, searchDate])

  const fetchRequests = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setPage(0)
      setRequests([])
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const currentPage = reset ? 0 : page
      const from = currentPage * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: requestsData, error, count } = await supabase
        .from('passenger_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (!requestsData || requestsData.length === 0) {
        setHasMore(false)
        if (reset) {
          setRequests([])
        }
        return
      }

      // Check if there are more items
      const totalFetched = from + requestsData.length
      setHasMore(count ? totalFetched < count : false)

      // Fetch user info with avatar
      const userIds = requestsData.map(r => r.user_id).filter(Boolean)
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds)

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

      const formattedRequests = requestsData.map((req: any) => ({
        ...req,
        user: usersMap.get(req.user_id),
      }))

      if (reset) {
        setRequests(formattedRequests)
      } else {
        // Prevent duplicates
        setRequests(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const newRequests = formattedRequests.filter(r => !existingIds.has(r.id))
          return [...prev, ...newRequests]
        })
      }

      setPage(currentPage + 1)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setHasMore(false)
      if (reset) {
        setRequests([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRequests(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...requests]

    // Filter by from location
    if (searchFrom) {
      filtered = filtered.filter(req =>
        req.from_location.toLowerCase().includes(searchFrom.toLowerCase())
      )
    }

    // Filter by to location
    if (searchTo) {
      filtered = filtered.filter(req =>
        req.to_location.toLowerCase().includes(searchTo.toLowerCase())
      )
    }

    // Filter by date
    if (searchDate) {
      filtered = filtered.filter(req => req.date === searchDate)
    }

    setFilteredRequests(filtered)
  }

  const handleReset = () => {
    setSearchFrom('')
    setSearchTo('')
    setSearchDate('')
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="container py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            <span className="gradient-text">Nhu cầu hành khách</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Các hành khách đang tìm chuyến xe. Liên hệ ngay nếu bạn có chuyến phù hợp!
          </p>

          {/* Search Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={20} />
                <Input
                  placeholder="Điểm đi"
                  className="pl-10"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                  autoComplete="off"
                />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-50">
                    {fromSuggestions.map((location, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchFrom(location)
                          setShowFromSuggestions(false)
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                      >
                        <MapPin size={16} className="text-muted-foreground" />
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10" size={20} />
                <Input
                  placeholder="Điểm đến"
                  className="pl-10"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                  autoComplete="off"
                />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-80 overflow-y-auto z-50">
                    {toSuggestions.map((location, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchTo(location)
                          setShowToSuggestions(false)
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                      >
                        <MapPin size={16} className="text-muted-foreground" />
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="date"
                  className="pl-10"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Đặt lại
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{filteredRequests.length}</span> nhu cầu
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <PassengerRequestCard key={request.id} request={request} />
              ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="px-8"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Đang tải...
                  </>
                ) : (
                  'Xem thêm nhu cầu'
                )}
              </Button>
            </div>
          )}

          {/* Loading More Skeleton */}
          {loadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted rounded" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
        ) : (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {requests.length === 0 ? 'Chưa có nhu cầu nào' : 'Không tìm thấy nhu cầu phù hợp'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {requests.length === 0 
                ? 'Hãy quay lại sau để xem các nhu cầu mới'
                : 'Thử thay đổi bộ lọc hoặc tìm kiếm lại'
              }
            </p>
            {requests.length > 0 && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleReset}
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
