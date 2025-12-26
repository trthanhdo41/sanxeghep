'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface StatsChartProps {
  stats: {
    totalUsers: number
    totalTrips: number
    totalDrivers: number
    activeTrips: number
    totalBookings: number
    pendingBookings: number
    completedBookings: number
    totalReviews: number
  }
}

export function StatsChart({ stats }: StatsChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const barData = {
    labels: ['Người dùng', 'Chuyến đi', 'Tài xế', 'Đặt chỗ', 'Đánh giá'],
    datasets: [
      {
        label: 'Thống kê tổng quan',
        data: [
          stats.totalUsers,
          stats.totalTrips,
          stats.totalDrivers,
          stats.totalBookings,
          stats.totalReviews,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(20, 184, 166)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const doughnutData = {
    labels: ['Chờ xác nhận', 'Hoàn thành', 'Khác'],
    datasets: [
      {
        label: 'Đặt chỗ',
        data: [
          stats.pendingBookings,
          stats.completedBookings,
          stats.totalBookings - stats.pendingBookings - stats.completedBookings,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(16, 185, 129)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Thống kê tổng quan',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Trạng thái đặt chỗ',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="p-6">
        <div className="h-[300px]">
          <Bar data={barData} options={barOptions} />
        </div>
      </Card>
      <Card className="p-6">
        <div className="h-[300px]">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </Card>
    </div>
  )
}
