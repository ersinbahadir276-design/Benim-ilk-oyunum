# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme turlarının özetidir. Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`.
Oynanan oyun: kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası (eski oyun: `yaban.html`).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli oyunda; miğfer/kürk bu turda iyileştirildi. Kalan: zırh yeniden tasarımı (kullanıcı isteği), pelerin arkadan çok karanlık, uzak LOD |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — tüm hareketler kodla üretilen pozlar + IK; anahtar kareli klip/harmanlama sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — elf gövdesi (kraliçe), saç GLB'si, ejderha oyunda; diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, timsah, ejderha, goblinler; geyik/kuş/gece yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — evcilleştirme yalnız eski oyunda (`yaban.html`); ana oyunda Veyra yoldaş YZ'si ve düşman algısı var |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem, seviye/ekipman; dünya genişletme sürüyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PS düzeni, dikey/yatay; gerçek cihazda test edilemedi |

## Tamamlananlar
_(henüz listedeki hiçbir özellik tamamen bitmiş sayılmıyor)_

## Tur günlüğü

### Tur 1 — 2026-11-26 (özellik 1: kahraman)
- Miğfer yüzü yeniden yapıldı (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
  - Kalın, kenarlara taşan turuncu "T" yarık yerine aşağı-içe eğik iki dar göz yarığı (kaşlı bakış) + burun altı ince nefes yarığı.
  - Işıma artık yalnızca yarıkların derininde (z kesmeli decal) → renk düz siperliğe yayılmıyor, uzaktan keskin okunuyor.
  - Çenedeki tırtıklı kesik (delikler ince duvarı kesiyordu) yerine yanaklarda sığ nefes oyukları + alt kenarda bronz rulo kenar.
  - Göz hizasında bronz alın bandı.
- Kürk yaka: yüksek frekanslı gürültü (5 mm vokselde dikenli, kırık üçgenler yapıyordu) yerine düşük frekanslı fbm + yumuşak tutam dalgası.
- Model yeniden derlendi (20 686 üçgen, önce 20 996), `data/models.js`, `dist/` ve kök `index.html` güncellendi.
- Test düzeltmesi: `s-ui.js` "SALDIR basılı tut" testi sabit 2,5 sn bekliyordu; yükleme oyun zamanında ~1,5 sn sonra kendiliğinden bırakıldığı için test yalnız yavaş çizimde geçiyordu. Artık durum yoklanıyor (kare hızından bağımsız).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-save 1/1; s-portrait, s-perf, s-hero hatasız.
- Derleme hattı: `tools/sculpt/cache/` git'te yok, bu yüzden tek model derlemek diğer modelleri `data/models.js`'ten siliyordu.
  `build.mjs` artık eksik cache dosyalarını `data/models.js`'ten açıyor (boş cache ile denendi: çıktı birebir aynı).

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: pelerin malzemesi/ışığı (arkadan neredeyse siyah), göğüs zırhında daha fazla katman/oyma, kemer-kalça bölgesinin kutu görünümü, tasset'lerin "şort" gibi durması; kullanıcının istediği zırh yeniden tasarımı için referans gerekirse sor.
2. Kahraman bitince özellik 2: kahramana anahtar kareli klip sistemi (yürüme/koşu döngüsü, saldırı klipleri) + harmanlama.
