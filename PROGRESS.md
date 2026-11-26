# PROGRESS — zamanlanmış geliştirme çalışmaları

Bu dosya, zamanlanmış görevin her çalışmada okuduğu özet ilerleme kaydıdır.
Asıl oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, teslim: `ay-kiliccisi/dist/ay-kiliccisi.html`, kökteki `index.html` onun kopyasıdır).
Ayrıntılı oturum notları: `ay-kiliccisi/PROGRESS.md`, mimari: `ay-kiliccisi/ANALIZ.md`.
Eski three.js oyunu (Yaban Yoldaşları) `yaban.html` + `src/` olarak duruyor; yeni iş Ay Kılıççısı'na yapılıyor.

Derleme: `cd ay-kiliccisi && python3 tools/build.py` → sonra `cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Kısmen** — Kael (Kara Zırh) SDF heykel modeli, 58+3 kemik, CPU deri, PBR ışık. Pelerin fiziği eklendi (bu çalışma). Kalan: zırhın yeniden tasarımı (kullanıcı isteği), saç/kumaş başka ikincil hareketler, uzak LOD |
| 2 | Gerçekçi 3B karakter animasyonları | **Kısmen** — kodla üretilen pozlar + kol IK + eğimde ayak IK ve başla hedefe bakış (çalışma 2). Kalan: gerçek hareket klipleri (Quaternius, başka dalda hazır), duruşlara özgü pozlar |
| 3 | Gönderilen GLB modellerin entegrasyonu | **Kısmen** — ejderha, elf gövdesi (kraliçe), saç GLB'si bağlı; diğerlerinden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | **Kısmen** — kurt, goblin (3 tür), timsah, ejderha. Kalan: iskelet, örümcek, golem, hortlak, geyik/kuş |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen** — görüş/uyarı yapay zekâsı, Veyra yoldaşı, kurt besleme. Evcilleştirme sistemi eski oyunda (yaban.html) var, Ay Kılıççısı'na taşınmadı |
| 6 | Açık dünya, dövüş, envanter, ilerleme | **Büyük ölçüde** — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/stat/yetenek, kayıt. Kalan: harita genişletme, zindanlar, yetenek ağacı |
| 7 | Android performansı ve mobil kontroller | **Kısmen** — PlayStation düzenli dokunmatik düğmeler, 30 m ötesi dış çizgi kapalı. Kalan: HUD düzenleyici, grafik kalite ayarı, gerçek cihaz testi yapılamıyor |

Hiçbir özellik henüz "tamamlandı" olarak işaretlenmedi.

## Tamamlananlar

### Çalışma 1 — 2026-11-26 (özellik 1: kahraman)
- Kahramanın pelerini artık fizikli: `ay-kiliccisi/src/32-cape.js`. Pelerin kemikleri (CapeA/B/C) daha önce
  tanımlıydı ama hiç sürülmüyordu, pelerin gövdeye yapışık sabit duruyordu.
  - Dünya uzayında 4 noktalı Verlet zinciri: yerçekimi, hava sürtünmesi, omuza göre iç sönümleme, hızla artan dalgalanma.
  - Model uzayında sınırlar: sırt ve bacakların arkasında kalır (bacak içine girmez), yana en fazla 13 cm/segment,
    başın üstüne savrulmaz; düzeltmeler önceki konuma da uygulandığı için çarpışma enerji pompalamaz.
  - Işınlanma/yeniden doğmada sıfırlanır, oyun duraklatılınca donar; kemikler üst gövdenin bükülmesini korur.
  - Ölçülen davranış: durunca dik sarkar, depar sırasında ~35° geriye akar, dönüşte yana savrulur, zıplarken havalanır.
- Yeni test: `ay-kiliccisi/test/s-cape.js` (7 test). Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-save 1/1, s-perf hatasız (oyuncu mantığı ~0,15 ms/kare).
  s-ui 6/7: «SALDIR basılı tut = ağır saldırı» testi bu değişiklikten ÖNCE de başarısızdı (oturum 7'deki PlayStation düğme düzeni sonrası test güncellenmemiş) — sıradaki işlere eklendi.

### Çalışma 2 — 2026-11-26 (özellik 2: animasyon)
- **Sorun bulundu:** zamanlanmış çalışmaların her biri `main`'den ayrı bir `ccr-…` dalı açmış, hiçbiri birleştirilmemiş
  (~30 dalda tekrarlanan kahraman zırhı / ayak IK / klip işleri). Bu çalışma önceki çalışmanın dalını (`ccr-70a30f22-j1ro1l`,
  pelerin) temel aldı; böylece ilerleme artık birikiyor.
- Ayak IK'sı (`ccr-70a30f22-4jf2et` dalında yazılmış, hiç birleşmemişti) bu çizgiye taşındı: `src/32-footik.js`.
  Sıra: `applyPose → footIK → playerMatrix → capeStep` (pelerin IK sonrası bacaklara göre çarpışır).
  - Eğimde iki kemikli bacak IK'sı, leğen alçalması, tabanın eğime yatması; baş kilitli/yakın düşmana döner.
- `test/s-footik.js` genişletildi: eğimde IK + pelerin birlikte (pelerin bacağa girmez, sayılar kararlı). 6/6.
- Regresyon: s-cape 7/7, s-ui 7/7 (önceki çalışmadaki «ağır saldırı» hatası bu kez tekrarlanmadı — kararsız test olabilir),
  s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf hatasız (oyuncu mantığı ≤0,25 ms/kare).

## Sıradaki öncelikler
1. Animasyon (özellik 2): `ccr-70a30f22-kw7h5m` dalındaki gerçek hareket klipleri hattını (Quaternius CC0: yürüme/koşu, kılıç kombosu,
   takla, ölüm, zıplama; `tools/anim/import_clips.mjs`) bu çizgiye birleştir — 17 commit, `index.html` çakışmalarını yeniden derleyerek çöz.
2. Kahraman (özellik 1): zırh yeniden tasarımı — diğer dallarda ~15 deneme var; en iyisini seçip (ör. `3evbtl`, `feknia`) buraya al, yenisini yazma.
3. Kullanıcıya: bu dalların `main`'e birleştirilmesi (PR) gerekiyor; aksi halde site (index.html) eski kalıyor.
4. `test/s-ui.js` ağır saldırı testi bazen başarısız oluyor — kararsızlığı incele.
4. Yaratıklar (özellik 4): zindan yaratıkları (iskelet, örümcek) — `ay-kiliccisi/PROGRESS.md` DÜNYA DİREKTİFİ sırası.
