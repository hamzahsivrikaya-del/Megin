import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik ve Kişisel Verilerin Korunması Politikası | Megin',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#44403C]">{children}</div>
    </section>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <p className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider mb-3">{label}</p>
      <div className="space-y-1 text-sm text-[#44403C]">{children}</div>
    </div>
  )
}

export default function GizlilikPolitikasi() {
  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="text-center space-y-2 pb-6 border-b border-[#E5E5E5]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">Gizlilik ve Kişisel Verilerin Korunması Politikası</h1>
        <p className="text-xs text-[#A8A29E]">Son Güncelleme: 26 Şubat 2026</p>
      </div>

      <Section title="1. Veri Sorumlusu">
        <p>6698 Sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu:</p>
        <InfoCard label="İletişim Bilgileri">
          <p><span className="font-medium text-[#1A1A1A]">Ünvan:</span> Megin</p>
          <p><span className="font-medium text-[#1A1A1A]">Web:</span> www.megin.ai</p>
        </InfoCard>
      </Section>

      <Section title="2. Toplanan Kişisel Veriler">
        <InfoCard label="Kimlik ve İletişim Bilgileri">
          <p>Ad, soyad, e-posta adresi, telefon numarası, fatura ve ödeme bilgileri.</p>
        </InfoCard>
        <InfoCard label="Sağlık ve Fitness Bilgileri (Açık Rızaya Dayalı)">
          <p>Yaş, boy, kilo, vücut ölçüleri, geçirilmiş ameliyat, kronik hastalık ve sakatlanma geçmişi.</p>
          <p>Antrenman performans verileri, ilerleme fotoğrafları (onay alınarak), beslenme alışkanlıkları ve hedefler.</p>
        </InfoCard>
        <InfoCard label="Teknik Veriler">
          <p>IP adresi, tarayıcı bilgisi, ziyaret saati ve çerezler aracılığıyla toplanan kullanım verileri.</p>
        </InfoCard>
      </Section>

      <Section title="3. Kişisel Verilerin İşlenme Amacı">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Hizmet sözleşmesinin kurulması ve ifası</li>
          <li>Kişiye özel antrenman programı hazırlanması</li>
          <li>Müşteri sağlığının takibi ve güvenli antrenman sunulması</li>
          <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, fatura vb.)</li>
          <li>Açık rıza alınması şartıyla pazarlama ve bilgilendirme iletişimi</li>
        </ul>
      </Section>

      <Section title="4. Hukuki Dayanak">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Sözleşmenin ifası için zorunlu veriler: KVKK m.5/2-c</li>
          <li>Sağlık verileri: Açık rıza (KVKK m.6/2)</li>
          <li>Yasal yükümlülükler: KVKK m.5/2-ç</li>
          <li>Meşru menfaat: KVKK m.5/2-f</li>
        </ul>
      </Section>

      <Section title="5. Kişisel Verilerin Aktarılması">
        <p>Ödeme işlemleri için ödeme altyapısı sağlayıcılarına (PayTR, iyzico vb.) aktarılır.</p>
        <p>Yasal zorunluluk halinde yetkili kamu kurumlarıyla paylaşılır.</p>
        <p>Pazarlama ve istatistik için analitik hizmet sağlayıcılarıyla anonimleştirilerek paylaşılabilir.</p>
        <p>Yurt dışına veri aktarımı yapılmamaktadır.</p>
      </Section>

      <Section title="6. Saklama Süresi">
        <p>Müşteri ilişkisi süresince ve sona ermesinden itibaren Türk Ticaret Kanunu ve Vergi Usul Kanunu gereği 10 yıl saklanır.</p>
        <p>Sağlık verileri, ilişki sona erdikten sonra açık rızanız iptal edilmedikçe 5 yıl saklanır.</p>
        <p>Bu sürelerin sonunda veriler güvenli yöntemlerle imha edilir.</p>
      </Section>

      <Section title="7. Haklarınız (KVKK m.11)">
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen veriler hakkında bilgi talep etme</li>
          <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme</li>
          <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</li>
          <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
          <li>İşlemeye itiraz etme</li>
          <li>Otomatik sistemler aracılığıyla aleyhinize oluşan kararlara itiraz etme</li>
          <li>Hukuka aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
        </ul>
        <p className="mt-3">Haklarınızı kullanmak için info@megin.ai adresine kimliğinizi doğrulayan bilgilerle yazılı başvuruda bulunabilirsiniz. Başvurunuz 30 gün içinde yanıtlanır.</p>
      </Section>

      <Section title="8. Çerez Politikası">
        <InfoCard label="Zorunlu Çerezler">
          <p>Sitenin çalışması için gereklidir, kapatılamaz.</p>
        </InfoCard>
        <InfoCard label="Analitik Çerezler">
          <p>Google Analytics gibi araçlarla ziyaretçi davranışı analiz edilir. Tarayıcı ayarlarından devre dışı bırakılabilir.</p>
        </InfoCard>
        <InfoCard label="Pazarlama Çerezleri">
          <p>Yalnızca açık rızanızla etkinleştirilir. Çerez tercih panelinden yönetebilirsiniz.</p>
        </InfoCard>
      </Section>

      <Section title="9. Güvenlik">
        <p>Kişisel verileriniz SSL şifreleme, güvenli sunucular ve erişim kontrolü gibi teknik ve idari tedbirlerle korunmaktadır.</p>
      </Section>

      <Section title="10. Politika Değişiklikleri">
        <p>Bu politika gerektiğinde güncellenir. Değişiklikler web sitesinde yayımlandığı tarihte yürürlüğe girer. Önemli değişiklikler e-posta ile bildirilir.</p>
      </Section>

      <Section title="11. İletişim">
        <InfoCard label="Bize Ulaşın">
          <p><span className="font-medium text-[#1A1A1A]">Web:</span> www.megin.ai</p>
        </InfoCard>
      </Section>
    </div>
  )
}
