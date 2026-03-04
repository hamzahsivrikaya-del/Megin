# Beslenme Bugfix: Uyum Takibi + iOS Zoom

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Beslenme takibinde "uydum/uymadim" iki butonlu sisteme gec ve iOS zoom bugini duzelt.

**Architecture:** BeslenmeClient.tsx'de tek toggle yerine iki butonlu (uydum/uymadim) sistem. Non-compliant ogunler kirmizi arka planla gosterilecek. Progress bar ve 14 gun grid'i sadece compliant ogunleri sayacak. iOS zoom icin input font-size 16px'e cikarilacak.

**Tech Stack:** React, Supabase, Tailwind CSS

---

### Task 1: Ogun Toggle'i Iki Butonlu Sisteme Cevir

**Files:**
- Modify: `src/app/(member)/dashboard/beslenme/BeslenmeClient.tsx`

**Step 1: handleMealToggle fonksiyonunu iki durumlu yap**

Mevcut `handleMealToggle(meal)` fonksiyonunu `handleMealStatus(meal, status)` olarak degistir:

```typescript
async function handleMealStatus(meal: MemberMeal, status: 'compliant' | 'non_compliant') {
  const existingLog = normalLogs.find(l => l.meal_id === meal.id)
  setSaving(meal.id)
  const supabase = createClient()

  if (existingLog && existingLog.status === status) {
    // Ayni duruma tekrar tiklanirsa geri al (sil)
    const { error } = await supabase.from('meal_logs').delete().eq('id', existingLog.id)
    if (!error) setLogs(prev => prev.filter(l => l.id !== existingLog.id))
  } else if (existingLog) {
    // Farkli duruma gecis (compliant -> non_compliant veya tersi)
    const { data, error } = await supabase
      .from('meal_logs')
      .update({ status })
      .eq('id', existingLog.id)
      .select()
      .single()
    if (!error && data) {
      setLogs(prev => prev.map(l => l.id === existingLog.id ? data as MealLog : l))
      setSuccessMsg(status === 'compliant' ? 'Uydum' : 'Uymadim')
      setTimeout(() => setSuccessMsg(null), 2000)
    }
  } else {
    // Yeni log olustur
    const { data, error } = await supabase
      .from('meal_logs')
      .upsert(
        {
          user_id: userId,
          date: selectedDate,
          meal_id: meal.id,
          status,
          is_extra: false,
        },
        { onConflict: 'user_id,date,meal_id' }
      )
      .select()
      .single()
    if (!error && data) {
      setLogs(prev => [...prev, data as MealLog])
      setSuccessMsg(status === 'compliant' ? 'Uydum' : 'Uymadim')
      setTimeout(() => setSuccessMsg(null), 2000)
    }
  }
  setSaving(null)
}
```

**Step 2: Ogun karti UI'ini iki butonlu yap**

Mevcut tek checkbox yerine iki buton koy. Her ogun kartinda:

```tsx
{memberMeals.map((meal) => {
  const log = normalLogs.find(l => l.meal_id === meal.id)
  const isCompliant = log?.status === 'compliant'
  const isNonCompliant = log?.status === 'non_compliant'
  const isExpanded = expandedMeal === meal.id
  const noteValue = notes[meal.id] ?? log?.note ?? ''

  return (
    <div
      key={meal.id}
      className={`rounded-xl border transition-all duration-200 animate-fade-up ${
        isCompliant
          ? 'bg-success/5 border-success/30'
          : isNonCompliant
          ? 'bg-red-50 border-red-200'
          : 'bg-surface border-border'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Uydum butonu */}
        <button
          onClick={() => handleMealStatus(meal, 'compliant')}
          disabled={saving !== null}
          className="flex-shrink-0 cursor-pointer disabled:opacity-50"
          aria-label="Uydum"
        >
          {saving === meal.id ? (
            <div className="w-6 h-6 flex items-center justify-center"><Spinner /></div>
          ) : (
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isCompliant ? 'bg-success' : 'border-2 border-border hover:border-success/50'
            }`}>
              {isCompliant && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
        </button>

        {/* Ogun adi */}
        <span className={`flex-1 text-sm font-medium ${
          isCompliant ? 'text-success' : isNonCompliant ? 'text-red-500' : 'text-text-primary'
        }`}>
          {meal.name}
        </span>

        {/* Uymadim butonu */}
        <button
          onClick={() => handleMealStatus(meal, 'non_compliant')}
          disabled={saving !== null}
          className="flex-shrink-0 cursor-pointer disabled:opacity-50"
          aria-label="Uymadim"
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            isNonCompliant ? 'bg-red-500' : 'border-2 border-border hover:border-red-300'
          }`}>
            {isNonCompliant && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </button>

        {/* Aksiyon ikonlari (log varsa goster - compliant veya non_compliant) */}
        {log && (
          <div className="flex items-center gap-1">
            {/* Foto butonu - AYNI */}
            ...
            {/* Not butonu - AYNI */}
            ...
          </div>
        )}
      </div>

      {/* Expanded + Collapsed notlar - AYNI, sadece `isCompleted` yerine `!!log` kullan */}
      ...
    </div>
  )
})}
```

**Step 3: Progress bar hesaplamasini guncelle**

Sadece `compliant` ogunleri say:

```typescript
const compliantCount = normalLogs.filter(l => l.status === 'compliant').length
const completionRatio = totalMeals > 0 ? compliantCount / totalMeals : 0
```

Progress bar metnini de guncelle:
```tsx
<span className="text-sm font-semibold text-text-primary">
  {compliantCount}/{totalMeals} ogun uyumlu
</span>
```

**Step 4: 14 gun grid hesaplamasini guncelle**

`past14Days` useMemo icinde `completed` yerine `compliant` say:

```typescript
const past14Days = useMemo(() => {
  const days: { date: string; compliant: number; total: number; hasExtra: boolean }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today + 'T00:00:00')
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d)
    const dayNormal = logs.filter(l => l.date === ds && !l.is_extra)
    const dayCompliant = dayNormal.filter(l => l.status === 'compliant')
    const dayExtra = logs.filter(l => l.date === ds && l.is_extra)
    days.push({ date: ds, compliant: dayCompliant.length, total: mealCount, hasExtra: dayExtra.length > 0 })
  }
  return days
}, [logs, today, mealCount])
```

Grid render'da `completed` -> `compliant` olarak guncelle.

**Step 5: Detay modali guncelle**

`detailDayData` hesaplamasinda compliant sayisini ayir:

```typescript
const detailDayData = useMemo(() => {
  if (!detailDay) return null
  const dayAll = logs.filter(l => l.date === detailDay)
  const normal = dayAll.filter(l => !l.is_extra)
  const extra = dayAll.filter(l => l.is_extra)
  const compliant = normal.filter(l => l.status === 'compliant').length
  return { normal, extra, compliant, total: mealCount }
}, [detailDay, logs, mealCount])
```

Modal icinde her ogun kartini duruma gore renklendir:
- `compliant` -> yesil arka plan (mevcut)
- `non_compliant` -> kirmizi arka plan (`bg-red-50 border-red-200`)
- Girilmemis -> gri (mevcut)

**Step 6: Foto yuklemede status parametresi**

`handlePhotoUpload` icindeki log yoksa olustur kismi — foto yukleme otomatik olarak `compliant` olarak kaydediyor. Bu mantikli cunku uye foto cekiyorsa uymus demektir. DEGISTIRME.

**Step 7: Commit**

```bash
git add src/app/(member)/dashboard/beslenme/BeslenmeClient.tsx
git commit -m "fix: beslenme uydum/uymadim iki butonlu sistem"
```

---

### Task 2: Dashboard Beslenme Kartini Guncelle

**Files:**
- Modify: `src/app/(member)/dashboard/page.tsx`

**Step 1: Dashboard kartinda compliant/non_compliant goster**

Mevcut kod sadece log var mi yok mu bakiyor. Duruma gore renklendirmeli:

```tsx
{(memberMeals as MemberMeal[]).map((meal) => {
  const log = todayMeals?.find((m: { meal_id: string; status: string }) => m.meal_id === meal.id)
  return (
    <div key={meal.id} className={`flex-1 min-w-0 text-center py-2 rounded-lg text-xs font-medium truncate px-1 ${
      log?.status === 'compliant' ? 'bg-green-100 text-green-700'
        : log?.status === 'non_compliant' ? 'bg-red-100 text-red-600'
        : 'bg-red-50 text-text-secondary'
    }`}>
      {meal.name}
    </div>
  )
})}
```

Alt kisimda tamamlanma mesaji:
```tsx
const compliantToday = todayMeals?.filter((m: { status: string }) => m.status === 'compliant').length || 0
// ...
<p className="text-xs text-text-secondary mt-2">
  {compliantToday}/{memberMeals.length} ogun uyumlu
</p>
```

**Step 2: Commit**

```bash
git add src/app/(member)/dashboard/page.tsx
git commit -m "fix: dashboard beslenme kartinda uyum durumu goster"
```

---

### Task 3: iOS Zoom Bugini Duzelt

**Files:**
- Modify: `src/app/(member)/dashboard/beslenme/BeslenmeClient.tsx`

**Step 1: Extra ogun formundaki input'lari duzelt**

Satir 572-587 arasi:

```tsx
{/* Extra form */}
{showExtraForm ? (
  <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
    <input
      type="text"
      value={extraForm.name}
      onChange={(e) => setExtraForm(prev => ({ ...prev, name: e.target.value }))}
      placeholder="Ogun basligi..."
      className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
      maxLength={100}
    />
    <textarea
      value={extraForm.note}
      onChange={(e) => setExtraForm(prev => ({ ...prev, note: e.target.value }))}
      placeholder="Not (opsiyonel)..."
      rows={2}
      className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
    />
    ...
  </div>
)}
```

Degisiklikler:
- `text-sm` -> `text-base` (14px -> 16px, iOS zoom onlenir)
- `autoFocus` kaldirildi (iOS'ta form acilinca otomatik zoom yapmaz)

**Step 2: Not textarea'sini da duzelt**

Satir 510-515 arasi, ogun notu textarea'si:

```tsx
<textarea
  value={noteValue}
  onChange={(e) => setNotes(prev => ({ ...prev, [meal.id]: e.target.value }))}
  placeholder="Ogunle ilgili not ekle..."
  rows={2}
  className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
/>
```

`text-sm` -> `text-base`

**Step 3: Commit**

```bash
git add src/app/(member)/dashboard/beslenme/BeslenmeClient.tsx
git commit -m "fix: iOS zoom bugini duzelt (input font-size 16px)"
```

---

### Task 4: Dogrulama

**Step 1: Dev server'da kontrol**

```bash
npm run dev
```

Kontrol listesi:
- [ ] Beslenme sayfasinda her ogunun yaninda uydum (yesil tik) ve uymadim (kirmizi x) butonlari gorunuyor
- [ ] Uydum'a tiklaninca yesil arka plan
- [ ] Uymadim'a tiklaninca kirmizi arka plan
- [ ] Ayni butona tekrar tiklaninca geri aliniyor (siliyor)
- [ ] Progress bar sadece compliant ogunleri sayiyor
- [ ] 14 gun grid'de renkler dogru
- [ ] Detay modalinda uyum durumu gorsel olarak ayirt ediliyor
- [ ] Dashboard kartinda yesil/kirmizi/gri ayrim gorseliyor
- [ ] Ekstra ogun formunda zoom olmuyor (iOS simulator veya gercek cihaz)
- [ ] Ekstra ogun eklenip form kapandiktan sonra sayfa normal

**Step 2: Preview deploy + Telegram**

```bash
npx vercel
# URL'yi Telegram'a gonder
```

---

### Etkilenmeyen Kisimlar (Degisiklik Gerektirmiyor)

- **Haftalik rapor cron** (`weekly-report/route.ts`): Zaten `status === 'compliant'` filtresi var, dogru calisiyor
- **Rozet hesaplama** (`badges/route.ts`): `weekly_reports.nutrition_compliance` kullaniyor, dogru calisiyor
- **Admin beslenme tab'i** (`MemberDetail.tsx`): Zaten `status === 'compliant'` ile hesapliyor
- **Extra ogunler**: Tamamlanma oranini zaten etkilemiyor (`is_extra` filtresi var)
