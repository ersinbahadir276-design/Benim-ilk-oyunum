# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme turlarının özetidir. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, site kökündeki
`index.html` onun `dist` kopyasıdır); eski evcilleştirme oyunu `yaban.html`. Ayrıntılı oturum günlüğü ve tasarım
notları: `ay-kiliccisi/PROGRESS.md`, mimari ve riskler: `ay-kiliccisi/ANALIZ.md`.

## Tamamlanan özellikler
_(Henüz hiçbir ana özellik tamamen bitmiş sayılmıyor — aşağıdaki durum tablosuna bakın.)_

## Özellik durumu (öncelik sırasıyla)
| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik) var; zırh yeniden tasarımı 1. geçiş yapıldı (tur 1). |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen: kodla poz + IK, duruşlar. Anahtar kareli klip sistemi / harmanlama yok. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: elf gövdesi (kraliçe), saç GLB, ejderha, şövalye heykeli; birçok GLB yalnızca iskelet oranı olarak kullanılıyor. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, timsah, goblin türleri, ejderha (yaban.html'de 14 tür). Zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: Veyra yoldaş YZ, görüş/uyarı sistemi; evcilleştirme yalnızca yaban.html'de tam. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var; zindanlar, bölge genişletme, lonca eksik. |
| 7 | Android performansı ve mobil kontroller | Dokunmatik düzen var; gerçek cihazda test edilmedi, LOD yok, HUD düzenleyici yok. |

## Tur günlüğü

### Tur 1 — 2026-11-23 · Özellik 1: kahraman zırhı yeniden tasarımı (1. geçiş)
`ay-kiliccisi/tools/sculpt/models/hero.mjs` → `data/models.js` → `dist` + kök `index.html`.
- Bel lameleri (fauld) "şişik lastik" görünümündeydi: elipsoit merkezi bandın içindeydi. Merkez bandın altına alındı →
  her lame çan gibi aşağı doğru açılıyor, üsttekinin altına giriyor; her lamenin alt kenarına çıkıntılı kenar şeridi,
  en alttaki bronz.
- Uyluk lameleri (tasset) aynı yöntemle düzeltildi: katmanlı, aşağı açılan plakalar.
- Göğüs zırhına oyunun simgesi: kabartma bronz **hilal** (Ay Kılıççısı) ve çok hafif dövme metal dokusu.
- Miğfer: görüş yarığının üstündeki top şeklindeki çıkıntı kaldırıldı, yerine siperliği izleyen kesintisiz kaş sırtı.
- Denenip geri alınanlar: güçlü dövme dokusu (buruşuk görünüyordu), lame perçinleri (sadeleştirmede dikene dönüşüyordu),
  hilal içindeki yıldız (okunmuyordu).
- Model yeniden derlendi (20 994 → 21 000 üçgen, aynı kemikler). Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11;
  oyun içi ekran görüntüleri (s-hero) temiz, koşu pozunda deri bozulması yok.
- Not: `tools/sculpt/cache/` git'te yok. Tek model derlemek için önce mevcut modelleri `data/models.js`'den
  önbelleğe açmak gerekir (aksi halde `build.mjs` yalnızca derlenen modeli yazar):
  `node -e` ile her `ad:"base64"` satırını gunzip edip `cache/<ad>.bin` olarak yazın (tur 1'de böyle yapıldı).

## Sıradaki öncelikler
1. **Kahraman (özellik 1), 2. geçiş:** kalçaların (cuisse) ve dizliklerin hacmi hâlâ kalın; eldiven parmak plakaları,
   dirsek yelpazesi ve omuzluk kenarlarında sadeleştirme pürüzleri; pelerin arkadan düz — kıvrım derinliği.
   Ardından isteğe bağlı miğfersiz baş (yüz) — kullanıcıdan görünüm onayı gerekir.
2. Özellik 2: kahraman için anahtar kareli klip sistemi + harmanlama (ANALIZ.md §3).
3. `tools/sculpt` için `cache/`'i `data/models.js`'den kendiliğinden dolduran küçük bir betik (`build.mjs --unpack`).
