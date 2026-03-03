#!/usr/bin/env python3
"""Megin Paket Yapısı PDF Oluşturucu"""

from fpdf import FPDF

FONT_DIR = "/System/Library/Fonts/Supplemental/"

class MeginPDF(FPDF):
    def setup_fonts(self):
        self.add_font("Arial", "", FONT_DIR + "Arial.ttf", uni=True)
        self.add_font("Arial", "B", FONT_DIR + "Arial Bold.ttf", uni=True)
        self.add_font("Arial", "I", FONT_DIR + "Arial Italic.ttf", uni=True)

    def header(self):
        self.set_font("Arial", "B", 20)
        self.set_text_color(220, 38, 38)  # #DC2626
        self.cell(0, 12, "Megin", align="L")
        self.set_font("Arial", "", 10)
        self.set_text_color(120, 120, 120)
        self.cell(0, 12, "2026-03-03", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(220, 38, 38)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Megin - Paket Yapisi | Sayfa {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title):
        self.set_font("Arial", "B", 16)
        self.set_text_color(26, 26, 26)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def sub_title(self, title):
        self.set_font("Arial", "B", 12)
        self.set_text_color(60, 60, 60)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("Arial", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def add_table(self, headers, rows, col_widths=None):
        if col_widths is None:
            col_widths = [190 / len(headers)] * len(headers)

        # Header
        self.set_font("Arial", "B", 9)
        self.set_fill_color(220, 38, 38)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 8, h, border=1, fill=True, align="C")
        self.ln()

        # Rows
        self.set_font("Arial", "", 9)
        self.set_text_color(50, 50, 50)
        fill = False
        for row in rows:
            if fill:
                self.set_fill_color(248, 248, 248)
            else:
                self.set_fill_color(255, 255, 255)

            max_h = 8
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, cell, border=1, fill=True, align="C")
            self.ln()
            fill = not fill
        self.ln(4)

    def badge(self, text, color):
        self.set_font("Arial", "B", 11)
        r, g, b = color
        self.set_fill_color(r, g, b)
        self.set_text_color(255, 255, 255)
        w = self.get_string_width(text) + 12
        self.cell(w, 9, text, fill=True, align="C")
        self.set_text_color(50, 50, 50)
        self.ln(2)


pdf = MeginPDF()
pdf.setup_fonts()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_page()

# Title
pdf.set_font("Arial", "B", 24)
pdf.set_text_color(26, 26, 26)
pdf.cell(0, 15, "Paket Yapisi", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Arial", "", 11)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 8, "Free  |  Pro  |  Elite", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(8)

# Genel Bakis
pdf.section_title("Genel Bakis")
pdf.body_text(
    "Megin 3 katmanli paket yapisi sunar. Her paket bir oncekinin tum ozelliklerini icerip "
    "ustune yeni degerler ekler. Temel ayirici: danisan limiti + ozellik kilidi."
)

pdf.add_table(
    ["Paket", "Danisan Limiti", "Fiyat", "Hedef Kitle"],
    [
        ["Free", "3", "0 TL", "Urunu taniyan PT"],
        ["Pro", "10", "Belirlenecek", "Aktif calisan PT"],
        ["Elite", "Sinirsiz", "Belirlenecek", "Buyuyen / ciddi PT"],
    ],
    [40, 40, 45, 65]
)

# FREE
pdf.add_page()
pdf.badge("  FREE  -  BASLANGIC  ", (100, 116, 139))
pdf.ln(6)
pdf.sub_title("3 Danisan  |  0 TL  |  Kredi karti istenmez")
pdf.ln(2)
pdf.body_text(
    "Amac: PT urunu denesin, bagimli olsun, ama gercek isini yurutemesin. "
    "Temel takip araclari acik, ileri ozellikler kilitli."
)

pdf.add_table(
    ["Ozellik", "Durum"],
    [
        ["Danisan ekleme + davet linki", "Acik (3 limit)"],
        ["Temel antrenman programi", "Acik"],
        ["Ders sayisi takibi", "Acik"],
        ["Temel olcum girisi (kilo, boy)", "Acik"],
        ["PT Handle (public profil)", "Acik"],
        ["Olcum grafikleri", "Kilitli"],
        ["Beslenme takibi", "Kilitli"],
        ["Haftalik raporlar", "Kilitli"],
        ["Push bildirimler", "Kilitli"],
        ["Finans ekrani", "Kilitli"],
        ["Ilerleme fotograflari", "Kilitli"],
        ["Rozet sistemi", "Kilitli"],
    ],
    [120, 70]
)

pdf.sub_title("Upgrade Tetikleyicileri")
pdf.body_text(
    "1. 4. danisani eklemek istediginde -> \"Pro'ya gec\" mesaji\n"
    "2. Kilitli ozellige tikladiginda -> \"Bu ozellik Pro'da\" popup\n"
    "3. Dashboard'da kilitli kartlar gorunur -> deger hissi olusur"
)

# PRO
pdf.add_page()
pdf.badge("  PRO  ", (220, 38, 38))
pdf.ln(6)
pdf.sub_title("10 Danisan  |  Fiyat belirlenecek")
pdf.ln(2)
pdf.body_text(
    "Amac: PT isini duzgun yurutebilsin. Danisan takibi, beslenme, "
    "raporlama, finans — profesyonel PT'nin ihtiyac duydugu her sey."
)

pdf.set_font("Arial", "I", 10)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 6, "Free'deki her sey +", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)

pdf.add_table(
    ["Ozellik", "Aciklama"],
    [
        ["Olcum grafikleri", "Detayli grafik + trend analizi"],
        ["Beslenme takibi", "Ogun + foto yukle"],
        ["Haftalik raporlar", "Otomatik danisan raporu"],
        ["Push bildirimler", "Danisan aksiyonlari bildirim"],
        ["Finans ekrani", "Aylik gelir ozeti"],
        ["Fitness araclari", "BMI, kalori vb. 7 arac"],
    ],
    [70, 120]
)

pdf.sub_title("Elite'e Upgrade Tetikleyicileri")
pdf.body_text(
    "1. 11. danisani eklemek istediginde -> \"Elite'e gec\"\n"
    "2. Rozet, blog, risk skoru gibi Elite ozellikler gorunur ama kilitli\n"
    "3. Ilerleme fotografi karsilastirma -> en guclu tetikleyici"
)

# ELITE
pdf.add_page()
pdf.badge("  ELITE  ", (17, 24, 39))
pdf.ln(6)
pdf.sub_title("Sinirsiz Danisan  |  Fiyat belirlenecek")
pdf.ln(2)
pdf.body_text(
    "Amac: Buyuyen PT icin sinir yok. Profesyonel fark yaratan ozellikler: "
    "ilerleme fotografi karsilastirma, rozet sistemi, blog, risk skoru, "
    "Instagram paylasim karti ve gelecek ay gelir tahmini."
)

pdf.set_font("Arial", "I", 10)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 6, "Pro'daki her sey +", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)

pdf.add_table(
    ["Ozellik", "Aciklama"],
    [
        ["Ilerleme fotograflari", "On/yan/arka + slider karsilastirma"],
        ["Rozet sistemi", "23 rozet, danisan motivasyonu"],
        ["Blog", "PT uzmanligini gosterir"],
        ["Bagli uye (veli-cocuk)", "Ebeveyn cocugunu takip eder"],
        ["Risk skoru", "Kopma riski olan danisani erken gor"],
        ["Instagram paylasim karti", "Otomatik sosyal medya icerigi"],
        ["Finans tahmini", "Gelecek ay gelir projeksiyonu"],
    ],
    [70, 120]
)

# KARSILASTIRMA TABLOSU
pdf.add_page()
pdf.section_title("Tam Karsilastirma Tablosu")
pdf.ln(2)

features = [
    ["Danisan limiti",           "3",       "10",     "Sinirsiz"],
    ["Antrenman programi",       "Acik",    "Acik",   "Acik"],
    ["Ders sayisi takibi",       "Acik",    "Acik",   "Acik"],
    ["Temel olcum (kilo, boy)",  "Acik",    "Acik",   "Acik"],
    ["PT Handle",                "Acik",    "Acik",   "Acik"],
    ["Olcum grafikleri",         "---",     "Acik",   "Acik"],
    ["Beslenme takibi",          "---",     "Acik",   "Acik"],
    ["Haftalik raporlar",        "---",     "Acik",   "Acik"],
    ["Push bildirimler",         "---",     "Acik",   "Acik"],
    ["Finans ekrani (ozet)",     "---",     "Acik",   "Acik"],
    ["Fitness araclari (7)",     "---",     "Acik",   "Acik"],
    ["Ilerleme foto + slider",   "---",     "---",    "Acik"],
    ["Rozet sistemi (23)",       "---",     "---",    "Acik"],
    ["Blog",                     "---",     "---",    "Acik"],
    ["Bagli uye (veli-cocuk)",   "---",     "---",    "Acik"],
    ["Risk skoru",               "---",     "---",    "Acik"],
    ["Instagram karti",          "---",     "---",    "Acik"],
    ["Finans tahmini",           "---",     "---",    "Acik"],
]

pdf.add_table(
    ["Ozellik", "Free", "Pro", "Elite"],
    features,
    [76, 38, 38, 38]
)

# Donusum hunisi
pdf.add_page()
pdf.section_title("Donusum Hunisi")
pdf.ln(2)
pdf.body_text(
    "PT duyar (Instagram, tavsiye, Google)\n"
    "  -> Pazarlama sitesini ziyaret eder\n"
    "  -> Free'ye kaydolur (0 TL, kredi karti istenmez)\n"
    "  -> 3 danisan ekler, 2-4 hafta kullanir\n"
    "  -> 4. danisani eklemek ister -> Pro'ya gecis\n"
    "  -> 10 danisani dolunca -> Elite'e gecis\n"
    "  -> Sinirsiz devam eder"
)

pdf.ln(4)
pdf.section_title("Fiyatlandirma Notlari")
pdf.body_text(
    "- Free: 0 TL, kredi karti istenmez\n"
    "- Pro ve Elite fiyatlari launch oncesi belirlenecek\n"
    "- Sabit fiyat, danisan sayisina gore artmayacak (tier icinde)\n"
    "- Yillik planda indirim planlanabilir\n"
    "- Gymsoft referansi: salon yazilimi 690 TL/ay\n"
    "- Rakipler: $19-22/ay baslangic (yaklasik 600-700 TL)\n"
    "- Tek tikla iptal, gizli ucret yok"
)

pdf.ln(4)
pdf.section_title("Temel Prensipler")
pdf.body_text(
    "1. Kilitli ozellikler gorunur ama tiklaninca upgrade mesaji cikar\n"
    "2. PT urunun tamamini gorur, degerini anlar\n"
    "3. Free'den Pro'ya: danisan limiti + ozellik kilidi (cift tetikleyici)\n"
    "4. Pro'dan Elite'e: danisan limiti + premium ozellikler\n"
    "5. Elite'in en guclu cekim ozelligi: ilerleme fotografi karsilastirma"
)

# Save
output_path = "/Users/hamzasivrikaya/Projects/Megin/docs/plans/2026-03-03-paket-yapisi.pdf"
pdf.output(output_path)
print(f"PDF olusturuldu: {output_path}")
