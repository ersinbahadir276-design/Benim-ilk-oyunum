# PROGRESS — zamanlanmış geliştirme çalışmaları

Bu dosya zamanlanmış görevin (her çalışmada bir özelliği ilerletir) kaydıdır.
Oyunun ayrıntılı tasarım/yol haritası: `ay-kiliccisi/PROGRESS.md`. Yayındaki oyun: kök `index.html` (= `ay-kiliccisi/dist/ay-kiliccisi.html`).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — SDF heykel modeli Kael (Kara Zırh) var; zırh yeniden tasarımı başladı (aşağıda) |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — prosedürel pozlar + kombo/kaçınma/blok; duruşa özgü pozlar eksik |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, kraliçe (elf + saç GLB), iskelet oranları; Kawaiope kız, wolf_puppy iskeleti bekliyor |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin, timsah, ejderha; iskelet/örümcek/golem yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — kurt besleme, Veyra yoldaş YZ; evcil yaratık geliştirme ağacı yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — harita genişletme, zindanlar, lonca bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen, 30 m dış çizgi sınırı; gerçek cihazda test edilmedi, LOD yok |

## Tamamlanan

- (henüz hiçbir özellik tamamen bitmedi)

## Çalışma günlüğü

### 2026-11-25 — Kahraman zırhı yeniden tasarımı, 1. adım (özellik 1)
- `tools/sculpt/models/hero.mjs`:
  - Göğüs zırhı: görünmeyen oyuk süslemeler kaldırıldı; yerine plakanın yüzeyine oturan **kabartma bronz süsleme**
    (z yönünde uzatılmış tüpler × zırh yüzeyi kabuğu) ve ortada **dikey omurga sırtı** (keel).
  - Bel lamları: üst üste dolu "lastik" halkalar yerine 4 ince, aşağı doğru genişleyen, üst üste binen kabuk;
    en alttaki bronz kenarlı.
  - Baldırlık: düz koni yerine **anatomik** biçim (kaval sırtı + şişkin baldır + bileğe doğru açılma),
    üst ve alt bronz bant, üst kenarda 5 perçin.
  - Denendi ve geri alındı: uyluk zırhına bronz kenar bandı — bant kabuğu malzeme seçimini ele geçirip
    bütün uyluğu bronz boyadı.
- `data/models.js` yeniden üretildi (önbellek eksikti; diğer 14 model mevcut `models.js`'ten açılıp korundu).
- Testler: `s-mech` 47/47, `s-loop` 71/71, `s-hero` hata yok (oyun içi görüntüler doğrulandı).

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: uyluk zırhına kenar (malzeme sızmasını önleyerek: ayrı `paint` yerine dışa
   kaydırılmış kabuk), omuzluk dilimlerini incelt, miğfere yanak plakaları; kılıç kınının sırtta görünmesi.
2. Animasyon (özellik 2): duruşlara özgü pozlar (hamle/saplama), kombo bitirici efektleri.
3. GLB (özellik 3): kurtları wolf_puppy iskeletine geçir.
