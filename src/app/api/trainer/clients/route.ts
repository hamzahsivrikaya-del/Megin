import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInviteToken, normalizeEmail } from '@/lib/utils'

// ── POST: Yeni danışan ekle ──
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Trainer bilgisini al
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id, username')
      .eq('user_id', user.id)
      .single()

    if (trainerError || !trainer) {
      return NextResponse.json({ error: 'Eğitmen profili bulunamadı' }, { status: 403 })
    }

    // Body parse
    const body = await request.json()
    const { full_name, email, phone, gender } = body

    // Validation
    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json({ error: 'Ad soyad en az 2 karakter olmalıdır' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi zorunludur' }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)

    // Bu eğitmenin mevcut danışanlarında email benzersizlik kontrolü
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('trainer_id', trainer.id)
      .eq('email', normalizedEmail)
      .single()

    if (existingClient) {
      return NextResponse.json({ error: 'Bu e-posta adresiyle zaten bir danışan mevcut' }, { status: 409 })
    }

    // Davet token'ı oluştur
    const invite_token = generateInviteToken()

    // Danışanı ekle
    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        trainer_id: trainer.id,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        gender: gender || null,
        invite_token,
        invite_accepted: false,
      })
      .select('id, full_name, email, invite_token')
      .single()

    if (insertError) {
      console.error('Client insert error:', insertError)
      return NextResponse.json({ error: 'Danışan eklenirken bir hata oluştu' }, { status: 500 })
    }

    const inviteUrl = `/${trainer.username}/davet/${invite_token}`

    return NextResponse.json({ client, inviteUrl }, { status: 201 })
  } catch (error) {
    console.error('POST /api/trainer/clients error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// ── GET: Danışan listesi ──
export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Trainer bilgisini al
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (trainerError || !trainer) {
      return NextResponse.json({ error: 'Eğitmen profili bulunamadı' }, { status: 403 })
    }

    // Danışanları paketleriyle birlikte getir
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*, packages(id, total_lessons, used_lessons, status)')
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error('Clients fetch error:', clientsError)
      return NextResponse.json({ error: 'Danışanlar getirilirken bir hata oluştu' }, { status: 500 })
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('GET /api/trainer/clients error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
