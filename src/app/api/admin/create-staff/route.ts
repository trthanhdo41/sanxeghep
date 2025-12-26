import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình' 
      }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { email, password, full_name, phone, permissions, admin_id } = await request.json()

    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: `Email "${email}" đã được sử dụng. Vui lòng dùng email khác.` 
      }, { status: 400 })
    }

    // Kiểm tra phone đã tồn tại chưa (nếu có phone)
    if (phone) {
      const { data: existingPhone } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      if (existingPhone) {
        return NextResponse.json({ 
          error: `Số điện thoại "${phone}" đã được sử dụng. Vui lòng dùng số khác hoặc để trống.` 
        }, { status: 400 })
      }
    }

    // Dùng admin.createUser để tạo user mà không cần confirm email
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Tự động confirm email
      user_metadata: {
        full_name,
        phone,
      },
    })

    if (createError) {
      // Dịch lỗi sang tiếng Việt
      let errorMsg = createError.message
      if (errorMsg.includes('already been registered')) {
        errorMsg = `Email "${email}" đã được đăng ký. Vui lòng dùng email khác.`
      } else if (errorMsg.includes('invalid')) {
        errorMsg = `Email "${email}" không hợp lệ.`
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Không thể tạo tài khoản' }, { status: 500 })
    }

    // Hash password để lưu vào bảng users
    const hashedPassword = await bcrypt.hash(password, 10)

    // INSERT vào bảng users (không phải UPDATE vì chưa có row)
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password: hashedPassword,
        full_name,
        phone: phone || null, // NULL nếu không có phone
        role: 'staff',
        verified: false,
        rating: 0,
        total_trips: 0,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      // Nếu insert lỗi, xóa auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      // Dịch lỗi sang tiếng Việt
      let errorMsg = insertError.message
      if (errorMsg.includes('users_phone_key')) {
        errorMsg = `Số điện thoại "${phone}" đã được sử dụng. Vui lòng dùng số khác hoặc để trống.`
      } else if (errorMsg.includes('users_email_key')) {
        errorMsg = `Email "${email}" đã được sử dụng. Vui lòng dùng email khác.`
      } else if (errorMsg.includes('duplicate key')) {
        errorMsg = `User này đã tồn tại. Vui lòng dùng email/phone khác.`
      }
      
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // UPDATE lại role='staff' để chắc chắn (phòng trường hợp có trigger ghi đè)
    await supabaseAdmin
      .from('users')
      .update({ role: 'staff' })
      .eq('id', authData.user.id)

    // Thêm permissions (nếu có)
    if (permissions && permissions.length > 0) {
      console.log('Adding permissions:', permissions.length, 'permissions for user', authData.user.id)
      
      const permissionsToInsert = permissions.map((permission: string) => ({
        user_id: authData.user.id,
        permission,
        granted_by: admin_id,
      }))

      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert(permissionsToInsert)

      if (permError) {
        console.error('Error adding permissions:', permError)
        // Trả về lỗi để biết vấn đề
        return NextResponse.json({ 
          error: `User đã tạo nhưng không thể thêm quyền: ${permError.message}` 
        }, { status: 500 })
      }
      
      console.log('Permissions added successfully')
    } else {
      console.log('No permissions to add')
    }

    // Log action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: admin_id,
        action: 'create',
        resource: 'staff',
        resource_id: authData.user.id,
        details: {
          staff_name: full_name,
          staff_email: email,
          permissions_count: permissions?.length || 0,
        },
      })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    })
  } catch (error: any) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
