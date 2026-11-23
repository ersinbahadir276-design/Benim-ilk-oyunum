# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış rutinin her çalıştırmada okuduğu özet ilerleme kaydıdır.
Etkin oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, teslim `ay-kiliccisi/dist/ay-kiliccisi.html`, kökteki `index.html` bunun kopyası).
Ayrıntılı oyun günlüğü ve yol haritası: `ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları): `yaban.html` + `src/`.

Derleme ve test:
- Modeller: `cd ay-kiliccisi/tools/sculpt && npm install`, ardından önbelleği `data/models.js`ten geri aç
  (önbellek git'te yok; yalnızca bir modeli derlemek `data/models.js`i önbellekteki modellerle yeniden yazar),
  sonra `node --max-old-space-size=6000 build.mjs hero`
- Oyun: `python3 ay-kiliccisi/tools/build.py` → `cp ay-kiliccisi/dist/ay-kiliccisi.html index.html`
- Testler: `cd ay-kiliccisi && node test/harness.js test/s-mech.js` (47), `test/s-loop.js` (71), `test/s-hero.js` (görüntüler)

## Özellik listesi

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel model var, zırh yeniden tasarımı sürüyor |
| Gerçekçi 3B karakter animasyonları | Yapılmadı (prosedürel pozlar var; duruşlara özgü pozlar eksik) |
| Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, heykel, elf kraliçe, saç GLB'si; diğerleri yalnızca iskelet oranı) |
| Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, timsah, ejderha; iskelet/örümcek/golem yok) |
| Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ; evcil yaratık ağacı yok) |
| Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, seviye); zindanlar/lonca yok |
| Android performansı ve mobil kontroller | Kısmen (dokunmatik düzen, 30 m dış çizgi sınırı; gerçek cihaz testi yok, LOD yok) |

## Tamamlananlar

### Çalıştırma 1 — 2026-11-23 · Kahraman zırhı, 1. adım: kimlik ve siluet
- Göğüs zırhına kabartma **gümüş ay hilali** (oyunun adı "Ay Kılıççısı" — kahramanın işareti), göğüs plakası artık düz bir kütle değil.
- Sol omuzdan sağ kalçaya **deri çapraz kayış** (pirinç halkalı), hilalin altından geçecek şekilde yerleştirildi.
- Kemerin önünden dizlere inen **kızıl tabart** (pelerinle aynı kumaş, üstünde pirinç şerit, yırtık etek);
  ağırlıkları kalçadan bacaklara kademeli geçiyor, koşu animasyonunda gerilmiyor.
- Kemerde iki **deri kese** (sağ ön, sol arka) pirinç tokalı.
- Model: 21 180 üçgen (önceki 20 996), bütçe korunarak.
- Denenen ve bırakılan: tabart üstüne işlemeli hilal — 5 mm voksel + sadeleştirme hilali bulanık bir topa çeviriyor
  (köşe başına renk, düz kumaşta az köşe). Amblem gerekiyorsa doku (UV) ile yapılmalı, geometriyle değil.
- Testler: s-mech 47/47, s-loop 71/71, s-hero ekran görüntüleri hatasız.

## Sıradaki öncelikler
1. Kahraman (devam): düz silindir bacaklar → diz altı plaka kıvrımı ve baldır şekli; kask ziyneti/ay hilali tepelik;
   göğüs plakasına göğüs kası hatları; omuz plakalarının "şişkin" görüntüsünü inceltmek.
2. Kahraman tamamlanınca: duruşlara özgü animasyon pozları (hamle/saplama), kombo bitirici efektleri.
3. Kurtları wolf_puppy iskeletine geçirmek; yeni yaratıklar (iskelet, örümcek).
