'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateTrainerProfile(data: {
  full_name: string
  phone: string
  bio: string
  expertise: string
  experience_years: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Yetkisiz')

  const admin = createAdminClient()
  const { error } = await admin
    .from('trainers')
    .update({
      full_name: data.full_name.trim(),
      phone: data.phone.trim() || null,
      bio: data.bio.trim() || null,
      expertise: data.expertise,
      experience_years: data.experience_years,
    })
    .eq('user_id', user.id)

  if (error) throw new Error('Güncelleme başarısız')

  revalidatePath('/dashboard', 'layout')
}
