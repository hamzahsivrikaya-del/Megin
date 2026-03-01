# İlerleme Fotoğrafları (Önce/Sonra) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin üyenin ilerleme fotoğraflarını yükler (ön/yan/arka), üye ilerleme sayfasında önce/sonra karşılaştırma + o tarihe ait ölçümler görür. AI yorum alanı ileride eklenecek.

**Architecture:** Supabase storage bucket + DB tablosu. Admin, üye detay sayfasından fotoğraf yükler. Üye, ilerleme sayfasında yan yana karşılaştırma görür. Fotoğraf tarihine en yakın ölçümler (±3 gün) otomatik eşleştirilir.

**Tech Stack:** Next.js App Router, Supabase (storage + DB), Tailwind CSS

---

### Task 1: Migration — progress_photos tablosu + storage bucket

**Files:**
- Create: `supabase/migrations/042_progress_photos.sql`

**Step 1: Migration dosyasını oluştur**

```sql
-- Progress photos tablosu
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  angle TEXT NOT NULL CHECK (angle IN ('front', 'side', 'back')),
  taken_at DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Üye kendi fotoğraflarını görebilir
CREATE POLICY "progress_photos_member_select" ON public.progress_photos
  FOR SELECT USING (auth.uid() = user_id);

-- Admin herkesin fotoğraflarını görebilir
CREATE POLICY "progress_photos_admin_select" ON public.progress_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin insert
CREATE POLICY "progress_photos_admin_insert" ON public.progress_photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin delete
CREATE POLICY "progress_photos_admin_delete" ON public.progress_photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_progress_photos_user ON public.progress_photos(user_id);
CREATE INDEX idx_progress_photos_taken_at ON public.progress_photos(taken_at);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Admin upload
CREATE POLICY "progress_photos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin update
CREATE POLICY "progress_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin delete
CREATE POLICY "progress_photos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Public read
CREATE POLICY "progress_photos_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'progress-photos');
```

**Step 2: Push migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/042_progress_photos.sql
git commit -m "feat: progress_photos tablosu ve storage bucket"
```

---

### Task 2: TypeScript types + API route

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/app/api/progress-photos/route.ts`

**Step 1: ProgressPhoto type ekle (types.ts)**

```typescript
export interface ProgressPhoto {
  id: string
  user_id: string
  photo_url: string
  angle: 'front' | 'side' | 'back'
  taken_at: string
  comment: string | null
  created_at: string
}
```

**Step 2: API route oluştur**

`/api/progress-photos/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Üyenin fotoğraflarını getir (üye kendi, admin herkesi)
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

// POST: Fotoğraf kaydı ekle (sadece admin)
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

// DELETE: Fotoğraf sil (sadece admin)
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
```

**Step 3: Commit**

```bash
git add src/lib/types.ts src/app/api/progress-photos/route.ts
git commit -m "feat: progress_photos type ve API route"
```

---

### Task 3: Admin UI — Fotoğraf yükleme (MemberDetail'e yeni tab)

**Files:**
- Modify: `src/app/(admin)/admin/members/[id]/MemberDetail.tsx`
- Modify: `src/app/(admin)/admin/members/[id]/page.tsx`

**Step 1: page.tsx'de progress_photos fetch et**

Server component'te mevcut Promise.all'a ekle:
```typescript
const progressPhotosPromise = supabase
  .from('progress_photos')
  .select('*')
  .eq('user_id', params.id)
  .order('taken_at', { ascending: false })
```

Props'a ekle: `progressPhotos={progressPhotos || []}`

**Step 2: MemberDetail.tsx'e 'photos' tab ekle**

Tab type'a ekle:
```typescript
type Tab = 'overview' | 'measurements' | 'packages' | 'lessons' | 'nutrition' | 'photos'
```

Props'a ekle:
```typescript
progressPhotos: ProgressPhoto[]
```

**Step 3: Photos tab content**

- Tarih bazlı gruplama (aynı taken_at → bir grup)
- Her grup: tarih başlığı + 3 açı fotoğrafı (varsa)
- "Fotoğraf Ekle" butonu → modal açar

**Step 4: Upload modal**

- Tarih seçici (input type="date")
- 3 dosya upload alanı: Ön / Yan / Arka
- Her alan: `accept="image/*" capture="environment"`
- Max 10MB kontrol
- Upload: Supabase storage → public URL → DB insert
- Path pattern: `{user_id}/{taken_at}_{angle}.{ext}`

**Step 5: Commit**

```bash
git add src/app/(admin)/admin/members/[id]/page.tsx src/app/(admin)/admin/members/[id]/MemberDetail.tsx
git commit -m "feat: admin fotoğraf yükleme tab'ı"
```

---

### Task 4: Üye UI — İlerleme sayfasında önce/sonra görünüm

**Files:**
- Modify: `src/app/(member)/dashboard/progress/page.tsx`
- Create: `src/app/(member)/dashboard/progress/ProgressPhotos.tsx`

**Step 1: ProgressPhotos component oluştur**

Props:
```typescript
interface Props {
  photos: ProgressPhoto[]
  measurements: Measurement[]
}
```

Yapı:
- Tarih grupları (en yeni ilk 2 tarih → "sonra" ve "önce")
- Açı sekmeleri: Ön / Yan / Arka
- Yan yana fotoğraf karşılaştırma
- Altında ölçüm farkları kartı (taken_at'e en yakın ölçüm ±3 gün)
- Fark renkleri: hedefe yaklaşma yeşil, uzaklaşma kırmızı
- Comment varsa AI yorum kartı

**Step 2: Ölçüm eşleştirme mantığı**

```typescript
function findClosestMeasurement(measurements: Measurement[], date: string): Measurement | null {
  const target = new Date(date).getTime()
  let closest: Measurement | null = null
  let minDiff = 3 * 24 * 60 * 60 * 1000 // 3 gün

  for (const m of measurements) {
    const diff = Math.abs(new Date(m.date).getTime() - target)
    if (diff < minDiff) {
      minDiff = diff
      closest = m
    }
  }
  return closest
}
```

**Step 3: Fark gösterimi**

```
┌─────────────────────────────────┐
│         Kilo    80 → 75 (-5kg) │
│         Bel     85 → 80 (-5cm) │
│         Göğüs   95 → 100(+5cm) │
│         Kol     32 → 34 (+2cm) │
└─────────────────────────────────┘
```

**Step 4: progress page.tsx'de photos fetch ve component render**

Mevcut page'e:
```typescript
const { data: photos } = await supabase
  .from('progress_photos')
  .select('*')
  .eq('user_id', user.id)
  .order('taken_at', { ascending: false })
```

Grafiklerin üstüne `<ProgressPhotos photos={photos} measurements={measurements} />` ekle.
Fotoğraf yoksa hiçbir şey gösterme.

**Step 5: Commit**

```bash
git add src/app/(member)/dashboard/progress/ProgressPhotos.tsx src/app/(member)/dashboard/progress/page.tsx
git commit -m "feat: üye ilerleme sayfasında önce/sonra fotoğraf görünümü"
```

---

### Task 5: Test ve doğrulama

**Step 1:** Build kontrol: `npx next build`
**Step 2:** Hamza test hesabıyla admin'den fotoğraf yükle
**Step 3:** Üye tarafında ilerleme sayfasında görüntüle
**Step 4:** Ölçüm eşleştirmesinin doğru çalıştığını kontrol et
**Step 5:** Preview deploy: `npx vercel` → Telegram'a gönder
