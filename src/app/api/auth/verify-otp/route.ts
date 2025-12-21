import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, newPassword } = await request.json()

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Kiểm tra OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', otp)
      .eq('used', false)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Mã OTP không hợp lệ' }, { status: 400 })
    }

    // Kiểm tra OTP hết hạn chưa
    if (new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Mã OTP đã hết hạn' }, { status: 400 })
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Cập nhật mật khẩu
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('phone', phone)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Không thể cập nhật mật khẩu' }, { status: 500 })
    }

    // Đánh dấu OTP đã sử dụng
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpData.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Đặt lại mật khẩu thành công' 
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
