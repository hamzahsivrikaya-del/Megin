# Hamza SaaS — İş Planı

**Tarih:** 2026-03-01
**Son Güncelleme:** 2026-03-01 — Kullanıcı yorum analizi ve TR pazar araştırması eklendi
**Durum:** İş planı v2 — kullanıcı yorum analizi ve pazar araştırması ile zenginleştirildi
**Proje Adı:** Hamza (çalışma adı)
**Ekler:**
- `docs/reports/2026-03-01-kullanici-yorum-analizi-ve-tr-pazar.md` — Detaylı rakip yorum analizi + TR pazar raporu

---

## 1. Yönetici Özeti

Türkiye'de yaklaşık 15.000-20.000 aktif personal trainer var. Büyük çoğunluğu üye takibini kağıt, Excel veya WhatsApp ile yapıyor. Ödeme zamanlarını kaçırıyor, üyenin ne zaman gelmediğini fark edemiyor, somut ilerleme verisi sunamadığı için üye bağlılığı düşük kalıyor.

Global'de bu problemi çözen platformlar var — Trainerize, Everfit, TrueCoach, My PT Hub. Ama hepsi İngilizce, müşteri sayısına göre basamaklı fiyatlandırma uyguluyor ve PT büyüdükçe maliyeti katlanıyor. Türkçe çözüm yok.

**Hamza**, personal trainer'ların üye takip, ödeme kontrolü, antrenman programlama, beslenme takibi ve üye bağlılığı araçlarını tek çatı altında sunan bir SaaS platformu. PT kaydolur, üyelerini davet eder, her şeyi tek panelden yönetir. Üye uygulamayı açar, programını görür, ilerlemesini takip eder, motive kalır.

**Farklılaşma:**
- Sınırsız üye, sabit fiyat (rakiplerde üye limiti var)
- Çoklu dil desteği (Türkçe + İngilizce ile başlangıç, ileride DE, ES, AR)
- Rakiplerin ücretli sunduğu özellikler (bağlı üye takibi, blog, Instagram paylaşım kartı, fitness araçları) dahil
- TR'den başla, global'e aç

**Hedef:** İlk 6 ay 200 PT, ilk yıl 1.000 PT, 18. ayda global açılım.

---

## 2. Problem & Pazar Analizi

### PT'lerin Yaşadığı Gerçek Problemler

**Üye takibi:**
- Kağıt defter veya Excel'de ölçüm, ders sayısı, program notu tutuyor
- 15+ üyede karışıyor, kimin ne yaptığını unutuyor
- Üye "geçen ay kaç kiloydun?" diye sorunca cevap veremiyor

**Ödeme kontrolü:**
- "Bu ay ödedi mi?" sorusuna cevap yok
- Paket bitiş tarihi takip edilmiyor, hatırlatma yapılmıyor
- Paketler arası boşluk = gelir kaybı. PT fark ettiğinde üye zaten kopmuş

**Üye bağlılığı:**
- Üyeye somut ilerleme gösterilemiyor — "değişiyorsun" sözü yetmiyor
- Üye motivasyonunu sadece antrenman anında tutabiliyor, aralar boş
- Devamlılık verisi yok, kimin kopma riski olduğu belli değil

**Profesyonellik:**
- Büyük salonlarda çalışan PT'ler "freelancer" gibi görünüyor
- Üyeye dijital bir deneyim sunamıyor
- Rakip PT dijital sistem kullansa bile Türkçe seçenek yok

### Pazar Büyüklüğü

**Türkiye:**
- ~15.000-20.000 aktif PT (salon + bağımsız)
- ~5.000 butik stüdyo / küçük salon
- Fitness sektörü yıllık ~%15 büyüyor
- Dijitalleşme oranı çok düşük — pazarın %90'ı henüz dijital araç kullanmıyor

**Global:**
- ~500.000+ aktif PT (ABD, Avrupa, Ortadoğu)
- Online fitness yazılım pazarı 2025'te ~$16B, yıllık %20+ büyüme
- Trainerize 100K+ kullanıcı, Everfit 50K+, TrueCoach 30K+
- Hala doygunluktan çok uzak — özellikle İngilizce dışı pazarlar boş

### Pazar Fırsatı

Türkiye'deki PT'lerin %90'ı dijital araç kullanmıyor. Sebebi:
1. Mevcut çözümler İngilizce
2. Fiyatlar TL bazında yüksek ($20/ay = ~700₺)
3. "Bana ne lazım ki" mentalitesi — çünkü görmeden bilmiyorlar

Bu, eğitim + uygun fiyat + Türkçe deneyim ile kırılabilir bir bariyer. İlk deneyimi ücretsiz sunmak (5 üye free) bu bariyeri sıfıra indiriyor.

---

## 3. Hedef Kitle & Segmentler

### Segment A — Bağımsız PT'ler (Ana Pazar)

**Profil:**
- 22-38 yaş, spor salonunda freelance veya kendi başına çalışıyor
- 5-30 arası aktif üyesi var
- Instagram'da aktif, dijital araçlara açık
- Gelir: ders başı 800-2.000₺, aylık 20.000-80.000₺ arası
- Telefonu iş aracı — WhatsApp grupları, not uygulamaları, takvim

**Acıları:**
- Üye sayısı arttıkça takip zorlaşıyor
- Ödeme takibi stres kaynağı — "sormak ayıp oluyor"
- Üye 2 hafta gelmezse fark etmesi geç oluyor
- Profesyonel görünmek istiyor ama araçları yok
- Rakip PT'ye üye kaptırıyor, neden bilmiyor

**Satın alma motivasyonu:**
- "Üyelerim beni daha profesyonel görsün"
- "Kimin parasını almadığımı bilmek istiyorum"
- "Üyem kopmasın, erken müdahale edeyim"

### Segment B — Butik Stüdyolar (İkincil Pazar)

**Profil:**
- Küçük salon sahibi, 2-5 antrenör çalıştırıyor
- 30-100 arası üye
- CrossFit box, fonksiyonel fitness stüdyo, pilates/yoga stüdyo
- Genelde bir yazarkasa/muhasebe yazılımı var ama üye takibi ayrı

**Acıları:**
- Hangi antrenör hangi üyeyle çalışıyor, takip zor
- Üyenin devam durumu — kim düzenli, kim kopuyor, göremiyorlar
- Antrenörler kendi yöntemini kullanıyor, standart yok
- Gelir tahmini yapamıyorlar — bu ay kaç paket bitiyor, kaçı yenilenecek

**Satın alma motivasyonu:**
- "Tüm antrenörlerim aynı sistemi kullansın"
- "Üyelerin devam oranını görmek istiyorum"
- "Hangi antrenör daha iyi tutuyor bilmek istiyorum"
- "Aylık gelir tahminim olsun"

---

## 4. Ürün & Değer Önerisi

### PT'ye Değer (Neden Alsın?)

**"Kağıdı bırak, her şey tek yerde"**
- Üye listesi, ölçümler, paketler, dersler, ödemeler — hepsi tek panel
- Telefondan yönet, her yerden eriş
- Üye ekleme 30 saniye, program atama 2 dakika

**"Paran kaybolmasın"**
- Paket bitiş tarihi otomatik takip
- Ödeme durumu: ödendi/ödenmedi net görünsün
- Son 2 ders kaldığında otomatik hatırlatma → paket boşluğu kapanır
- Aylık gelir dashboard'u — bu ay ne kazandın, ne bekliyorsun

**"Üyen kopmasın"**
- Üye uygulamayı açar → programını görür, beslenme kaydeder, ilerlemesini izler
- Haftalık otomatik raporlar — "bu hafta 3 antrenman, beslenme %85 uyumlu"
- Streak sistemi — üye seriyi kırmak istemez
- Rozet/başarı sistemi — somut motivasyon
- Risk skoru — kimin kopma riski var, erken gör

**"Profesyonel görün"**
- Üyene dijital deneyim sun, rakip PT'den ayrış
- Instagram paylaşım kartları — üyenin ilerlemesi otomatik sosyal medya içeriği olur
- Blog ile uzmanlığını göster

### Üyeye Değer (Neden Kullansın?)

**"Antrenörümle bağlıyım"**
- Programımı her an görürüm
- Beslenme kaydımı tutarım, antrenörüm takip eder
- Ölçümlerim grafik olarak önümde — ilerliyorum, görüyorum
- Haftalık rapor geliyor — hesap verebilirlik hissi
- Rozet kazanıyorum — oyunlaştırma motivasyonu

### Rakiplerde Olmayan Değerler

| Özellik | Rakipler | Hamza |
|---------|----------|-------|
| Bağlı üye (veli-çocuk) | Yok | Var |
| Blog sistemi | Yok | Var |
| Fitness araçları (BMI, kalori vb.) | Yok | 7 araç |
| Instagram paylaşım kartı | Yok | Otomatik |
| Skinfold ölçüm + PDF | Yok | Var |
| Sınırsız üye sabit fiyat | Yok | Var |
| Türkçe | Yok | Var |

---

## 5. Rekabet Analizi & Konumlandırma

### Rakip Haritası

| | Trainerize | Everfit | TrueCoach | My PT Hub | **Hamza** |
|--|-----------|---------|-----------|-----------|----------|
| **Başlangıç fiyat** | $20/ay (5 üye) | $19/ay (5 üye) | $20/ay (5 üye) | $22.50/ay (3 üye) | **0₺ (5 üye)** |
| **20 üye fiyatı** | $40/ay | $19/ay | $53/ay | $29.50/ay | **Sabit fiyat** |
| **50 üye fiyatı** | $70/ay | $105/ay | $107/ay | $29.50/ay | **Sabit fiyat** |
| **Üye limiti** | Plana göre | Plana göre | Plana göre | Starter 3, Pro sınırsız | **Sınırsız** |
| **Türkçe** | Yok | Yok | Yok | Yok | **Var** |
| **Mobil** | Native app | Native app | Native app | Native app | **PWA** |
| **Ödeme ek ücreti** | $10/ay | $9/ay | Dahil | Dahil | **Dahil** |

### Rakiplerin Zayıf Noktaları (Bizim Fırsatımız)

**1. Fiyat şikayeti — en büyük ortak sorun**
- "5'ten 20 üyeye geçince fiyat 2 katına çıktı"
- "Ek özellikler hep ek ücret"
- Bizde: sabit fiyat, sınırsız üye, ek ücret yok

**2. Fatura/iptal sorunları**
- My PT Hub'da en büyük şikayet: "İptal edemedim, kartımdan çekmeye devam etti"
- Bizde: şeffaf fiyat, tek tıkla iptal

**3. Dil bariyeri**
- Hepsi İngilizce, TrueCoach sadece İngilizce
- Bizde: ana dil desteği

**4. Karmaşık arayüz**
- Trainerize ve My PT Hub öğrenme eğrisi yüksek
- Bizde: 5 dakikada kurulum vaadi

**5. MFP bağımlılığı (beslenme)**
- Trainerize ve TrueCoach beslenmeyi MyFitnessPal'a yönlendiriyor, senkron sürekli bozuluyor
- Bizde: kendi beslenme takip sistemi dahil

### Konumlandırma

> Hamza, personal trainer'ların üyelerini takip etmek, ödemelerini kontrol etmek ve üye bağlılığını artırmak için kullandığı en basit ve en uygun fiyatlı platformdur. Rakiplerin aksine üye limiti yoktur, gizli ücret yoktur ve kendi dilinizde çalışır.

### PWA vs Native App

Kısa vadede PWA yeterli — telefona kurulur, bildirim gönderir. Orta-uzun vadede global büyümede native app gerekebilir, o aşamada gelir bunu finanse eder.

---

## 6. İş Modeli & Fiyatlandırma

### Model: Freemium + Sabit Fiyat

**Yaklaşım:**
- Free tier ile giriş bariyeri sıfır (5 üyeye kadar, temel özellikler)
- Pro plan ile sınırsız üye, tüm özellikler — sabit fiyat
- Studio plan ile çoklu antrenör, salon yönetimi — sabit fiyat
- Yıllık planda indirim → erken bağlanma teşviki

**Neden üye bazlı değil sabit fiyat:**
- Rakiplerin en büyük şikayet kaynağı "büyüdükçe cezalandırılma" hissi
- "Sınırsız üye, tek fiyat" → pazarlama mesajı çok güçlü
- PT büyürken platform onun başarısını engellemez

**Free vs Pro ayrımı:**
- Free: 5 üye, temel takip (ölçüm, program, ders)
- Pro: Sınırsız üye, beslenme, raporlar, rozetler, blog, gelir dashboard, risk skoru
- Studio: Pro + çoklu antrenör, salon devam takibi, antrenör performansı

**Global fiyat:** TR ve global fiyatlar ayrı belirlenecek. Rakiplerle rekabetçi ama sınırsız üye avantajı korunacak.

**Fiyat detayları launch öncesi kesinleştirilecek.**

### Dönüşüm Hunisi

```
PT duyar (Instagram, tavsiye, Google)
    → Pazarlama sitesini ziyaret eder
    → Free'ye kaydolur (0₺, kredi kartı istenmez)
    → 5 üye ekler, 2-4 hafta kullanır
    → 6. üyeyi eklemek ister → Pro'ya geçiş
    → Sınırsız devam eder
```

### İkincil Gelir Fırsatları (İleride)

| Fırsat | Açıklama | Zamanlama |
|--------|----------|-----------|
| Marketplace | PT'ler hazır program şablonu satar, platform komisyon alır | Yıl 2 |
| Ödeme aracılığı | PT üyesinden tahsilat, platform komisyon keser (Stripe Connect) | Yıl 2 |
| Enterprise plan | Salon zincirleri için özel fiyat ve destek | Yıl 2-3 |

---

## 7. Pazara Giriş Stratejisi

### İlk 100 PT'ye Nasıl Ulaşırız?

**Kanal 1 — Instagram (Ana kanal)**
- TR'deki PT'lerin %90'ı Instagram'da aktif
- İçerik: "Hala kağıtla mı takip ediyorsun?" tarzı acı noktasına dokunan kısa videolar
- Hamza'nın kendi dönüşüm hikayesi: "Ben de kağıtla yapıyordum, sonra bunu kurdum"
- PT influencer işbirlikleri — 5-10 tanınmış PT'ye ücretsiz Pro ver, kullansın, paylaşsın

**Kanal 2 — PT'den PT'ye (Ağızdan ağıza)**
- En güçlü kanal. PT arkadaşına "şunu kullanıyorum" derse biter
- Referans sistemi: "Arkadaşını getir, ikisi de 1 ay Pro hediye"
- Free plan bu kanalı besliyor — denemesi ücretsiz, tavsiye bariyeri sıfır

**Kanal 3 — Google / SEO**
- "Üye takip programı", "PT yazılımı", "antrenör uygulaması" aramaları
- Mevcut fitness araçları (BMI, kalori hesaplayıcı) zaten SEO değeri taşıyor
- Blog içerikleri: "PT olarak üye kaybını nasıl önlersin"

**Kanal 4 — Salon/Eğitim Kurumu Ortaklıkları**
- PT sertifika kurumlarının Türkiye temsilcileri
- "Yeni sertifika alan PT'ye 3 ay Pro hediye" kampanyası
- Butik salonlara direkt demo

**Kanal 5 — WhatsApp/Telegram Grupları**
- TR'de onlarca PT WhatsApp grubu var
- Organik paylaşım + değer veren içerikler

### Lansman Stratejisi

**Soft launch:**
- Hamza'nın kendi 10-15 üyesiyle sistem zaten çalışıyor = canlı kanıt
- İlk 50 PT'ye "Kurucu Üye" statüsü — ömür boyu özel fiyat
- Geri bildirimleriyle ürünü şekillendir

**Public launch:**
- Instagram'da lansman videosu — Hamza'nın hikayesi
- Erken kayıt kampanyası
- PT influencer'lardan aynı gün paylaşım

### Ölçekleme

```
100 PT   → Ürün-pazar uyumu kanıtlandı
500 PT   → Instagram Ads başlar, referans sistemi optimize
1.000 PT → İngilizce versiyon, global ilk adım
5.000 PT → Native app, yeni dil paketleri
```

---

## 8. Gelir Projeksiyonu

### 12 Aylık Büyüme Senaryosu (Tahmini)

| Ay | Free PT | Ödeme Yapan PT | Toplam PT |
|----|---------|----------------|-----------|
| 1 | 30 | 5 | 35 |
| 2 | 60 | 16 | 76 |
| 3 | 100 | 38 | 138 |
| 4 | 140 | 65 | 205 |
| 5 | 180 | 98 | 278 |
| 6 | 220 | 142 | 362 |
| 7 | 260 | 191 | 451 |
| 8 | 300 | 242 | 542 |
| 9 | 340 | 298 | 638 |
| 10 | 380 | 365 | 745 |
| 11 | 420 | 442 | 862 |
| 12 | 460 | 530 | 990 |

**Yıl sonu hedef:** ~990 PT aktif kullanıcı

### 24 Ay — Global Dahil

| Dönem | TR PT | Global PT | Toplam |
|-------|-------|-----------|--------|
| Ay 12 | 990 | 0 | 990 |
| Ay 18 | 1.500 | 300 | 1.800 |
| Ay 24 | 2.000 | 1.000 | 3.000 |

### Maliyet Yapısı

Altyapı maliyeti düşük — Vercel + Supabase ile 1.000 PT'ye kadar aylık 2.000-5.000₺ arası. İlk 100 PT'ye kadar neredeyse sıfır maliyet (free tier'lar).

---

## 9. Yol Haritası & Kilometre Taşları

### Faz 0 — Temel Hazırlık (SaaS Katmanı)

**Amaç:** Mevcut sistemi çoklu PT'ye açmak

- Multi-tenant altyapı (tenant_id tüm tablolara)
- PT kayıt ve giriş akışı
- PT profil sayfası (ad, foto, biyografi)
- Üye davet sistemi (link ile katılım)
- i18n altyapısı (Türkçe + İngilizce)
- Abonelik ve ödeme entegrasyonu
- Free plan limitleri
- Pazarlama sitesi
- Superadmin paneli

**Çıktı:** İlk PT dışarıdan kaydolup üye ekleyebilir

### Faz 1 — Soft Launch

**Amaç:** İlk 50 PT, ürün-pazar uyumu testi

- Kurucu üye programı
- PT onboarding wizard (5 dakikada kur)
- Email sistemi
- Geri bildirim mekanizması
- UX iyileştirmeleri

**Çıktı:** 50 PT aktif kullanıyor

### Faz 2 — Public Launch

**Amaç:** Hızlı büyüme, 500 PT

- Lansman kampanyası
- Referans sistemi
- Instagram Ads
- SEO içerik stratejisi
- PT influencer işbirlikleri
- Studio planı satışı

**Çıktı:** 500 PT, gelir modeli doğrulandı

### Faz 3 — Ürün Derinleştirme

**Amaç:** Rakiplerle özellik farkını kapatmak

- Uygulama içi mesajlaşma (PT-üye chat)
- Alışkanlık takibi (su, uyku, adım + streak)
- Check-in formları (haftalık)
- İlerleme fotoğrafı (ön/yan/arka + slider karşılaştırma)
- Compliance tracking (uyum oranı)
- Egzersiz kütüphanesi (video/GIF)
- Gelir dashboard'u

**Çıktı:** Özellik seti rakiplerle eşit veya üstün

### Faz 4 — Global Açılım

**Amaç:** İngilizce pazara giriş

- İngilizce dil paketi
- Global ödeme (Stripe)
- Global fiyatlandırma
- Product Hunt / AppSumo lansmanı
- İngilizce PT influencer işbirlikleri
- Yeni dil paketleri (DE, ES, AR)

**Çıktı:** 1.000+ global PT

### Faz 5 — Ölçekleme & Ekosistem

**Amaç:** Platformdan ekosisteme

- Native mobil app (iOS + Android)
- Marketplace (program şablonları)
- Ödeme aracılığı (Stripe Connect)
- Wearable entegrasyon (Apple Health, Google Fit)
- AI antrenman önerisi
- Randevu/booking sistemi
- Enterprise plan

**Çıktı:** Tam kapsamlı fitness ekosistemi

---

## 10. Riskler & Önlemler

### Risk 1 — "PT dijital araca para vermez"

**Olasılık:** Yüksek | **Etki:** Yüksek

**Önlem:**
- Free tier ile alışsın, bağımlı olsun
- Free bile kağıttan çok iyi olmalı
- 6. üyede Pro'ya geçiş doğal his ettirmeli
- Değer kanıtı göster: "Bu ay kaç üyen kaldı, kaç paket yenilendi"

### Risk 2 — Rakip Türkçe desteği ekler

**Olasılık:** Orta | **Etki:** Orta

**Önlem:**
- Dil tek avantaj değil — fiyat, sınırsız üye, basitlik de var
- Türkçe sadece çeviri değil, kültürel uyum
- Hız avantajı — biz piyasadayken onlar çeviri yapıyor olacak

### Risk 3 — Düşük retention (PT kullanıp bırakır)

**Olasılık:** Yüksek | **Etki:** Yüksek

**Önlem:**
- Üyenin verisi sistemde → PT çıkınca veri kaybeder (güçlü kilit)
- Haftalık raporlar PT'ye de gider — sisteme geri çeker
- İlk 30 gün kritik — onboarding wizard + email dizisi
- Üye tarafını güçlü tut → PT'nin üyesi kullanıyorsa PT bırakamaz

### Risk 4 — Teknik ölçeklenme

**Olasılık:** Düşük | **Etki:** Orta

**Önlem:**
- Supabase Pro planı 100K+ satır kaldırır
- Doğru indeksleme ve sorgu optimizasyonu
- 5.000 PT'den sonra dedicated instance

### Risk 5 — Nakit akışı

**Olasılık:** Orta | **Etki:** Orta

**Önlem:**
- Altyapı maliyeti neredeyse sıfır ile başlanabilir
- Instagram organik içerik ile başla, paid ads sonra
- Hamza'nın kendi PT işi devam ediyor = yan gelir güvencesi

### Risk 6 — Global pazarda rekabet

**Olasılık:** Kesin | **Etki:** Orta

**Önlem:**
- TR'de kanıtlanmış ürünle global'e git
- Fiyat avantajı global'de de geçerli
- İngilizce dışı pazarlardan gir (Almanya, İspanya, Ortadoğu)
- Product Hunt / AppSumo ile erken adopter kitlesi

### Risk Özet Tablosu

| Risk | Olasılık | Etki | Önlem Gücü |
|------|----------|------|------------|
| PT para vermez | Yüksek | Yüksek | Güçlü (freemium) |
| Rakip Türkçe ekler | Orta | Orta | Güçlü (fiyat + kültür) |
| Düşük retention | Yüksek | Yüksek | Orta (veri kilidi) |
| Teknik ölçeklenme | Düşük | Orta | Güçlü (mimari) |
| Nakit akışı | Orta | Orta | Güçlü (düşük maliyet) |
| Global rekabet | Kesin | Orta | Orta (fiyat + niş) |

---

## 11. Kullanıcı Yorum Analizinden Çıkarımlar (YENİ)

> Detaylı rapor: `docs/reports/2026-03-01-kullanici-yorum-analizi-ve-tr-pazar.md`

### 4 Rakibin Ortak Zayıflıkları

4.600+ kullanıcı yorumu analiz edildi (Trainerize, Everfit, TrueCoach, My PT Hub). **Tüm platformlarda tekrarlayan 6 ortak sorun:**

| # | Sorun | Yaygınlık | Bizim Cevabımız |
|---|-------|-----------|-----------------|
| 1 | Faturalama/iptal kabusu | 4/4 platform | Şeffaf fiyat, tek tıkla iptal |
| 2 | Mobil uygulama crash/veri kaybı | 4/4 platform | Stabil PWA |
| 3 | Beslenme takibi yetersiz | 4/4 platform | Kendi beslenme sistemi (MFP bağımlılığı yok) |
| 4 | Karmaşık/eski arayüz | 4/4 platform | 5 dakikada kur, basit UI |
| 5 | Müşteri desteği yok/kötü | 4/4 platform | Türkçe canlı destek |
| 6 | Büyüdükçe artan fiyat | 4/4 platform | Sabit fiyat, sınırsız üye |

### 6 Güçlü Pazarlama Mesajı (Rakip Yorumlarından)

1. **"Gizli ücret yok, sürpriz fatura yok"**
2. **"Büyüdükçe cezalandırılma yok"**
3. **"5 dakikada kur, hemen kullan"**
4. **"Kendi dilinde, kendi kültüründe"**
5. **"Verini her zaman al, istediğin zaman git"**
6. **"Gerçek insanlardan gerçek destek"**

---

## 12. Türkiye Pazar Araştırması (YENİ)

### Kritik Bulgu: PAZAR TAMAMEN BOŞ

Türkiye'de PT'lere özel bir yönetim aracı **yok**:
- **Salon yazılımları** (Gymsoft, BulutGym, GymPro) → Salon sahibine odaklı, donanım ağırlıklı
- **Fitness uygulamaları** (Meditopia, ULive, Ağırsağlam) → Son kullanıcıya odaklı (B2C)
- **Marketplace'ler** (Armut, Gigbi) → Sadece buluşturma, yönetim yok
- **Ağırsağlam** bile → WhatsApp + email ile manuel koçluk yapıyor

### TR'deki Mevcut Oyuncular (Hiçbiri Doğrudan Rakip Değil)

| Oyuncu | Ne Yapıyor | Fiyat | PT Yönetimi |
|--------|-----------|-------|-------------|
| Gymsoft | Salon otomasyon + turnike | 690₺/ay | Yok |
| BulutGym | Bulut salon yönetimi | Gizli | Sınırlı |
| GymPro | Enterprise tesis yönetimi | Gizli | Eski modül |
| Gymtekno | Gym + pilates + spor okulu | Gizli | Yok |
| Ağırsağlam | Fitness içerik + manuel koçluk | Değişken | Manuel (WhatsApp) |

### Pazar Fırsatı

- 15.000-20.000 aktif PT, %90'ı dijital araç kullanmıyor
- 64.970+ spor salonu, %15 yıllık büyüme
- Blue ocean — ilk giren avantajı
- Gymsoft 690₺/ay alıyor → PT yazılımı için 499₺/ay makul pozisyon

---

## Sonraki Adımlar

1. [ ] Uygulama adı kesinleştirilecek
2. [ ] Fiyatlandırma detayları launch öncesi belirlenecek
3. [ ] Faz 0 teknik implementasyon planı hazırlanacak
4. [ ] Pazarlama sitesi tasarımı
5. [ ] Kurucu üye programı detayları
6. [ ] İlk Instagram içerik stratejisi
7. [ ] Kullanıcı yorum analizinden çıkan özellik talepleri backlog'a eklenmeli
8. [ ] TR'deki salon yazılımı sahiplerine yaklaşım stratejisi (potansiyel ortaklık)

---

*Bu döküman canlı olarak güncellenecektir.*
*v1: 2026-03-01 — Brainstorming oturumu*
*v2: 2026-03-01 — Kullanıcı yorum analizi + TR pazar araştırması eklendi*
