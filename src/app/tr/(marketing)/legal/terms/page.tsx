import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — Megin',
  description:
    'Megin Kullanım Koşullarını okuyun. Bu koşullar, Megin platformunu ve hizmetlerini kullanımınızı düzenler.',
  alternates: {
    languages: {
      en: '/legal/terms',
      tr: '/tr/legal/terms',
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

export default function TurkishTermsOfServicePage() {
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
            <span className="text-xs text-[#0A0A0A]">Kullanım Koşulları</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Yasal
          </p>
          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            KULLANIM KOŞULLARI
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Son güncelleme: Mart 2026</p>
        </div>
      </section>

      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Koşulların Kabulü">
            <p>
              Megin&apos;e (&quot;Hizmet&quot;) erişerek veya kullanarak, bu Kullanım Koşullarına (&quot;Koşullar&quot;) bağlı olmayı kabul edersiniz. Bu Koşulları kabul etmiyorsanız Hizmeti kullanmayın.
            </p>
            <p>
              Bu Koşullar, hesap oluşturan kişisel antrenörler ve koçlar (&quot;Antrenörler&quot;) ve platform üzerinden yönetilen müşteriler dahil Hizmetin tüm kullanıcıları için geçerlidir.
            </p>
          </Section>

          <Section title="2. Hesap Kaydı">
            <p>
              Megin&apos;i kullanmak için geçerli bir e-posta adresiyle hesap oluşturmanız gerekir. Şunlardan sorumlusunuz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doğru ve eksiksiz kayıt bilgileri sağlamak.</li>
              <li>Şifrenizin güvenliğini ve gizliliğini korumak.</li>
              <li>Hesabınızda gerçekleşen tüm etkinlikler.</li>
              <li>Hesabınıza yetkisiz erişimi bize derhal bildirmek.</li>
            </ul>
            <p>
              Hesap oluşturmak için en az 18 yaşında olmanız gerekir. Hesap oluşturarak bu gereksinimi karşıladığınızı beyan edersiniz.
            </p>
          </Section>

          <Section title="3. Kullanım Lisansı">
            <p>
              Megin, bu Koşullara tabi olarak kişisel antrenörlük işiniz için Hizmeti kullanmanız amacıyla size sınırlı, münhasır olmayan, devredilemez, iptal edilebilir bir lisans verir.
            </p>
            <p>Aşağıdakileri yapmamayı kabul edersiniz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Önceden yazılı izin almadan Hizmetin herhangi bir bölümünü kopyalamak, değiştirmek veya dağıtmak.</li>
              <li>Hizmeti yasa dışı veya yetkisiz amaçlar için kullanmak.</li>
              <li>Hizmetin kaynak kodunu tersine mühendislik yapmaya, derlemeye veya çıkarmaya çalışmak.</li>
              <li>Hizmete erişmek için otomatik araçlar (botlar, tarayıcılar) kullanmak.</li>
              <li>Hizmet üzerinden virüs, kötü amaçlı yazılım veya zararlı kod iletmek.</li>
              <li>Yasadışı, iftira niteliğinde veya üçüncü taraf haklarını ihlal eden içerik depolamak veya iletmek için Hizmeti kullanmak.</li>
            </ul>
          </Section>

          <Section title="4. Ödemeler ve Abonelikler">
            <p>
              Megin ücretsiz plan ve ücretli abonelik planları sunar. Ücretli bir plana abone olarak:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ödeme yönteminizin yinelenen olarak (aylık veya yıllık) ücretlendirilmesine yetki verirsiniz.</li>
              <li>Abonelik ücretleri her fatura döneminin başında peşin olarak tahsil edilir.</li>
              <li>Fiyatlar 30 günlük bildirimle değişebilir. Fiyat değişikliğinden sonra kullanmaya devam etmek kabul anlamına gelir.</li>
              <li>Tüm ödemeler Stripe üzerinden güvenli bir şekilde işlenir. Tam kart bilgilerinizi saklamıyoruz.</li>
            </ul>
            <p>
              Ücretsiz plan, 3 müşteriye kadar temel özelliklere erişimi içerir. Özellik kullanılabilirliği planlar arasında farklılık gösterebilir.
            </p>
          </Section>

          <Section title="5. Fesih">
            <p>
              Hesabınızı istediğiniz zaman hesap ayarlarınızdan iptal edebilirsiniz. İptal, mevcut fatura döneminin sonunda geçerli olur.
            </p>
            <p>
              Bu Koşulları ihlal etmeniz, sahte faaliyette bulunmanız veya Hizmeti ve kullanıcılarını korumak için gerekli gördüğümüz diğer durumlarda hesabınızı bildirimsiz askıya alma veya feshetme hakkını saklı tutarız.
            </p>
            <p>
              Fesih üzerine Hizmeti kullanma hakkınız sona erer. İptalden sonra 30 gün boyunca verilerinizi dışa aktarabilirsiniz, ardından kalıcı olarak silinecektir.
            </p>
          </Section>

          <Section title="6. Sorumluluk Reddi">
            <p>
              Hizmet, zımni garantiler dahil ancak bunlarla sınırlı olmamak üzere, satılabilirlik, belirli bir amaca uygunluk veya ihlal etmeme zımni garantileri dahil olmak üzere herhangi bir türde açık veya zımni garanti olmaksızın &quot;olduğu gibi&quot; ve &quot;mevcut olduğu gibi&quot; sağlanır.
            </p>
            <p>
              Megin, Hizmetin kesintisiz, hatasız veya güvenlik açıklarından uzak olacağını garanti etmez. Teknik arızalardan kaynaklanan veri kayıplarından sorumlu değiliz.
            </p>
            <p>
              Megin, kişisel antrenörler için bir yazılım platformudur. Sağlık hizmeti sağlayıcısı değiliz ve tıbbi tavsiye vermiyoruz. Antrenörler, müşterilerine verdikleri fitness ve beslenme rehberliğinden yalnızca kendileri sorumludur.
            </p>
          </Section>

          <Section title="7. Sorumluluk Sınırlaması">
            <p>
              Yürürlükteki yasaların izin verdiği azami ölçüde, Megin Hizmeti kullanımınızdan veya kullanamamanızdan kaynaklanan dolaylı, arızi, özel, sonuçsal veya cezai zararlardan, kar, veri veya iyi niyet kaybı dahil olmak üzere sorumlu tutulamaz.
            </p>
            <p>
              Bu Koşullardan veya Hizmetin kullanımından kaynaklanan herhangi bir talep için size olan toplam sorumluluğumuz, talebin önceki 12 ayında bize ödediğiniz tutarı aşmaz.
            </p>
          </Section>

          <Section title="8. İletişim">
            <p>
              Bu Kullanım Koşulları hakkında sorularınız varsa bize ulaşın:
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
              href="/tr/legal/privacy"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Gizlilik Politikası
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
