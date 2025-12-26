'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TripCard } from '@/components/trips/TripCard'
import { searchLocations } from '@/lib/vietnam-locations'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, SlidersHorizontal, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// Skeleton Component
function TripCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-6 bg-muted rounded w-1/3" />
      </div>
    </Card>
  )
}

function TimChuyenPage() {
  const searchParams = useSearchParams()
  const [trips, setTrips] = useState<any[]>([])
  const [filteredTrips, setFilteredTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const vehicleTypes = ['4 chỗ', '7 chỗ', '16 chỗ']
  const ITEMS_PER_PAGE = 12
  
  // Gợi ý địa điểm
  const fromSuggestions = useMemo(() => searchLocations(searchFrom), [searchFrom])
  const toSuggestions = useMemo(() => searchLocations(searchTo), [searchTo])

  // Get params from URL
  useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')
    
    if (from) setSearchFrom(from)
    if (to) setSearchTo(to)
    if (date) setSearchDate(date)
  }, [searchParams])

  // Fetch trips from database with pagination
  useEffect(() => {
    fetchTrips(true)
  }, [])

  // Apply filters whenever filter values change
  useEffect(() => {
    applyFilters()
  }, [trips, priceRange, selectedVehicles, searchFrom, searchTo, searchDate, sortBy])

  const fetchTrips = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setPage(0)
      setTrips([])
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const currentPage = reset ? 0 : page
      const from = currentPage * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      // Fetch trips with pagination
      const { data: tripsData, error: tripsError, count } = await supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (tripsError) {
        console.error('Query error:', tripsError)
        throw tripsError
      }

      if (!tripsData || tripsData.length === 0) {
        setHasMore(false)
        if (reset) {
          setTrips([])
        }
        return
      }

      // Check if there are more items
      const totalFetched = from + tripsData.length
      setHasMore(count ? totalFetched < count : false)

      // Fetch driver profiles for each trip
      const driverIds = tripsData.map(trip => trip.driver_id).filter(Boolean)
      const { data: driversData } = await supabase
        .from('driver_profiles')
        .select('user_id, vehicle_type, vehicle_seats')
        .in('user_id', driverIds)

      // Fetch user info (bao gồm rating và completed_trips)
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, rating, completed_trips, verified')
        .in('id', driverIds)

      // Create lookup maps
      const driversMap = new Map(driversData?.map(d => [d.user_id, d]) || [])
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

      // Transform data
      const transformedTrips = tripsData.map((trip: any) => {
        const driver = driversMap.get(trip.driver_id)
        const user = usersMap.get(trip.driver_id)
        
        return {
          id: trip.id,
          driverId: trip.driver_id, // Lưu driver_id để fetch phone sau khi login
          driver: {
            id: trip.driver_id,
            name: user?.full_name || 'Tài xế',
            avatar: user?.avatar_url || '',
            phone: '', // Không trả phone ở đây
            rating: user?.rating || 0,
            totalTrips: user?.completed_trips || 0,
            verified: user?.verified || false,
          },
          from: trip.from_location || 'N/A',
          to: trip.to_location || 'N/A',
          date: trip.date ? new Date(trip.date).toLocaleDateString('vi-VN') : 'N/A',
          time: trip.time ? trip.time.substring(0, 5) : '00:00', // Cắt giây (HH:MM:SS -> HH:MM)
          departureTime: trip.departure_time || new Date(trip.date + ' ' + trip.time).toISOString(),
          seatsAvailable: trip.seats_available || 0,
          totalSeats: trip.total_seats || driver?.vehicle_seats || 4,
          price: trip.price || 0,
          vehicleType: trip.vehicle_type || driver?.vehicle_type || '4 chỗ',
          notes: trip.notes || '',
        }
      })

      if (reset) {
        setTrips(transformedTrips)
      } else {
        // Prevent duplicates by checking existing IDs
        setTrips(prev => {
          const existingIds = new Set(prev.map(t => t.id))
          const newTrips = transformedTrips.filter(t => !existingIds.has(t.id))
          return [...prev, ...newTrips]
        })
      }
      
      setPage(currentPage + 1)
    } catch (error) {
      console.error('Error fetching trips:', error)
      setHasMore(false)
      if (reset) {
        setTrips([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTrips(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...trips]

    // Filter by location
    if (searchFrom) {
      filtered = filtered.filter(trip =>
        trip.from.toLowerCase().includes(searchFrom.toLowerCase())
      )
    }
    if (searchTo) {
      filtered = filtered.filter(trip =>
        trip.to.toLowerCase().includes(searchTo.toLowerCase())
      )
    }

    // Filter by date
    if (searchDate) {
      filtered = filtered.filter(trip => {
        if (!trip.date) return false
        
        try {
          // Convert Vietnamese date format (dd/mm/yyyy) to ISO
          const [day, month, year] = trip.date.split('/')
          if (day && month && year) {
            const tripDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            return tripDate === searchDate
          }
          return false
        } catch {
          return false
        }
      })
    }

    // Filter by price range
    filtered = filtered.filter(
      trip => trip.price >= priceRange[0] && trip.price <= priceRange[1]
    )

    // Filter by vehicle type
    if (selectedVehicles.length > 0) {
      filtered = filtered.filter(trip =>
        selectedVehicles.includes(trip.vehicleType)
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        // Ưu tiên tài xế uy tín (≥ 4.5 sao) lên đầu, sau đó sắp xếp theo rating
        filtered.sort((a, b) => {
          const aIsReputable = a.driver.rating >= 4.5
          const bIsReputable = b.driver.rating >= 4.5
          
          if (aIsReputable && !bIsReputable) return -1
          if (!aIsReputable && bIsReputable) return 1
          
          // Nếu cùng uy tín hoặc không uy tín, sắp xếp theo rating
          if (b.driver.rating !== a.driver.rating) {
            return b.driver.rating - a.driver.rating
          }
          
          // Nếu rating bằng nhau, ưu tiên người có nhiều chuyến hơn
          return b.driver.totalTrips - a.driver.totalTrips
        })
        break
      default: // newest
        break
    }

    setFilteredTrips(filtered)
  }

  const handleVehicleToggle = (vehicle: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicle)
        ? prev.filter(v => v !== vehicle)
        : [...prev, vehicle]
    )
  }

  const handleSearch = async () => {
    // Reset and fetch with new filters
    await fetchTrips(true)
  }

  const handleReset = () => {
    setPriceRange([0, 500000])
    setSelectedVehicles([])
    setSearchDate('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="container py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            <span className="gradient-text">Tìm chuyến xe ghép</span>
          </h1>
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border max-h-60 overflow-y-auto z-50">
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
                className="relative bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all btn-glow overflow-hidden"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Đang tìm...
                  </>
                ) : (
                  <span className="relative z-10">Tìm kiếm</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Bộ lọc
                </h3>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <Label>Khoảng giá</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-3">
                <Label>Loại xe</Label>
                {vehicleTypes.map(vehicle => (
                  <div key={vehicle} className="flex items-center space-x-2">
                    <Checkbox
                      id={vehicle}
                      checked={selectedVehicles.includes(vehicle)}
                      onCheckedChange={() => handleVehicleToggle(vehicle)}
                    />
                    <label
                      htmlFor={vehicle}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {vehicle}
                    </label>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Button 
                  className="relative w-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl transition-all btn-glow overflow-hidden"
                  onClick={applyFilters}
                >
                  <span className="relative z-10">Áp dụng</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full font-medium hover:bg-muted transition-colors"
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
              </div>
            </Card>
          </aside>

          {/* Trip List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {loading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>
                    Tìm thấy <span className="font-semibold text-foreground">{filteredTrips.length}</span> chuyến đi
                  </>
                )}
              </p>
              <select 
                className="px-4 py-2 rounded-lg border bg-background"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp nhất</option>
                <option value="price-high">Giá cao nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Trip Cards */}
            {!loading && filteredTrips.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
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
                        'Xem thêm chuyến đi'
                      )}
                    </Button>
                  </div>
                )}

                {/* Loading More Skeleton */}
                {loadingMore && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {[1, 2].map((i) => (
                      <TripCardSkeleton key={i} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && filteredTrips.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy chuyến đi phù hợp
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Thử thay đổi bộ lọc hoặc tìm kiếm lại
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleReset}
                >
                  Đặt lại bộ lọc
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap the main component with Suspense
function TimChuyenPageContent() {
  return <TimChuyenPage />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <TimChuyenPageContent />
    </Suspense>
  )
}
