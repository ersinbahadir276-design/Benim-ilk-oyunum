# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya, zamanlanmış görevin her çalışmada okuduğu üst düzey özellik listesidir.
Ayrıntılı oyun yol haritası: `ay-kiliccisi/PROGRESS.md` (oyun: Ay Kılıççısı, `ay-kiliccisi/dist/ay-kiliccisi.html`, kök `index.html` onun kopyası).

## Özellik listesi (öncelik sırası)
- [ ] Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) — DEVAM EDİYOR
- [ ] Gerçekçi 3B karakter animasyonları (anahtar kareli klip sistemi + harmanlama yok)
- [ ] Gönderilen GLB modellerinin entegrasyonu (elf gövdesi, saç, ejderha yapıldı; Kawaiope kızı, wolf_puppy kurt bekliyor)
- [ ] Çok sayıda hayvan ve yaratık (kurt, goblin, timsah, ejderha var; iskelet, örümcek, golem, geyik, kuş yok)
- [ ] Yaratık evcilleştirme ve yapay zekâ (eski oyun yaban.html'de var; Ay Kılıççısı'nda yok)
- [ ] Açık dünya, dövüş, envanter, ilerleme (büyük bölümü var; harita büyütme, zindanlar, lonca bekliyor)
- [ ] Android performansı ve mobil kontroller (dokunmatik düzen var; gerçek cihazda test yok, HUD düzenleyici yok)

## Tamamlananlar
(henüz bu listeden tamamen biten özellik yok)

## Çalışma günlüğü
### 2026-11-16 — Kahraman zırhı yeniden tasarımı, 1. adım (göğüs)
- `tools/sculpt/models/hero.mjs`: gotik katmanlı göğüs zırhı — kabarık göğüs plakaları, sivri (ogee) üst kenarlı
  plakart + bronz kenar, göğüste bronz hilal amblemi (Ay Kılıççısı işareti) + yıldız perçin.
- Bel lamları aşağı doğru genişliyor, her birinin alt kenarı bronz şerit.
- Kürk yaka: voksel altı gürültü kaldırıldı (dikenli görüntü azaldı), tutamlar daha kalın ve topak.
- Model yeniden derlendi (20 662 üçgen, eskisi 20 996), `data/models.js`, `dist/`, kök `index.html` güncellendi.
- Not: `tools/sculpt/cache/` depoda yok; `data/models.js`'ten çözülerek yeniden oluşturuldu (diğer modeller bayt bayt aynı kaldı).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11; oyun içi ekran görüntüsü (s-hero) temiz.

## Sıradaki öncelikler
1. Kahraman zırhının kalanı: omuzluklar (şu an şişkin), uyluk/diz zırhı (şişkin silindir görünümü), eldivenler
   (el çok ince), kürk yakayı daha da yumuşatmak, miğfer yüz siperi detayı. Sonra bu özellik tamamlandı sayılabilir.
2. Animasyon: kahramana anahtar kareli klip sistemi (boşta, yürü, koş, saldırı) + kemik harmanlama.
3. Kawaiope iskeletli Arknights tarzı kız ve wolf_puppy kurt iskeleti (GLB entegrasyonu).
