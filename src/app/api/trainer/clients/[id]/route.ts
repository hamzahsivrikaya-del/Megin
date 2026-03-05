import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── DELETE: Danışanı sil ──
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Trainer bilgisini al
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!trainer) {
      return NextResponse.json({ error: 'Eğitmen profili bulunamadı' }, { status: 403 })
    }

    // Danışanın bu eğitmene ait olduğunu doğrula
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', id)
      .eq('trainer_id', trainer.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })
    }

    // Danışanı sil (cascade ile bağlı kayıtlar da silinir)
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Client delete error:', deleteError)
      return NextResponse.json({ error: 'Danışan silinirken bir hata oluştu' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/trainer/clients/[id] error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
