# PROGRESS (zamanlanmış geliştirme görevi)

Bu dosya, her çalıştırmada okunan üst düzey ilerleme listesidir. Ayrıntılı oturum günlüğü ve yol haritası:
`ay-kiliccisi/PROGRESS.md`. Asıl oyun: `ay-kiliccisi/` (kaynak `src/` + `data/`, derleme `python3 ay-kiliccisi/tools/build.py`,
yayın `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

## Özellik listesi (öncelik sırası)
- [ ] Yüksek kaliteli erkek kahraman (Kael, Kara Zırh). **Kısmen yapıldı:** SDF heykel modeli (~21k üçgen, 58 kemik),
      Run 1'de miğfer korunun taşması düzeltildi ve ay arması eklendi. Kalan: kullanıcının istediği tam zırh yeniden tasarımı
      (omuzluk silueti, eldiven/çizme ayrıntısı), miğfer altı yüz/LOD, yakın plan doku keskinliği.
- [ ] Gerçekçi 3B karakter animasyonları. Kahramanın tüm hareketleri kodla üretilen pozlar; anahtar kareli klip sistemi yok.
- [ ] Gönderilen GLB modellerinin entegrasyonu. Ejderha, elf gövdesi (kraliçe), saç: bağlandı. Kawaiope, wolf_puppy: henüz değil.
- [ ] Çok sayıda hayvan ve yaratık. Kurt, goblin (3 tür), timsah, ejderha. Geyik, kuş, ayı, zindan yaratıkları yok.
- [ ] Yaratık evcilleştirme ve yapay zekâ. Görüş/duyma yapay zekâsı ve Veyra yoldaşı var; Ay Kılıççısı'nda evcilleştirme yok
      (eski oyunda, `yaban.html`, vardı).
- [ ] Açık dünya, savaş, envanter, ilerleme. Büyük ölçüde var (2,8 km harita, Tsushima tarzı savaş, 7 sekmeli envanter, seviye).
      Kalan: bölge genişletme, zindanlar, lonca.
- [ ] Android performansı ve mobil kontroller. PlayStation düzeni dokunmatik düğmeler var; gerçek cihazda test edilmedi, HUD düzenleyici yok.

## Tamamlanan
(henüz tamamen biten özellik yok)

## Çalıştırma günlüğü
### Run 1 (2026-11-24): kahraman zırhı, 1. geçiş
- Miğfer: göz yarığının ışıması bir köşe çıkartmasıydı ve basitleştirilmiş ağda yüz plakasına turuncu leke gibi taşıyordu.
  Yerine yarığın içine gömülü bir **kor** parçası kondu; ışık artık yalnızca T yarığının içinde (keskin, öfke rengine uyar).
- Göğüs: bronz kabartma **hilal ay arması** (Ay Kılıççısı), boynuz uçlarında bronz çiviler, ortada soluk mavi **ay taşı**.
  Miğfer alnına küçük bronz hilal.
- Model hattı tuzağı bulundu: `tools/sculpt/cache` boşken `build.mjs hero` çalışırsa `data/models.js` yalnızca kahramanla
  yeniden yazılır, diğer 15 model silinir (kraliçe `king` burada yeniden üretilemez). Önbellek, işlenmiş
  `data/models.js`'ten geri açıldı ve `build.mjs` artık eksik önbelleği her çalışmada `data/models.js`'ten kendisi açıyor
  (doğrulandı: önbelleksiz çalıştırma aynı baytları üretiyor).
- Test: `test/s-armor.js` (yakın plan görüntüler + ışıma köşesi sayısı + ay taşı kontrolü). `__G.MODEL` test için açıldı.

## Sıradaki öncelikler
1. Kahraman zırhı 2. geçiş: omuzluk siluetini büyüt/katmanla, eldiven parmak eklemleri, çizme kayışları; önce/sonra görüntüleri.
2. Kahramana anahtar kareli animasyon klipleri (bekleme nefesi, ağır vuruş hazırlığı) + ayak IK.
3. wolf_puppy iskeletine kurt geçişi (gönderilen GLB entegrasyonu).
