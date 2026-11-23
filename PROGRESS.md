# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin takip dosyasıdır. Oyunun ayrıntılı yol haritası ve tasarım
notları `ay-kiliccisi/PROGRESS.md` içindedir (asıl oyun: `ay-kiliccisi/`, yayın: kökteki `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

## Özellik listesi (rutinin öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli oyunda; 8. oturumda zırh detay geçişi yapıldı (aşağıda). Kalan: yakın çekim yüz/miğfer içi, LOD, kullanıcı onayı |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — animasyonlar hâlâ kodla üretilen pozlar; anahtar kareli klip + harmanlama sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (Şeytan Kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha. İskelet, örümcek, golem, geyik/kuş yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı ve Veyra yoldaşı var; Ay Kılıççısı'nda evcilleştirme yok (eski `yaban.html` oyununda vardı) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ekipman/demirci. Zindan, lonca, büyük harita genişletmesi yok |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PlayStation düzeni, dikey/yatay yerleşim; gerçek cihazda test edilmedi, HUD düzenleyici ve grafik ayarları yok |

## Tamamlananlar

_(Henüz bu listeden tamamen biten özellik yok — bitmemiş iş tamamlandı olarak işaretlenmez.)_

## Oturum günlüğü

### Oturum 8 — 2026-11-23 (zamanlanmış çalışma) · Özellik 1: kahraman zırhı detay geçişi
Önceki oturumdaki (7) dünya/sahne işinden farklı olarak bu oturum kahramana ayrıldı.

Tespit edilen sorunlar (eski görüntüde): göğüs zırhı düz bir kütle gibi görünüyordu — kazıma çizgileri yüzeyin
**dışında** kaldığı için hiçbir şey kesmiyordu; bacak ve kol plakaları düz boru gibiydi; ön tarafta renk/siluet yoktu.

Yapılanlar (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
- Göğüs: etkisiz kazıma kaldırıldı; yerine yüzeyi izleyen **kabartma** detaylar: orta sırt (keel), iki yanda ikişer
  oluklu kaburga çizgisi, sivri kemerli **karın plakası (plackart)** + bronz kenar + 3 perçin. Plackart `Spine`
  kemiğine bağlı, gövde eğilince göğüsten ayrı hareket eder.
- Ön **tabard**: pelerinle aynı kızıl kumaş, kemerden sarkar, kıvrımlı/yırtık etek, bronz arma. Ağırlık: üstte kalça,
  aşağı doğru iki uyluğun ortalaması (koşarken bacak arkasında kalacak şekilde öne doğru açılıyor).
- Kol/bacak plakalarına bronz kenar bantları (üst kol iki uç, ön kol, uyluk alt kenarı, baldır alt kenarı) ve
  uyluk/baldırda yan oluklar.
- Üçgen bütçesi 21k → 24k (gerçek: 23 742 üçgen, 11 146 köşe; telefonda CPU deri — performans testi hatasız).

Araç düzeltmesi (`ay-kiliccisi/tools/sculpt/build.mjs`): `cache/` git'te olmadığı için tek model yeniden
derlenince `data/models.js` yalnızca o modeli içeriyor, diğer 15 model (içe aktarılan, yeniden üretilemeyen
`king` dahil) siliniyordu. Artık mevcut `data/models.js` girdileri korunuyor, yalnızca derlenen model değişiyor.

Testler (Playwright + yazılımsal WebGL): s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-save 1/1,
s-perf hatasız. Oyun içi ön/yan/koşu ekran görüntüleriyle kontrol edildi.

Dürüst not: Görsel beğeni kullanıcı onayı gerektirir; bu oturumda kimse görmedi. Kullanıcının daha önce istediği
"kahraman zırhını yeniden tasarla" isteği bu detay geçişiyle **kısmen** karşılandı, tamamen değil.

## Sıradaki öncelikler
1. **Özellik 1 (devam):** yakın plan/manhwa panelleri için miğfer altı yüz (miğfer çıkarma sahnesi), uzak mesafe
   LOD modeli (~8k üçgen), kullanıcıdan zırh tasarımı için geri bildirim.
2. **Özellik 2:** kahramana anahtar kareli klip sistemi (klip tanımı + crossfade + ayak IK), ilk olarak
   yürüme/koşu/bekleme döngüleri; sonra saldırı klipleri.
3. **Özellik 7:** köy sahnesinde çizim hazırlığı 32,5 ms/kare (diğer bölgeler ~1,6–3,2 ms) — s-perf ölçümüne göre
   en büyük performans darboğazı; incelenmeli.
