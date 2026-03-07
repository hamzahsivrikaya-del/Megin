import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import CronTrigger from './CronTrigger'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl heading-display">Ayarlar</h1>

      <Card glow>
        <CardHeader><CardTitle>Genel Ayarlar</CardTitle></CardHeader>
        <p className="text-sm text-text-secondary">
          Sistem ayarları burada yapılandırılabilir. Bildirim şablonları ve push notification ayarları için Bildirimler sayfasını kullanın.
        </p>
      </Card>

      <Card glow>
        <CardHeader><CardTitle>Haftalık Rapor</CardTitle></CardHeader>
        <p className="text-sm text-text-secondary mb-4">
          Raporlar her Pazar 18:00&apos;de otomatik oluşturulur. Aşağıdan manuel olarak tetikleyebilirsiniz.
        </p>
        <CronTrigger />
      </Card>
    </div>
  )
}
