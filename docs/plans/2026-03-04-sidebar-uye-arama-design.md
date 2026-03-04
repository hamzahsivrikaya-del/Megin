# Sidebar Üye Arama

## Amaç
Admin (PT) her sayfadan üye detayına 1 tıklamayla ulaşabilsin. Şu an: Sidebar → Üyeler → listeden bul → tıkla (3 tıklama). Hedef: Arama kutusuna yaz → tıkla (1 tıklama).

## Konum
Sidebar'da, logo/başlık altında, menü öğelerinden hemen önce.

## Davranış
- Input'a yazınca aktif üyeler arasında anlık filtreleme (client-side)
- Sonuçlar dropdown olarak input altında (max 5 sonuç)
- Üye ismine tıkla → `/admin/members/[id]` sayfasına git
- ESC veya dışarı tıkla → dropdown kapanır
- Boş input → dropdown gizli
- Mobilde hamburger menü açılınca aynı şekilde görünür

## Teknik
- **Dosya:** `src/components/shared/Sidebar.tsx` (veya yeni `MemberSearch.tsx` client component)
- **Veri:** Mount'ta `users` tablosundan aktif üyeleri çek (`id`, `full_name`, `role=member`, `is_active=true`)
- **Filtreleme:** Client-side, case-insensitive `includes` — Türkçe karakter uyumlu (`toLocaleLowerCase('tr')`)
- **Yönlendirme:** `useRouter().push('/admin/members/${id}')` + input temizle + dropdown kapat
- **Stil:** Kırmızı çerçeveli input (`border-primary/30`), dropdown `bg-surface` + `shadow-lg`

## Değiştirilecek Dosyalar
1. `src/components/shared/Sidebar.tsx` — arama component'ını ekle
2. Yeni: `src/components/shared/MemberSearch.tsx` — client component (useState, useEffect, useRouter)
