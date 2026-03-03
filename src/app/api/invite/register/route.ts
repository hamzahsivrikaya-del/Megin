import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── POST: Davet ile danışan kaydı ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, full_name, password } = body

    // Validation
    if (!token) {
      return NextResponse.json({ error: 'Davet token gereklidir' }, { status: 400 })
    }

    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json({ error: 'Ad soyad en az 2 karakter olmalıdır' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Token ile danışanı bul
    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('id, email, full_name, invite_accepted')
      .eq('invite_token', token)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Geçersiz davet bağlantısı' }, { status: 400 })
    }

    // Zaten kabul edilmiş mi?
    if (client.invite_accepted) {
      return NextResponse.json({ error: 'Bu davet bağlantısı zaten kullanılmış' }, { status: 400 })
    }

    // Auth user oluştur
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: client.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        role: 'client',
      },
    })

    if (authError) {
      // Email zaten kayıtlı
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 })
      }
      console.error('Auth user create error:', authError)
      return NextResponse.json({ error: 'Hesap oluşturulurken bir hata oluştu' }, { status: 500 })
    }

    // Client kaydını güncelle
    const { error: updateError } = await adminClient
      .from('clients')
      .update({
        user_id: authData.user.id,
        full_name: full_name.trim(),
        invite_accepted: true,
        onboarding_completed: true,
      })
      .eq('id', client.id)

    if (updateError) {
      console.error('Client update error:', updateError)
      return NextResponse.json({ error: 'Kayıt tamamlanırken bir hata oluştu' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/invite/register error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
