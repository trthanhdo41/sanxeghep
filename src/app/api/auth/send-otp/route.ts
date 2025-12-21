import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    console.log('Received phone:', phone)

    if (!phone) {
      return NextResponse.json({ error: 'Số điện thoại là bắt buộc' }, { status: 400 })
    }

    // Kiểm tra user có tồn tại không
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', phone)
      .single()

    if (userError) {
      console.error('User lookup error:', userError)
    }

    if (!user) {
      return NextResponse.json({ error: 'Số điện thoại không tồn tại trong hệ thống' }, { status: 404 })
    }

    console.log('User found:', user.id)

    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated OTP:', otp)
    
    // Lưu OTP vào database với thời hạn 5 phút
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone,
        code: otp,
        expires_at: expiresAt,
        used: false
      })
      .select()

    if (otpError) {
      console.error('Error saving OTP:', otpError)
      return NextResponse.json({ 
        error: 'Không thể tạo mã OTP', 
        details: otpError.message 
      }, { status: 500 })
    }

    console.log('OTP saved:', otpData)

    // Gửi OTP qua eSMS
    const eSMSApiKey = process.env.ESMS_API_KEY
    const eSMSSecretKey = process.env.ESMS_SECRET_KEY
    
    const message = `Ma xac thuc OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut. - SanXeGhep.vn`
    
    const eSMSUrl = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/`
    
    const eSMSResponse = await fetch(eSMSUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ApiKey: eSMSApiKey,
        SecretKey: eSMSSecretKey,
        Phone: phone,
        Content: message,
        SmsType: 8, // CSKH (Chăm sóc khách hàng)
        Sandbox: 0 // 0 = production, 1 = test mode
      })
    })

    const eSMSResult = await eSMSResponse.json()
    console.log('eSMS Response:', eSMSResult)

    if (eSMSResult.CodeResult !== '100') {
      console.error('eSMS Error:', eSMSResult)
      // Vẫn trả về success vì OTP đã lưu vào DB
      // User có thể dùng OTP từ DB để test
      return NextResponse.json({ 
        success: true, 
        message: 'Mã OTP đã được tạo (SMS có thể bị delay)',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined // Chỉ show OTP trong dev mode
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn' 
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
