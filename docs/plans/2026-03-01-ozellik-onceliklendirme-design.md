# Özellik Önceliklendirme — Rakip Analizi Sonrası

**Tarih:** 2026-03-01
**Durum:** Brainstorming aşamasında — kullanıcı girdisi bekleniyor
**Kaynak:** `.claude/reports/rakip-analizi-2026-03-01.md`

---

## Bağlam

4 rakip platform (ABC Trainerize, Everfit, TrueCoach, My PT Hub) derinlemesine analiz edildi. Hamza PT'nin güçlü ve eksik yanları belirlendi. Bu dosya, eksik özelliklerin önceliklendirilmesi ve nereye (landing page / üye paneli / admin paneli) ekleneceğinin tasarımı için kullanılacak.

## Rakip Analizinden Çıkan Potansiyel Özellikler

### Platform Bölümleri
- **Landing Page (Public):** megin.ai — SEO, dönüşüm, güven
- **Üye Paneli:** /dashboard/* — Üye deneyimi, bağlılık, motivasyon
- **Admin Paneli:** /admin/* — Antrenör verimliliği, üye yönetimi
- **Public Araçlar:** /araclar/*, /antrenmanlar/, /blog/* — SEO, keşif

### Tüm Aday Özellikler (Henüz Önceliklendirilmedi)

| # | Özellik | Olası Konum | Zorluk | Kaynak |
|---|---------|-------------|--------|--------|
| 1 | Alışkanlık/görev takibi (su, uyku, adım + streak) | Üye paneli + Admin | Düşük-Orta | Hepsinde var |
| 2 | Compliance tracking (7/30/90 gün uyum oranı) | Üye paneli + Admin | Düşük | TrueCoach, My PT Hub |
| 3 | İlerleme fotoğrafı (ön/yan/arka + slider karşılaştırma) | Üye paneli + Admin | Orta | Hepsinde var |
| 4 | Otomatik onboarding akışı | Üye paneli + Admin | Düşük-Orta | Hepsinde var |
| 5 | Uygulama içi mesajlaşma (chat) | Üye paneli + Admin | Orta | Hepsinde var |
| 6 | Check-in formları (haftalık kilo/enerji/uyku/foto) | Üye paneli + Admin | Orta | Everfit, My PT Hub |
| 7 | Egzersiz kütüphanesi (video/GIF'li) | Admin + Üye paneli | Orta-Yüksek | Hepsinde var |
| 8 | Randevu/booking sistemi | Üye paneli + Admin | Orta-Yüksek | Trainerize, My PT Hub |
| 9 | Wearable entegrasyonu (Apple Health/Google Fit) | Üye paneli | Yüksek | Hepsinde var |
| 10 | Liderlik tablosu / challenge | Üye paneli | Orta | Everfit |
| 11 | AI antrenman oluşturucu | Admin | Yüksek | Everfit, TrueCoach |
| 12 | Topluluk/forum | Üye paneli | Orta | Everfit, My PT Hub |
| 13 | Rozet sistemi (tamamlanmamış) | Üye paneli | Düşük-Orta | Trainerize, TrueCoach |
| 14 | Landing page iyileştirme (sosyal kanıt, testimonial, fiyat karşılaştırma) | Landing page | Düşük | — |
| 15 | Barkod tarayıcı (beslenme) | Üye paneli | Yüksek | My PT Hub |

## Bekleyen Karar

Kullanıcıya sorulan soru:

> **Şu an en çok hangi sorunu yaşıyorsun?**
> 1. Üye bağlılığı düşük
> 2. Yeni üye kazanımı zor
> 3. Admin tarafı verimsiz
> 4. Rakiplerle kıyaslandığında eksik hissediyorum

**Cevap bekleniyor** — cevaba göre önceliklendirme yapılacak.

---

## Devam Talimatı

Bu dosyayı açarak brainstorming'e kaldığı yerden devam et. Kullanıcının cevabına göre:
1. Özellikleri 3 faza böl (kısa/orta/uzun vadeli)
2. Her özelliğin tam olarak hangi sayfaya/componente ekleneceğini belirle
3. Teknik tasarım notlarını yaz (DB değişikliği, yeni route, component)
4. `writing-plans` skill ile implementation plan oluştur
