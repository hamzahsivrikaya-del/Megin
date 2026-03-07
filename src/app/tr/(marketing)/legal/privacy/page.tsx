import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Megin',
  description:
    'Megin kişisel verilerinizi nasıl topladığını, kullandığını ve koruduğunu öğrenin. Şeffaflığa ve gizliliğinize bağlıyız.',
  alternates: {
    languages: {
      en: '/legal/privacy',
      tr: '/tr/legal/privacy',
    },
  },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="heading-display text-lg sm:text-xl text-[#0A0A0A]">{title}</h2>
      <div className="space-y-3 text-[#374151] text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function TurkishPrivacyPolicyPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-12 bg-white border-b border-[#E5E7EB]">
        <div className="mkt-container">
          <nav className="mb-6">
            <Link
              href="/tr"
              className="text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
            >
              Ana Sayfa
            </Link>
            <span className="text-[#9CA3AF] mx-2">/</span>
            <span className="text-xs text-[#0A0A0A]">Gizlilik Politikası</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Yasal
          </p>
          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            GİZLİLİK POLİTİKASI
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Son güncelleme: Mart 2026</p>
        </div>
      </section>

      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Topladığımız Bilgiler">
            <p>
              Hesap oluşturduğunuzda, hizmetlerimizi kullandığınızda veya bizimle iletişime geçtiğinizde doğrudan sağladığınız bilgileri topluyoruz. Bunlar şunlardır:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Hesap bilgileri:</strong> Ad soyad, e-posta adresi, şifre ve isteğe bağlı olarak spor salonu veya stüdyo adınız.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Üye verileri:</strong> Müşterileriniz hakkında girdiğiniz bilgiler; vücut ölçümleri, antrenman geçmişi, beslenme kayıtları ve ilerleme fotoğrafları. Bu veriler antrenör olarak sizin tarafınızdan girilir.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Kullanım verileri:</strong> Platformla etkileşimleriniz — ziyaret edilen sayfalar, kullanılan özellikler ve gerçekleştirilen eylemler — otomatik olarak toplanır.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Cihaz ve teknik veriler:</strong> IP adresi, tarayıcı türü, işletim sistemi ve çerezler.
              </li>
            </ul>
          </Section>

          <Section title="2. Bilgilerinizi Nasıl Kullanıyoruz">
            <p>Topladığımız bilgileri şu amaçlarla kullanıyoruz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Megin platformunu sağlamak, sürdürmek ve geliştirmek.</li>
              <li>Ödemeleri işlemek ve abonelikleri yönetmek.</li>
              <li>İşlemsel e-postalar göndermek (hesap onayları, şifre sıfırlama, fatura makbuzları).</li>
              <li>Ürün güncellemeleri ve duyurular göndermek (istediğiniz zaman abonelikten çıkabilirsiniz).</li>
              <li>Destek taleplerine ve sorgulamalara yanıt vermek.</li>
              <li>Dolandırıcılık, istismar ve güvenlik olaylarını tespit etmek ve önlemek.</li>
              <li>Yasal yükümlülüklere uymak.</li>
            </ul>
            <p>
              Kişisel verilerinizi veya müşterilerinizin verilerini üçüncü taraflara satmıyoruz. Asla.
            </p>
          </Section>

          <Section title="3. Veri Paylaşımı">
            <p>
              Bilgilerinizi yalnızca aşağıdaki sınırlı durumlarda paylaşıyoruz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Hizmet sağlayıcılar:</strong> Katı gizlilik anlaşmaları kapsamında adımıza veri işleyen güvenilir üçüncü taraf satıcılarla çalışıyoruz (ör. veritabanı barındırma için Supabase, ödemeler için Stripe ve e-posta teslimat sağlayıcıları).
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Yasal gereklilikler:</strong> Yasa, mahkeme kararı gerektirdiğinde veya Megin, kullanıcılarımız ya da başkalarının haklarını ve güvenliğini korumak için bilgileri ifşa edebiliriz.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">İş transferleri:</strong> Megin satın alınırsa veya başka bir şirketle birleşirse, bilgileriniz bu işlemin bir parçası olarak aktarılabilir. Bu olmadan önce sizi bilgilendireceğiz.
              </li>
            </ul>
          </Section>

          <Section title="4. Veri Saklama">
            <p>
              Hesabınız aktif olduğu sürece hesap verilerinizi saklarız. Hesabınızı kapatırsanız, kişisel verilerinizi 30 gün içinde sileriz; yasal veya uyumluluk amaçlarıyla saklamamız gereken durumlar hariç (fatura kayıtları için genellikle 7 yıla kadar).
            </p>
            <p>
              Girdiğiniz üye verileri, siz silinceye veya hesabınızı kapatana kadar hesabınızda kalır. Hesap silindikten sonra üye verilerini saklamıyoruz.
            </p>
          </Section>

          <Section title="5. Haklarınız">
            <p>
              Konumunuza bağlı olarak kişisel verilerinizle ilgili aşağıdaki haklara sahip olabilirsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Erişim:</strong> Hakkınızda tuttuğumuz kişisel verilerin bir kopyasını talep etme.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Düzeltme:</strong> Hatalı veya eksik verileri düzeltmemizi talep etme.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Silme:</strong> Kişisel verilerinizin silinmesini talep etme. Bunu doğrudan hesap ayarlarınızdan yapabilirsiniz.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Taşınabilirlik:</strong> Verilerinizi makine tarafından okunabilir bir formatta talep etme.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">İtiraz:</strong> Doğrudan pazarlama dahil belirli veri işlemelerine itiraz etme.
              </li>
            </ul>
            <p>
              Bu haklardan herhangi birini kullanmak için{' '}
              <a
                href="mailto:hello@megin.io"
                className="text-[#DC2626] underline hover:no-underline"
              >
                hello@megin.io
              </a>
              {' '}adresine e-posta gönderin. 30 gün içinde yanıt vereceğiz.
            </p>
          </Section>

          <Section title="6. İletişim">
            <p>
              Bu Gizlilik Politikası veya verilerinizi nasıl işlediğimiz hakkında sorularınız varsa, bize ulaşın:
            </p>
            <div className="bg-[#F5F5F5] p-5 space-y-1">
              <p>
                <strong className="text-[#0A0A0A]">E-posta:</strong>{' '}
                <a
                  href="mailto:hello@megin.io"
                  className="text-[#DC2626] underline hover:no-underline"
                >
                  hello@megin.io
                </a>
              </p>
              <p>
                <strong className="text-[#0A0A0A]">Web sitesi:</strong> megin.io
              </p>
            </div>
          </Section>

          <div className="border-t border-[#E5E7EB] pt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/tr/legal/terms"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Kullanım Koşulları
            </Link>
            <Link
              href="/tr/legal/refund"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              İade Politikası
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
