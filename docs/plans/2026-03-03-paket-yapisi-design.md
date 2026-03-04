# Megin Paket Yapısı — Tasarım Dokümanı

**Tarih:** 2026-03-03
**Durum:** Brainstorming tamamlandı, fiyatlandırma bekliyor
**PDF:** `docs/plans/2026-03-03-paket-yapisi.pdf`

---

## Genel Yapı

3 paket, hepsi bireysel PT'ler için. Salon yönetimi ayrı ürün olacak (kapsam dışı).

| Paket | Danışan Limiti | Fiyat | Hedef |
|-------|---------------|-------|-------|
| Free | 3 | 0₺ | Ürünü tanıyan PT |
| Pro | 10 | Belirlenecek | Aktif çalışan PT |
| Elite | Sınırsız | Belirlenecek | Büyüyen / ciddi PT |

---

## Free — Başlangıç (3 danışan)

**Amaç:** PT ürünü denesin, bağımlı olsun, ama gerçek işini yürütemesin.

| Özellik | Durum |
|---------|-------|
| Danışan ekleme + davet linki | ✅ (3 limit) |
| Temel antrenman programı | ✅ |
| Ders sayısı takibi | ✅ |
| Temel ölçüm girişi (kilo, boy) | ✅ |
| PT Handle (public profil) | ✅ |

**Upgrade tetikleyicileri:**
1. 4. danışanı eklemek istediğinde → "Pro'ya geç" mesajı
2. Kilitli özelliğe tıkladığında → "Bu özellik Pro'da" popup
3. Dashboard'da kilitli kartlar görünür → değer hissi oluşur

---

## Pro (10 danışan)

**Amaç:** PT işini düzgün yürütebilsin.

Free'deki her şey +

| Özellik | Açıklama |
|---------|----------|
| Ölçüm grafikleri | Detaylı grafik + trend analizi |
| Beslenme takibi | Öğün + foto yükle |
| Haftalık raporlar | Otomatik danışan raporu |
| Push bildirimler | Danışan aksiyonları bildirim |
| Finans ekranı | Aylık gelir özeti |
| Fitness araçları | BMI, kalori vb. 7 araç |

**Elite'e upgrade tetikleyicileri:**
1. 11. danışanı eklemek istediğinde → "Elite'e geç"
2. Rozet, blog, risk skoru gibi Elite özellikleri görünür ama kilitli
3. İlerleme fotoğrafı karşılaştırma → en güçlü tetikleyici

---

## Elite (Sınırsız danışan)

**Amaç:** Büyüyen PT için sınır yok. Profesyonel fark yaratan özellikler.

Pro'daki her şey +

| Özellik | Açıklama |
|---------|----------|
| İlerleme fotoğrafları | Ön/yan/arka + slider karşılaştırma |
| Rozet sistemi | 23 rozet, danışan motivasyonu |
| Blog | PT uzmanlığını gösterir |
| Bağlı üye (veli-çocuk) | Ebeveyn çocuğunu takip eder |
| Risk skoru | Kopma riski olan danışanı erken gör |
| Instagram paylaşım kartı | Otomatik sosyal medya içeriği |
| Finans tahmini | Gelecek ay gelir projeksiyonu |

---

## Tam Karşılaştırma

| Özellik | Free | Pro | Elite |
|---------|------|-----|-------|
| Danışan limiti | 3 | 10 | Sınırsız |
| Antrenman programı | ✅ | ✅ | ✅ |
| Ders sayısı takibi | ✅ | ✅ | ✅ |
| Temel ölçüm (kilo, boy) | ✅ | ✅ | ✅ |
| PT Handle | ✅ | ✅ | ✅ |
| Ölçüm grafikleri | — | ✅ | ✅ |
| Beslenme takibi | — | ✅ | ✅ |
| Haftalık raporlar | — | ✅ | ✅ |
| Push bildirimler | — | ✅ | ✅ |
| Finans ekranı (özet) | — | ✅ | ✅ |
| Fitness araçları (7) | — | ✅ | ✅ |
| İlerleme foto + slider | — | — | ✅ |
| Rozet sistemi (23) | — | — | ✅ |
| Blog | — | — | ✅ |
| Bağlı üye (veli-çocuk) | — | — | ✅ |
| Risk skoru | — | — | ✅ |
| Instagram kartı | — | — | ✅ |
| Finans tahmini | — | — | ✅ |

---

## Dönüşüm Hunisi

```
PT duyar (Instagram, tavsiye, Google)
  → Free'ye kaydolur (0₺, kredi kartı istenmez)
  → 3 danışan ekler, 2-4 hafta kullanır
  → 4. danışanı eklemek ister → Pro'ya geçiş
  → 10 danışanı dolunca → Elite'e geçiş
  → Sınırsız devam eder
```

---

## Temel Prensipler

1. Kilitli özellikler görünür ama tıklanınca upgrade mesajı çıkar
2. PT ürünün tamamını görür, değerini anlar
3. Free→Pro: danışan limiti + özellik kilidi (çift tetikleyici)
4. Pro→Elite: danışan limiti + premium özellikler
5. Elite'in en güçlü çekim özelliği: ilerleme fotoğrafı karşılaştırma

---

## Bekleyen Kararlar

- [ ] Pro fiyatı (aylık + yıllık)
- [ ] Elite fiyatı (aylık + yıllık)
- [ ] Yıllık indirim oranı
- [ ] Kurucu üye özel fiyatı

---

*v1: 2026-03-03 — Brainstorming oturumu*
