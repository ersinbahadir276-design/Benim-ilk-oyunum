# PROGRESS — zamanlanmış geliştirme turları

Bu dosya zamanlanmış görevin her turda okuduğu özet. Ayrıntılı oyun yol haritası ve oturum günlüğü:
`ay-kiliccisi/PROGRESS.md` (asıl oyun = Ay Kılıççısı; kök `index.html` onun `dist` kopyası, eski oyun `yaban.html`).

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli var (~22k üçgen, 58 kemik); zırh parça parça yeniden tasarlanıyor |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — tüm hareketler kodla üretilen pozlar; anahtar kare klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si bağlı; diğer GLB'lerden yalnız iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem/geyik/kuş yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı, Veyra yoldaş; Ay Kılıççısı'nda evcilleştirme yok (eski `yaban.html` oyununda var) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ganimet/demirci |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PS düzeni, 30 m dış çizgi sınırı; gerçek cihazda ölçülmedi, HUD düzenleyici yok |

## Tamamlananlar

_(Bu listede yalnızca bitmiş özellikler yer alır. Henüz tamamen biten yok.)_

## Tur günlüğü

### Tur 1 — 2026-11-26 · Özellik 1 (erkek kahraman)
- Bacak zırhı artık silindir değil: `tools/sculpt/models/hero.mjs` içinde anatomik uyluk (rectus, vastus lateralis,
  arka adale) ve baldır (gastroknemius çıkıntısı, kaval önü) hacimleri tanımlandı; alt katman ve plakalar bu
  hacimlerden üretiliyor.
- Uyluk zırhı (cuisse): kasa oturan iki bindirmeli plaka, önde yükseltilmiş sırt (omurga), bronz üst kenar, perçin sırası.
- Baldır zırhı (greave): kapalı kabuk, önde sırt, dış yanda menteşe oluğu + 4 perçin, bilekte genişleyen bronz ağız.
- Yeni araç `tools/sculpt/unpack_cache.mjs`: `data/models.js` içinden `cache/*.bin` geri açar; böylece yalnızca
  `build.mjs hero` ile kahraman yeniden üretilir, diğer 15 model (kraliçe dahil) birebir korunur (doğrulandı: kılıç
  yeniden üretimi bayt bayt aynı çıktı verdi).
- Kahraman: 20 996 → 22 036 üçgen. Oyun yeniden derlendi, kök `index.html` güncellendi.
- Testler: `s-mech.js` 47/47 geçti; `s-hero.js` ekran görüntüleri (ön/yan/arka/koşu/ağır/blok) hatasız.

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: göğüs zırhı ön yüzü düz görünüyor → göğüs kası hatları, karın plakaları;
   sabatonlar (ayak) yumru görünüyor → sivri burun, ayrık plakalar; kollar (rerebrace/vambrace) hâlâ koni → kas şekli.
2. Kahraman yüzü/miğfer içi ve pelerin kumaşı için daha fazla kıvrım; sonra özellik 1 "bitti" sayılabilir.
3. Özellik 2: kahramana anahtar kareli klip sistemi (bekleme nefesi, yürüyüş ağırlık aktarımı) — ANALIZ.md §3'teki plan.
