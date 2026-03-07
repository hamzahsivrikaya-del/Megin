import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Admin kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await request.json()
  const { email: rawEmail, password: rawPassword, full_name, phone, gender, parent_id } = body

  // Türkçe karakterleri ASCII'ye normalize et
  const sanitizedEmail = typeof rawEmail === 'string'
    ? rawEmail.trim()
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .toLowerCase()
    : rawEmail

  // Bağlı üye ise sahte email/şifre oluştur
  const isDependent = !!parent_id
  const email = isDependent ? `child-${crypto.randomUUID()}@megin.local` : sanitizedEmail
  const password = isDependent ? crypto.randomUUID() : rawPassword

  if (!full_name || typeof full_name !== 'string' || full_name.length < 2 || full_name.length > 100) {
    return NextResponse.json({ error: 'Geçerli bir ad soyad girin' }, { status: 400 })
  }
  if (!isDependent && (!email || !password)) {
    return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
  }
  if (!isDependent && typeof password === 'string' && password.length < 6) {
    return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 })
  }
  if (gender && !['male', 'female'].includes(gender)) {
    return NextResponse.json({ error: 'Geçersiz cinsiyet' }, { status: 400 })
  }

  // Service role key ile admin client kullan
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name, role: 'member' },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Profil güncelle (trigger otomatik oluşturur ama phone + gender + parent_id ekleyelim)
  const profileUpdate: Record<string, string> = {}
  if (phone) profileUpdate.phone = phone
  if (gender) profileUpdate.gender = gender
  if (parent_id) profileUpdate.parent_id = parent_id
  if (Object.keys(profileUpdate).length > 0) {
    await adminClient
      .from('users')
      .update(profileUpdate)
      .eq('id', authData.user.id)
  }

  // Bağlı üye ise onay maili gönderme
  if (!isDependent) {
    await adminClient.auth.resend({
      type: 'signup',
      email,
    })
  }

  return NextResponse.json({ id: authData.user.id }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Admin kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
  }

  // Kendini silmeyi engelle
  if (userId === user.id) {
    return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
  }

  // Auth kullanıcısını sil (CASCADE ile tüm veriler silinir)
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
