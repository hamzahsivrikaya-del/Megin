import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Hamza Sivrikaya',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#44403C]">{children}</div>
    </section>
  )
}

export default function KullanimKosullari() {
  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="text-center space-y-2 pb-6 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">Kullanım Koşulları</h1>
        <p className="text-xs text-[#A8A29E]">Son Güncelleme: 26 Şubat 2026</p>
      </div>

      <Section title="1. Kabul">
        <p>www.hamzasivrikaya.com web sitesini ziyaret ederek veya hizmet satın alarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız siteyi kullanmayınız.</p>
      </Section>

      <Section title="2. Sunulan Hizmetler">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Yüz yüze kişisel antrenörlük paketleri</li>
          <li>Online kişisel antrenörlük paketleri</li>
          <li>Hibrit (karma) antrenörlük paketleri</li>
          <li>Fitness ve sağlıklı yaşam blog içerikleri</li>
        </ul>
        <p>Hizmet kapsamı ve fiyatları önceden haber verilmeksizin değiştirilebilir.</p>
      </Section>

      <Section title="3. Kullanıcı Yükümlülükleri">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Siteyi yalnızca yasal amaçlarla kullanmak.</li>
          <li>Sistemi zarara uğratacak veya normal işleyişini bozacak eylemlerden kaçınmak.</li>
          <li>Hizmet alırken doğru ve güncel bilgi sağlamak.</li>
          <li>Sağlık beyanını dürüstçe doldurmak.</li>
          <li>Diğer kullanıcılara veya Antrenöre saygısız davranmamak.</li>
        </ul>
      </Section>

      <Section title="4. Sağlık Uyarısı">
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <p>Web sitesindeki ve antrenman programlarındaki içerikler genel bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez. Herhangi bir sağlık sorununuz varsa antrenman programına başlamadan önce doktorunuza danışınız. Sağlık durumunuzdan kaynaklanacak zararlardan Antrenör sorumlu tutulamaz.</p>
        </div>
      </Section>

      <Section title="5. Fikri Mülkiyet">
        <p>Web sitesindeki tüm içerikler (metin, görsel, logo, video, antrenman programları, blog yazıları) Hamza Hakkı Sivrikaya&apos;ya aittir ve telif hakkı kapsamında korunmaktadır.</p>
        <p>İzin alınmadan kopyalanamaz, dağıtılamaz, ticari amaçla kullanılamaz.</p>
        <p>Müşterilere teslim edilen antrenman programları yalnızca kişisel kullanım içindir; üçüncü kişilerle paylaşılamaz.</p>
      </Section>

      <Section title="6. Sorumluluk Sınırlaması">
        <p>Web sitesinin kesintisiz veya hatasız çalışacağı garanti edilmez.</p>
        <p>Teknik arızalar, siber saldırılar veya mücbir sebeplerden kaynaklanan aksaklıklardan sorumluluk kabul edilmez.</p>
        <p>Blog içeriklerindeki bilgiler genel nitelikte olup kişisel sağlık kararları için kullanılmamalıdır.</p>
      </Section>

      <Section title="7. Bağlantılı Siteler">
        <p>Web sitesinde üçüncü taraf sitelere bağlantılar bulunabilir. Bu siteler üzerinde kontrolümüz bulunmamakta olup içeriklerinden ve güvenliklerinden sorumlu değiliz.</p>
      </Section>

      <Section title="8. Değişiklikler">
        <p>Kullanım koşulları önceden haber verilmeksizin güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Güncellemeler yayım tarihinde yürürlüğe girer.</p>
      </Section>

      <Section title="9. Uygulanacak Hukuk">
        <p>Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda Antalya mahkemeleri yetkilidir.</p>
      </Section>

      <Section title="10. İletişim">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-1">
          <p><span className="font-medium text-[#1A1A1A]">E-posta:</span> hamzahsivrikaya@gmail.com</p>
          <p><span className="font-medium text-[#1A1A1A]">Telefon:</span> +90 545 681 47 76</p>
          <p><span className="font-medium text-[#1A1A1A]">Web:</span> www.hamzasivrikaya.com</p>
        </div>
      </Section>
    </div>
  )
}
