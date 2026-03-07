# UI Düzenlemeleri + Süper Set + Blog Editörü + Badge Renkleri

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Landing navbar temizleme, üye navbar yeniden tasarım, antrenman süper set desteği, blog zengin editör ve ders badge renk gradyanı.

**Architecture:** 5 bağımsız görev: (1) LandingNavbar sol üst logo kaldır, (2) Üye Navbar'ı daha şık tasarla, (3) workout_exercises tablosuna superset_group kolonu ekle + admin UI + gösterim, (4) Blog editörüne Tiptap rich text editor entegre et, (5) MembersList + Dashboard badge'lerini yeşil→sarı→kırmızı gradyan yap.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Supabase, Tiptap (rich text editor)

---

## Task 1: LandingNavbar — Sol Üst Logo Kaldır

**Files:**
- Modify: `src/components/shared/LandingNavbar.tsx:21`

**Step 1: Logo kaldır**

LandingNavbar.tsx satır 21'deki logo linkini kaldır:

```tsx
// ÖNCE:
<Link href="/" className="font-display text-xl tracking-wider text-primary">
  HAMZA SİVRİKAYA
</Link>

// SONRA: Kaldır, yerine boş bir div koy (flex layout bozulmasın)
<div />
```

**Step 2: Verify**
Dev server'da landing page'e git, sol üstte logo olmadığını doğrula.

---

## Task 2: Üye Navbar — Daha Cazip Tasarım (frontend-design skill)

**Files:**
- Modify: `src/components/shared/Navbar.tsx`

**Mevcut durum:** Sol üstte kırmızı "HS" kutusu + "megin.ai" text var. Kaba görünüyor.

**Hedef tasarım:** Minimal, şık bir ana sayfa dönüş butonu. Küçük bir home ikonu veya stilize "H" logosu ile soft hover efekti.

**Step 1: Navbar sol tarafını yeniden tasarla**

frontend-design skill kullanarak:
- "HS" box + "megin.ai" yerine daha minimal ve şık bir tasarım
- Küçük boyutlu, zarif hover efekti olan bir home ikonu
- Mobilde de iyi görünmeli

**Step 2: Verify**
Üye panelinde sol üst köşe görselini kontrol et.

---

## Task 3: Süper Set Desteği — Antrenman Sistemi

**Files:**
- Create: `supabase/migrations/010_superset_group.sql`
- Modify: `src/lib/types.ts` — WorkoutExercise'a `superset_group` ekle
- Modify: `src/app/(admin)/admin/workouts/WorkoutManager.tsx` — ExerciseForm'a superset desteği
- Modify: `src/components/shared/WorkoutDayCard.tsx` — Süper set gösterimi

### Yaklaşım
Egzersizlere `superset_group` (smallint, nullable) alanı eklenir. Aynı `superset_group` numarasına sahip egzersizler birlikte süper set olarak gösterilir. NULL ise normal egzersizdir.

**Step 1: Migration oluştur**

```sql
-- 010_superset_group.sql
ALTER TABLE workout_exercises ADD COLUMN superset_group smallint;
```

**Step 2: Migration'ı push et**

```bash
supabase db push
```

**Step 3: TypeScript tipini güncelle**

`src/lib/types.ts` - WorkoutExercise interface'ine ekle:
```typescript
superset_group: number | null
```

**Step 4: ExerciseForm'a superset_group ekle**

WorkoutManager.tsx'te:
- ExerciseForm interface'ine `superset_group: string` ekle
- emptyExercise'e `superset_group: ''` ekle
- Her egzersiz satırına "Süper Set Grubu" seçeneği ekle (dropdown veya toggle)
- Aynı grup numarasındaki egzersizler görsel olarak birleştirilsin (sol kenarda renkli çizgi)

Admin UI tasarımı:
- Egzersiz satırlarının yanında küçük bir "SS" toggle butonu
- Toggle'a basınca grup numarası otomatik atansın
- Aynı gruptaki egzersizler sol kenarda renkli bar ile bağlansın
- Sürükle-bırak gerekmez, sadece grup numarası ataması yeterli

**Step 5: WorkoutDayCard'da süper set gösterimi**

Aynı superset_group'a sahip egzersizleri:
- Sol kenarda dikey kırmızı çizgi ile bağla
- "Süper Set" etiketi göster
- Egzersizler arası normal ayırıcı çizgi yerine + işareti

**Step 6: Kaydet modalında superset_group'u persist et**

WorkoutManager handleSave fonksiyonunda exercise insert'e `superset_group` ekle.

**Step 7: Verify**
Admin panelinde antrenman oluştur, 2 egzersizi süper set olarak işaretle, public/üye sayfasında doğru göründüğünü kontrol et.

---

## Task 4: Blog Zengin Editör (frontend-design skill)

**Files:**
- Modify: `package.json` — Tiptap bağımlılıkları ekle
- Modify: `src/app/(admin)/admin/blog/BlogManager.tsx` — Textarea yerine Tiptap editör
- Create: `src/components/shared/RichTextEditor.tsx` — Tiptap wrapper component
- Modify: `src/app/blog/[slug]/page.tsx` — HTML render (şu an markdown)

### Tiptap Kurulumu

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-heading @tiptap/extension-text-align
```

**Step 1: RichTextEditor component oluştur**

Props: `content: string`, `onChange: (html: string) => void`

Toolbar butonları:
- **Bold / Italic / Underline** — temel formatlama
- **H2 / H3** — başlıklar
- **Renk seçici** — metin rengi (birkaç preset: beyaz, kırmızı, turuncu, mavi, yeşil)
- **Görsel ekle** — URL input ile (Supabase Storage sonradan eklenebilir)
- **Liste** — madde işareti
- **Hizalama** — sol, orta, sağ

Tasarım: Dark tema uyumlu, toolbar surface renginde, editör alanı background renginde.

**Step 2: BlogManager'da Textarea'yı RichTextEditor ile değiştir**

```tsx
// ÖNCE:
<Textarea label="İçerik (Markdown)" ... />

// SONRA:
<RichTextEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} />
```

**Step 3: Blog görüntüleme sayfasını güncelle**

`src/app/blog/[slug]/page.tsx` — content'i markdown parse yerine `dangerouslySetInnerHTML` ile render et (Tiptap HTML çıktısı verir). Prose styling ekle.

**Step 4: Verify**
Blog editöründe yazı yaz, bold/italic/renk/görsel ekle, kaydet, blog sayfasında doğru göründüğünü kontrol et.

---

## Task 5: Badge Renk Gradyanı — Ders Sayısı

**Files:**
- Modify: `src/app/(admin)/admin/members/MembersList.tsx:157`
- Modify: `src/app/(member)/dashboard/page.tsx:56-75`

### Mantık

Mevcut paket total_lessons'a göre remaining oranını hesapla:
- `remaining > total * 0.5` → **yeşil** (success) — "Aktif"
- `remaining > total * 0.25 && remaining <= total * 0.5` → **sarı** (warning) — "Azalıyor"
- `remaining <= total * 0.25 && remaining > 0` → **kırmızı** (danger) — "Son X Ders"
- `remaining === 0` → **kırmızı** (danger) — "Bitti"
- Paket yoksa → **default** — "Paket Yok"

8 ders örneği:
- 8-5 kalan → yeşil
- 4-3 kalan → sarı
- 2-1 kalan → kırmızı
- 0 → kırmızı

**Step 1: MembersList badge'ini güncelle**

```tsx
// Satır 157 civarı
const ratio = activePackage ? remaining / activePackage.total_lessons : 0
const badgeVariant = !activePackage ? 'default'
  : remaining <= 0 ? 'danger'
  : ratio <= 0.25 ? 'danger'
  : ratio <= 0.5 ? 'warning'
  : 'success'
```

**Step 2: Dashboard badge'ini güncelle**

```tsx
// Satır 56-75 civarı — aynı mantık
if (remaining <= 0) { statusLabel = 'Bitti'; statusVariant = 'danger' }
else if (ratio <= 0.25) { statusLabel = `Son ${remaining} Ders`; statusVariant = 'danger' }
else if (ratio <= 0.5) { statusLabel = 'Azalıyor'; statusVariant = 'warning' }
else { statusLabel = 'Aktif'; statusVariant = 'success' }
```

**Step 3: Verify**
8 ders paketi ile test: 8 kalan → yeşil, 4 kalan → sarı, 2 kalan → kırmızı kontrol et.

---

## Task 6: Commit

```bash
git add -A
git commit -m "feat: navbar düzenlemeleri + süper set + blog editör + badge renkleri"
```
