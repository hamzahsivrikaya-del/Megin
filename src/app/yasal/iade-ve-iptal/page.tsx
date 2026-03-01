import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İade ve İptal Politikası | Hamza Sivrikaya',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#44403C]">{children}</div>
    </section>
  )
}

export default function IadeVeIptal() {
  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="text-center space-y-2 pb-6 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">İade ve İptal Politikası</h1>
        <p className="text-xs text-[#A8A29E]">Son Güncelleme: 26 Şubat 2026</p>
      </div>

      <Section title="1. Genel Bilgi">
        <p>Hamza Hakkı Sivrikaya (Şahıs Şirketi) olarak müşteri memnuniyetini ve yasal haklarını ön planda tutmaktayız. Aşağıdaki iade ve iptal koşulları, kişisel antrenörlük hizmetimize özgü olarak belirlenmiştir.</p>
      </Section>

      <Section title="2. Hizmet Başlamadan Önce İade (Cayma Hakkı)">
        <p>Ödeme tarihinden itibaren 14 (on dört) gün içinde ve hizmet henüz başlamadan cayma hakkınızı kullanarak tam iade talep edebilirsiniz.</p>
        <p>İade talebi yazılı olarak iletilmelidir:</p>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-1">
          <p><span className="font-medium text-[#1A1A1A]">E-posta:</span> hamzahsivrikaya@gmail.com</p>
          <p><span className="font-medium text-[#1A1A1A]">Telefon:</span> +90 545 681 47 76</p>
        </div>
        <p>Onaylanan cayma talepleri 14 iş günü içinde ödeme yönteminize iade edilir.</p>
      </Section>

      <Section title="3. Hizmet Başladıktan Sonra İade">
        <p>Alıcı&apos;nın açık onayıyla hizmet ifa edilmeye başlandıktan sonra cayma hakkı kullanılamaz (6502 s.K. m.15).</p>
        <p>Kullanılmış seanslara ait ücret iade edilmez.</p>
      </Section>

      <Section title="4. Antrenörden Kaynaklanan Özel Durumlar">
        <p>Antrenörün sağlık sorunu, kaza veya mücbir sebep nedeniyle seansları ifa edememesi halinde kullanılmamış seans bedeli 10 iş günü içinde iade edilir.</p>
        <p>Antrenörün gecikmesi veya programı zamanında başlatmaması halinde Alıcı, gecikme süresi kadar telafi seansı talep edebilir.</p>
      </Section>

      <Section title="5. Müşteriden Kaynaklanan Özel Durumlar">
        <p>24 saatten kısa süre önce iptal edilen veya katılınmayan seanslar kullanılmış sayılır ve iade edilmez.</p>
        <p>Müşterinin sağlık sorunu nedeniyle antrenmanı sürdürememesi ve bunu hekim raporu ile belgelemesi halinde kalan seans bedeli değerlendirmeye alınır.</p>
        <p>Müşterinin sözleşme ihlali (hakaret, tehdit, sağlık beyanının yanlış olması vb.) durumunda iade yapılmaz.</p>
      </Section>

      <Section title="6. İade Süreci">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#F5F5F4] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-[#57534E]">1</span>
            </div>
            <p>İade talebiniz 3 iş günü içinde yanıtlanır.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#F5F5F4] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-[#57534E]">2</span>
            </div>
            <p>Onaylanan iadeler 3-15 iş günü içinde hesabınıza yansır (bankanıza göre değişir).</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#F5F5F4] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-[#57534E]">3</span>
            </div>
            <p>Kredi kartına yapılan iadeler genellikle 3-5 iş günü, banka kartına yapılan iadeler 7-15 iş günü içinde görünür.</p>
          </div>
        </div>
      </Section>

      <Section title="7. İade Talebi İçin Gerekli Bilgiler">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Ad Soyad</li>
          <li>Sipariş numarası veya ödeme tarihi</li>
          <li>İade gerekçesi</li>
          <li>İletişim bilgileri</li>
        </ul>
      </Section>

      <Section title="8. İletişim">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-1">
          <p><span className="font-medium text-[#1A1A1A]">E-posta:</span> hamzahsivrikaya@gmail.com</p>
          <p><span className="font-medium text-[#1A1A1A]">Telefon:</span> +90 545 681 47 76</p>
          <p><span className="font-medium text-[#1A1A1A]">Web:</span> www.hamzasivrikaya.com</p>
        </div>
      </Section>
    </div>
  )
}
