# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme turlarının özetidir. Ayrıntılı teknik günlük ve yol haritası:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: **Ay Kılıççısı**, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).
Eski oyun «Yaban Yoldaşları» `yaban.html` + `src/` altında duruyor.

## Tamamlanan özellikler

_(Henüz hiçbir ana özellik tamamen bitmiş sayılmıyor — aşağıdaki durum tablosuna bak.)_

## Ana özellik durumu (dürüst)

| # | Özellik | Durum | Eksik olan |
|---|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — SDF heykel Kara Zırh Kael (~21k üçgen, PBR kanalları); bu tur pelerin kumaş fiziği | Kullanıcının istediği zırh yeniden tasarımı, uzak LOD, saç/kürk ikincil hareketi |
| 2 | Gerçekçi 3B animasyonlar | Kısmen — kodla üretilen pozlar + kol IK, ejderhanın kendi klipleri | Anahtar kareli klip sistemi + harmanlama, ayak IK (eğimde), kök hareketi |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si, iskelet oranları | Kalan GLB'lerin (Kawaiope vb.) kullanıcı isteğine göre bağlanması |
| 4 | Çok sayıda hayvan/yaratık | Kısmen — kurt, timsah, ejderha, goblinler (Ay Kılıççısı); 14 tür (Yaban) | Geyik/kuş, zindan yaratıkları (iskelet, örümcek, golem…) |
| 5 | Yaratık evcilleştirme ve YZ | Kısmen — kurt besleme, Veyra yoldaş YZ'si (Ay Kılıççısı); tam evcilleştirme Yaban'da | Ay Kılıççısı'nda evcil yaratık güçlendirme ağacı, binek |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı savaş, 7 sekmeli sistem penceresi, seviye/ekipman | Harita genişletme, zindanlar, lonca, Mitik nadirlik |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen, kalite ayarı, 30 m ötesi dış çizgi kapalı | Gerçek cihaz testi yapılamadı, HUD düzenleyici, LOD |

## Tur günlüğü

### Tur 1 — 2026-11-23 · Özellik 1 (kahraman): pelerin kumaş fiziği
- Sorun: kahramanın heykel pelerini 3 kemiğe (CapeA/B/C) bağlıydı ama bu kemikler hiç döndürülmüyordu;
  pelerin göğse yapışık sert bir plaka gibi duruyordu.
- Yeni `ay-kiliccisi/src/32-cape.js`: dünya uzayında 4 noktalı Verlet zinciri (çapa + 3 serbest nokta) —
  durgun hava sürüklemesi, yerçekimi, dönüşte savrulma, animasyonlu dinlenme duruşuna yumuşak çekim,
  uzunluk kısıtı (kumaş uzamaz), gövde/uyluk/baldır kapsülleri ve kalça düzlemiyle çarpışma (pelerin hep
  arkaya itilir, bacak arasından öne kaçmaz), ışınlanma/dirilişte sıfırlama, manhwa panellerinde (dt=0) donuk.
- Oyun döngüsü (`60-game.js`) ve hikâye panelleri (`58-story.js`) bağlandı; `__G.CAPE` test için açıldı.
- Yeni test `ay-kiliccisi/test/s-cape.js`: 9/9 geçti (asılı durma, uzamama, depar sırasında kalkıp arkada
  kalma, bacakların içinden geçmeme, dönüşte savrulma, durunca yerine oturma, ışınlanma, ağır saldırı).

## Sonraki öncelikler
1. Özellik 1 devam: kahraman zırhı yeniden tasarımı (kullanıcı isteği; `tools/sculpt/models/hero.mjs`),
   kürk yakaya ve boynuz sorgucuna küçük ikincil hareket, uzak mesafe LOD modeli.
2. Özellik 2: kahraman için anahtar kareli klip sistemi (yürüme/koşu/saldırı eğrileri) + eğimde ayak IK.
3. Özellik 7: kahraman CPU derisini GPU deriye taşıma (58 kemik → telefonda kare süresi).
