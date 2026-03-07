import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | Megin',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#44403C]">{children}</div>
    </section>
  )
}

export default function MesafeliSatisSozlesmesi() {
  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="text-center space-y-2 pb-6 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-xs text-[#A8A29E]">Son Güncelleme: 26 Şubat 2026</p>
      </div>

      <Section title="Madde 1 — Taraflar">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider mb-2">Satıcı</p>
            <div className="space-y-1">
              <p><span className="font-medium text-[#1A1A1A]">Ünvan:</span> Megin</p>
              <p><span className="font-medium text-[#1A1A1A]">Web Sitesi:</span> www.megin.ai</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider mb-2">Alıcı</p>
            <p>Alıcı, web sitesi üzerinden sipariş oluşturma aşamasında girilen kişisel bilgilerle tanımlanmaktadır.</p>
          </div>
        </div>
      </Section>

      <Section title="Madde 2 — Konu">
        <p>Bu sözleşme; Alıcı&apos;nın web sitesi üzerinden elektronik ortamda satın aldığı kişisel antrenörlük hizmetine ilişkin 6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini belirlemektedir.</p>
      </Section>

      <Section title="Madde 3 — Hizmet Bilgileri">
        <p>Satıcı tarafından sunulan hizmetler; yüz yüze kişisel antrenörlük, online kişisel antrenörlük ve hibrit antrenörlük paketlerinden oluşmaktadır.</p>
        <p>Hizmet kapsamı, süresi ve ücreti web sitesinde ilgili paket sayfasında açıkça belirtilmektedir.</p>
        <p>Alıcı; sipariş oluşturmadan önce sağlık beyanı dahil tüm hizmet koşullarını okuduğunu ve kabul ettiğini beyan eder.</p>
      </Section>

      <Section title="Madde 4 — Fiyat ve Ödeme">
        <p>Hizmet bedeli sipariş sayfasında KDV dahil olarak belirtilmektedir.</p>
        <p>Ödeme; kredi kartı, banka kartı veya web sitesinde sunulan diğer yöntemlerle yapılabilir.</p>
        <p>Taksitli işlemlerde, Alıcı&apos;nın kartından tek seferde taksit sayısı kadar tutarın tamamı kesilerek Satıcı&apos;ya aktarılır.</p>
      </Section>

      <Section title="Madde 5 — Hizmetin İfası">
        <p>Satın alınan hizmet, ödemenin onaylanmasından itibaren 3 iş günü içinde Satıcı tarafından başlatılır.</p>
        <p>Hizmet başlangıç tarihi ve seans takvimi, ödeme onayı sonrasında Alıcı ile iletişime geçilerek belirlenir.</p>
        <p>Alıcı, sağlık beyanı dahil tüm ön koşulları yerine getirmeden hizmetin başlatılması talep edilemez.</p>
      </Section>

      <Section title="Madde 6 — Cayma Hakkı">
        <p>Alıcı, hizmet sözleşmesinin kurulmasından itibaren 14 (on dört) gün içinde gerekçesiz olarak cayma hakkını kullanabilir.</p>
        <p>Cayma hakkı, Alıcı&apos;nın onayıyla hizmet ifa edilmeye başlandıktan sonra kullanılamaz (6502 s.K. m.15).</p>
        <p>Cayma bildirimi info@megin.ai adresine yazılı olarak iletilmelidir.</p>
        <p>Cayma hakkının kullanılması halinde ödenen tutar 14 gün içinde iade edilir.</p>
      </Section>

      <Section title="Madde 7 — Mücbir Sebepler">
        <p>Pandemi, doğal afet, savaş, terör, iletişim altyapısının çökmesi gibi öngörülemeyen olaylar mücbir sebep sayılır. Bu hallerde hizmet ertelenebilir veya sözleşme feshedilerek kalan tutar iade edilir.</p>
      </Section>

      <Section title="Madde 8 — Temerrüt">
        <p>Tarafların yükümlülüklerini yerine getirmemesi halinde Türk Borçlar Kanunu&apos;nun 123-126. maddeleri uygulanır.</p>
        <p>Satıcı hizmeti ifa edemeyeceğini öğrendiği anda Alıcı&apos;yı bildirir ve ödenen bedeli iade eder.</p>
      </Section>

      <Section title="Madde 9 — Bildirimler">
        <p>Taraflar arasındaki yazışmalar e-posta (info@megin.ai) veya web sitesindeki iletişim formu aracılığıyla yapılır. E-posta yazışmaları HMK m.193 kapsamında delil niteliğindedir.</p>
      </Section>

      <Section title="Madde 10 — Yetkili Mahkeme">
        <p>Uyuşmazlıklarda öncelikle Tüketici Hakem Heyetleri, akabinde Antalya Tüketici Mahkemeleri yetkilidir.</p>
      </Section>

      <div className="pt-6 border-t border-[#E5E5E5] text-center">
        <p className="text-xs text-[#A8A29E]">Bu sözleşme, Alıcı tarafından sipariş onaylandığında yürürlüğe girer.</p>
      </div>
    </div>
  )
}
