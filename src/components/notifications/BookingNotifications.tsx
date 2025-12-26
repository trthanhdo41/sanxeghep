'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { NotificationModal } from './NotificationModal'

export function BookingNotifications() {
  const { user } = useAuth()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [hasNewBooking, setHasNewBooking] = useState(false)
  const [notificationModal, setNotificationModal] = useState<{
    open: boolean
    type: 'booking_new' | 'booking_confirmed' | 'booking_rejected' | 'booking_completed'
    data: any
  } | null>(null)

  useEffect(() => {
    if (!user?.is_driver) return

    // Fetch initial count
    fetchPendingCount()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('✅ New booking received:', payload)
          handleNewBooking(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('✅ Booking updated:', payload)
          fetchPendingCount()
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.is_driver])

  const fetchPendingCount = async () => {
    if (!user?.is_driver) return

    try {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user.id)
        .eq('status', 'pending')

      setPendingCount(count || 0)
    } catch (error) {
      console.error('Error fetching pending count:', error)
    }
  }

  const handleNewBooking = async (booking: any) => {
    // Fetch passenger info
    const { data: passenger } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', booking.passenger_id)
      .single()

    // Play notification sound
    playNotificationSound()

    // Show modal notification
    setNotificationModal({
      open: true,
      type: 'booking_new',
      data: {
        passengerName: passenger?.full_name || 'Hành khách',
        seatsBooked: booking.seats_booked,
      },
    })

    // Update count
    setPendingCount((prev) => prev + 1)
    setHasNewBooking(true)

    // Reset animation after 3 seconds
    setTimeout(() => setHasNewBooking(false), 3000)
  }

  const playNotificationSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Set frequency (higher = higher pitch)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      // Set volume
      gainNode.gain.value = 0.3
      
      // Play sound
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
      
      // Play second beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        
        oscillator2.frequency.value = 1000
        oscillator2.type = 'sine'
        gainNode2.gain.value = 0.3
        
        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.2)
      }, 250)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  if (!user?.is_driver) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${hasNewBooking ? 'animate-bounce' : ''}`}
        onClick={() => router.push('/profile/bookings')}
      >
        <Bell className={`w-5 h-5 ${hasNewBooking ? 'text-amber-600' : ''}`} />
        {pendingCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </Badge>
        )}
      </Button>

      {notificationModal && (
        <NotificationModal
          open={notificationModal.open}
          onOpenChange={(open) => !open && setNotificationModal(null)}
          type={notificationModal.type}
          data={notificationModal.data}
        />
      )}
    </>
  )
}
