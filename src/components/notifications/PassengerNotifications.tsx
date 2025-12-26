'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { NotificationModal } from './NotificationModal'

export function PassengerNotifications() {
  const { user } = useAuth()
  const router = useRouter()
  const [notificationModal, setNotificationModal] = useState<{
    open: boolean
    type: 'booking_new' | 'booking_confirmed' | 'booking_rejected' | 'booking_completed'
    data: any
  } | null>(null)

  useEffect(() => {
    if (!user) {
      console.log('⚠️ PassengerNotifications: No user, skipping subscription')
      return
    }

    console.log('🔔 PassengerNotifications: Setting up subscription for user:', user.id)

    // Subscribe to booking updates for passenger
    const channel = supabase
      .channel(`passenger-bookings-${user.id}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `passenger_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('✅ Passenger booking updated:', payload)
          const newStatus = (payload.new as any).status

          console.log(`New status: ${newStatus}`)

          // Fetch driver info
          const { data: driver } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', (payload.new as any).driver_id)
            .single()

          // Booking confirmed
          if (newStatus === 'confirmed') {
            console.log('🎉 Booking confirmed! Showing notification...')
            playNotificationSound()
            setNotificationModal({
              open: true,
              type: 'booking_confirmed',
              data: {
                driverName: driver?.full_name || 'Tài xế',
              },
            })
          }

          // Booking rejected
          if (newStatus === 'rejected') {
            console.log('❌ Booking rejected! Showing notification...')
            setNotificationModal({
              open: true,
              type: 'booking_rejected',
              data: {
                driverName: driver?.full_name || 'Tài xế',
              },
            })
          }

          // Booking completed
          if (newStatus === 'completed') {
            console.log('✅ Booking completed! Showing notification...')
            setNotificationModal({
              open: true,
              type: 'booking_completed',
              data: {},
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Passenger realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to passenger bookings updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to passenger bookings')
        }
      })

    return () => {
      console.log('🔌 Unsubscribing from passenger bookings')
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  return (
    <>
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
