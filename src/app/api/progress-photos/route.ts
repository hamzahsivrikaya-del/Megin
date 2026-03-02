import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Üyenin fotoğraflarını getir
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = req.nextUrl.searchParams.get('user_id') || user.id

  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Fotoğraf kaydı ekle (admin)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, photo_url, angle, taken_at, comment } = await req.json()

  if (!user_id || !photo_url || !angle || !taken_at) {
    return NextResponse.json({ error: 'user_id, photo_url, angle, taken_at required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('progress_photos')
    .insert({ user_id, photo_url, angle, taken_at, comment })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE: Fotoğraf sil (admin)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
