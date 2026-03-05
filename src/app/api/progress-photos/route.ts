import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!trainer) {
      return NextResponse.json({ error: 'Antrenör bulunamadı' }, { status: 403 })
    }

    const clientId = request.nextUrl.searchParams.get('client_id')
    if (!clientId) {
      return NextResponse.json({ error: 'client_id gerekli' }, { status: 400 })
    }

    // Danışanın bu antrenöre ait olduğunu doğrula
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('trainer_id', trainer.id)
      .maybeSingle()

    if (!client) {
      return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })
    }

    const { data: photos, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: false })

    if (error) {
      console.error('GET /api/progress-photos error:', error)
      return NextResponse.json({ error: 'Fotoğraflar alınamadı' }, { status: 500 })
    }

    return NextResponse.json({ photos: photos ?? [] })
  } catch (error) {
    console.error('GET /api/progress-photos error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!trainer) {
      return NextResponse.json({ error: 'Antrenör bulunamadı' }, { status: 403 })
    }

    const body = await request.json()
    const { client_id, photo_url, angle, taken_at, comment } = body

    if (!client_id || !photo_url || !angle || !taken_at) {
      return NextResponse.json({ error: 'client_id, photo_url, angle ve taken_at zorunludur' }, { status: 400 })
    }

    if (!['front', 'side', 'back'].includes(angle)) {
      return NextResponse.json({ error: 'Geçersiz açı değeri' }, { status: 400 })
    }

    // Danışanın bu antrenöre ait olduğunu doğrula
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('trainer_id', trainer.id)
      .maybeSingle()

    if (!client) {
      return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })
    }

    const { data: photo, error } = await supabase
      .from('progress_photos')
      .insert({
        trainer_id: trainer.id,
        client_id,
        photo_url,
        angle,
        taken_at,
        comment: comment || null,
      })
      .select()
      .single()

    if (error) {
      console.error('POST /api/progress-photos error:', error)
      return NextResponse.json({ error: 'Fotoğraf kaydedilemedi' }, { status: 500 })
    }

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('POST /api/progress-photos error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!trainer) {
      return NextResponse.json({ error: 'Antrenör bulunamadı' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'id zorunludur' }, { status: 400 })
    }

    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', id)
      .eq('trainer_id', trainer.id)

    if (error) {
      console.error('DELETE /api/progress-photos error:', error)
      return NextResponse.json({ error: 'Fotoğraf silinemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/progress-photos error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
