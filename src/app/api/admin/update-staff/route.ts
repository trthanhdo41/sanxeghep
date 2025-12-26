import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
    
    const { staff_id, full_name, phone, password, permissions, admin_id } = await request.json()

    // Cập nhật thông tin staff
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        phone: phone || null,
      })
      .eq('id', staff_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Cập nhật password nếu có
    if (password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        staff_id,
        { password }
      )
      if (passwordError) {
        return NextResponse.json({ error: passwordError.message }, { status: 400 })
      }
    }

    // Xóa permissions cũ
    await supabaseAdmin
      .from('user_permissions')
      .delete()
      .eq('user_id', staff_id)

    // Thêm permissions mới
    if (permissions && permissions.length > 0) {
      const permissionsToInsert = permissions.map((permission: string) => ({
        user_id: staff_id,
        permission,
        granted_by: admin_id,
      }))

      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert(permissionsToInsert)

      if (permError) {
        return NextResponse.json({ error: permError.message }, { status: 400 })
      }
    }

    // Log action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: admin_id,
        action: 'update',
        resource: 'staff',
        resource_id: staff_id,
        details: {
          staff_name: full_name,
          permissions_count: permissions?.length || 0,
        },
      })

    return NextResponse.json({ 
      success: true,
    })
  } catch (error: any) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
