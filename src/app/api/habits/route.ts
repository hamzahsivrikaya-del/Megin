import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyTrainer, notifyClient } from '@/lib/trainer-notify'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return session.user
}

async function getClientByUserId(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

async function getTrainerByUserId(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('trainers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

// GET /api/habits?clientId=xxx&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const requestedClientId = request.nextUrl.searchParams.get('clientId')
  const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]

  let clientId: string

  if (requestedClientId) {
    // Trainer kendi danışanını görüyor
    const trainer = await getTrainerByUserId(user.id)
    if (!trainer) {
      // Belki client kendi verisini istiyor
      const client = await getClientByUserId(user.id)
      if (!client || client.id !== requestedClientId) {
        return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      }
      clientId = client.id
    } else {
      // Trainer'ın danışanı mı kontrol et
      const { data: cl } = await admin
        .from('clients')
        .select('id')
        .eq('id', requestedClientId)
        .eq('trainer_id', trainer.id)
        .maybeSingle()
      if (!cl) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })
      clientId = requestedClientId
    }
  } else {
    // Client kendi verisini çekiyor
    const client = await getClientByUserId(user.id)
    if (!client) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })
    clientId = client.id
  }

  // Aktif alışkanlıklar + tanımlar
  const { data: habits } = await admin
    .from('client_habits')
    .select('id, habit_id, custom_name, assigned_by, habit_definitions(name, category, icon, is_avoidance, order_num)')
    .eq('client_id', clientId)
    .eq('is_active', true)

  // Bugünkü loglar
  const { data: logs } = await admin
    .from('habit_logs')
    .select('id, client_habit_id, completed')
    .eq('client_id', clientId)
    .eq('date', date)

  // Son 90 gün loglar (streak hesaplama için)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: recentLogs } = await admin
    .from('habit_logs')
    .select('client_habit_id, date, completed')
    .eq('client_id', clientId)
    .gte('date', ninetyDaysAgo)
    .order('date', { ascending: false })

  return NextResponse.json({
    habits: habits || [],
    logs: logs || [],
    recentLogs: recentLogs || [],
  })
}

// POST /api/habits
export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await request.json()

  // Setup: Client alışkanlık seçimi
  if (body.action === 'setup') {
    const client = await getClientByUserId(user.id)
    if (!client) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })

    const habitIds: string[] = body.habitIds
    if (!habitIds || habitIds.length === 0) {
      return NextResponse.json({ error: 'En az 1 alışkanlık seçin' }, { status: 400 })
    }

    // Mevcut kendi seçimlerini bul
    const { data: existing } = await admin
      .from('client_habits')
      .select('id, habit_id')
      .eq('client_id', client.id)
      .is('assigned_by', null)

    const existingMap = new Map((existing || []).map(e => [e.habit_id, e.id]))
    const newSet = new Set(habitIds)

    // Kaldırılanları soft-delete
    const toDeactivate = (existing || []).filter(e => !newSet.has(e.habit_id)).map(e => e.id)
    if (toDeactivate.length > 0) {
      await admin.from('client_habits').update({ is_active: false }).in('id', toDeactivate)
    }

    // Daha önce pasif yapılmışları tekrar aktif et
    const toReactivate: string[] = []
    const toInsert: string[] = []
    for (const hid of habitIds) {
      if (existingMap.has(hid)) {
        toReactivate.push(existingMap.get(hid)!)
      } else {
        const { data: inactive } = await admin
          .from('client_habits')
          .select('id')
          .eq('client_id', client.id)
          .eq('habit_id', hid)
          .eq('is_active', false)
          .is('assigned_by', null)
          .limit(1)
        if (inactive && inactive.length > 0) {
          toReactivate.push(inactive[0].id)
        } else {
          toInsert.push(hid)
        }
      }
    }

    if (toReactivate.length > 0) {
      await admin.from('client_habits').update({ is_active: true }).in('id', toReactivate)
    }

    const inserts = toInsert.map((hid: string) => ({
      client_id: client.id,
      habit_id: hid,
      is_active: true,
    }))

    if (inserts.length > 0) {
      const { error } = await admin.from('client_habits').insert(inserts)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  // Log kaydet (client)
  if (body.action === 'log') {
    const client = await getClientByUserId(user.id)
    if (!client) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })

    const { clientHabitId, date, completed } = body

    const { error } = await admin
      .from('habit_logs')
      .upsert(
        {
          client_id: client.id,
          client_habit_id: clientHabitId,
          date,
          completed,
        },
        { onConflict: 'client_habit_id,date' }
      )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Bildirim kontrolleri (arka planda, response'u bekletmeden)
    if (completed) {
      checkHabitNotifications(admin, client.id, client.trainer_id, date).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  }

  // Trainer: Alışkanlık ata
  if (body.action === 'assign') {
    const trainer = await getTrainerByUserId(user.id)
    if (!trainer) return NextResponse.json({ error: 'Antrenör bulunamadı' }, { status: 403 })

    const { clientId, habitId } = body
    if (!clientId || !habitId) {
      return NextResponse.json({ error: 'clientId ve habitId gerekli' }, { status: 400 })
    }

    // Danışan bu trainer'a ait mi?
    const { data: cl } = await admin
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('trainer_id', trainer.id)
      .maybeSingle()
    if (!cl) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })

    // Zaten atanmış mı?
    const { data: existingHabit } = await admin
      .from('client_habits')
      .select('id, is_active')
      .eq('client_id', clientId)
      .eq('habit_id', habitId)
      .limit(1)

    if (existingHabit && existingHabit.length > 0) {
      if (!existingHabit[0].is_active) {
        await admin.from('client_habits').update({ is_active: true, assigned_by: trainer.id }).eq('id', existingHabit[0].id)
      }
      return NextResponse.json({ ok: true })
    }

    const { error } = await admin.from('client_habits').insert({
      client_id: clientId,
      habit_id: habitId,
      is_active: true,
      assigned_by: trainer.id,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Trainer: Alışkanlık kaldır (soft-delete)
  if (body.action === 'deactivate') {
    const trainer = await getTrainerByUserId(user.id)
    if (!trainer) return NextResponse.json({ error: 'Antrenör bulunamadı' }, { status: 403 })

    const { clientHabitId } = body
    if (!clientHabitId) {
      return NextResponse.json({ error: 'clientHabitId gerekli' }, { status: 400 })
    }

    // client_habit'in trainer'ın danışanına ait olduğunu doğrula
    const { data: habit } = await admin
      .from('client_habits')
      .select('id, client_id, clients!inner(trainer_id)')
      .eq('id', clientHabitId)
      .maybeSingle()

    if (!habit || (habit as any).clients?.trainer_id !== trainer.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 })
    }

    const { error } = await admin
      .from('client_habits')
      .update({ is_active: false })
      .eq('id', clientHabitId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 })
}

// Alışkanlık tamamlama + streak milestone bildirimleri
async function checkHabitNotifications(
  admin: ReturnType<typeof createAdminClient>,
  clientId: string,
  trainerId: string,
  date: string
) {
  // Trainer + client bilgilerini al
  const { data: trainerData } = await admin
    .from('trainers')
    .select('id, user_id')
    .eq('id', trainerId)
    .maybeSingle()
  if (!trainerData) return

  const { data: clientData } = await admin
    .from('clients')
    .select('id, user_id, full_name')
    .eq('id', clientId)
    .maybeSingle()
  if (!clientData) return

  // Aktif alışkanlık sayısı
  const { count: totalHabits } = await admin
    .from('client_habits')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('is_active', true)

  // Bugün tamamlanan sayısı
  const { count: completedToday } = await admin
    .from('habit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('date', date)
    .eq('completed', true)

  if (!totalHabits || !completedToday) return

  // Tüm alışkanlıklar tamamlandı mı?
  if (completedToday >= totalHabits) {
    // Dedup: bugün bu bildirim gitti mi?
    const { data: existing } = await admin
      .from('notifications')
      .select('id')
      .eq('trainer_id', trainerId)
      .eq('client_id', clientId)
      .eq('type', 'client_habits_completed')
      .gte('sent_at', `${date}T00:00:00`)
      .limit(1)

    if (!existing || existing.length === 0) {
      await notifyTrainer({
        trainerId: trainerData.id,
        trainerUserId: trainerData.user_id,
        type: 'client_habits_completed',
        title: 'Alışkanlıklar Tamamlandı',
        message: `${clientData.full_name} bugün tüm alışkanlıklarını tamamladı!`,
        clientId,
      })
    }

    // Streak hesapla
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: recentLogs } = await admin
      .from('habit_logs')
      .select('date, completed')
      .eq('client_id', clientId)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: false })

    if (recentLogs) {
      const dates = [...new Set(recentLogs.map(l => l.date))].sort((a, b) => b.localeCompare(a))
      let streak = 0
      for (const d of dates) {
        if (d > date) continue
        const dayCompleted = recentLogs.filter(l => l.date === d && l.completed).length
        if (dayCompleted >= totalHabits) streak++
        else if (d === date) continue
        else break
      }

      // Milestone kontrolü (7, 14, 30)
      const milestones = [7, 14, 30]
      for (const milestone of milestones) {
        if (streak === milestone) {
          // Dedup
          const { data: existingMilestone } = await admin
            .from('notifications')
            .select('id')
            .eq('trainer_id', trainerId)
            .eq('client_id', clientId)
            .eq('type', 'client_streak_milestone')
            .gte('sent_at', `${date}T00:00:00`)
            .limit(1)

          if (!existingMilestone || existingMilestone.length === 0) {
            await notifyTrainer({
              trainerId: trainerData.id,
              trainerUserId: trainerData.user_id,
              type: 'client_streak_milestone',
              title: 'Streak Milestone!',
              message: `${clientData.full_name} ${milestone} günlük seriye ulaştı!`,
              clientId,
              data: { milestone },
            })

            // Danışana da kutlama
            if (clientData.user_id) {
              await notifyClient({
                clientUserId: clientData.user_id,
                trainerId: trainerData.id,
                clientId,
                type: 'streak_celebration',
                title: 'Tebrikler!',
                message: `${milestone} günlük seriye ulaştın! Harika gidiyorsun!`,
                data: { milestone },
              })
            }
          }
        }
      }
    }
  }
}
