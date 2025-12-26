'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Eye, Archive, Loader2, MessageCircle, Clock, CheckCircle, AtSign, Phone, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logAction } from '@/lib/permissions'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  admin_notes: string | null
  created_at: string
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('new')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/')
      return
    }

    fetchMessages()
  }, [user, router])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Query error:', error)
        throw error
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      // Get message details before updating
      const { data: message } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .single()

      const { error } = await supabase
        .from('contact_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Log action for all status changes
      await logAction(user!.id, 'update', 'message', id, {
        action: status === 'replied' ? 'reply' : status === 'read' ? 'mark_read' : status === 'archived' ? 'archive' : 'update',
        new_status: status,
        sender_name: message?.name,
        sender_email: message?.email,
        subject: message?.subject,
      })

      toast.success('Cập nhật trạng thái thành công')
      fetchMessages()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const deleteMessage = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tin nhắn từ "${name}"?`)) return

    try {
      // Get message details before deleting
      const { data: message } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .single()

      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Log action
      await logAction(user!.id, 'delete', 'message', id, {
        sender_name: message?.name,
        sender_email: message?.email,
        subject: message?.subject,
      })

      toast.success('Đã xóa tin nhắn')
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Không thể xóa tin nhắn')
    }
  }

  const filteredMessages = messages.filter(msg => 
    filter === 'all' ? true : msg.status === filter
  )

  const newCount = messages.filter(m => m.status === 'new').length
  const readCount = messages.filter(m => m.status === 'read').length
  const repliedCount = messages.filter(m => m.status === 'replied').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tin nhắn liên hệ</h1>
            <p className="text-muted-foreground">
              Tổng: {messages.length} tin nhắn ({newCount} mới)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Tất cả ({messages.length})
          </Button>
          <Button
            variant={filter === 'new' ? 'default' : 'outline'}
            onClick={() => setFilter('new')}
            className={filter === 'new' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Mail className="w-4 h-4 mr-2" />
            Mới ({newCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => setFilter('read')}
            className={filter === 'read' ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            <Eye className="w-4 h-4 mr-2" />
            Đã đọc ({readCount})
          </Button>
          <Button
            variant={filter === 'replied' ? 'default' : 'outline'}
            onClick={() => setFilter('replied')}
            className={filter === 'replied' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Đã trả lời ({repliedCount})
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-card border rounded-xl p-6 ${
                msg.status === 'new' ? 'border-blue-500 border-2' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{msg.name}</h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : msg.status === 'read'
                          ? 'bg-amber-100 text-amber-700'
                          : msg.status === 'replied'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {msg.status === 'new' && 'Mới'}
                      {msg.status === 'read' && 'Đã đọc'}
                      {msg.status === 'replied' && 'Đã trả lời'}
                      {msg.status === 'archived' && 'Đã lưu trữ'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <AtSign className="w-3 h-3" />
                      {msg.email}
                    </p>
                    {msg.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {msg.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-2">Chủ đề: {msg.subject}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {msg.status === 'new' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(msg.id, 'read')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Đánh dấu đã đọc
                  </Button>
                )}
                {(msg.status === 'new' || msg.status === 'read') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100"
                    onClick={() => updateStatus(msg.id, 'replied')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Đánh dấu đã trả lời
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(msg.id, 'archived')}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Lưu trữ
                </Button>
                {msg.phone && (
                  <a href={`tel:${msg.phone}`}>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Gọi điện
                    </Button>
                  </a>
                )}
                <a href={`mailto:${msg.email}`}>
                  <Button size="sm" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Trả lời qua email
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMessage(msg.id, msg.name)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Không có tin nhắn nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
