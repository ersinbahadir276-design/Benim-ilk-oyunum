# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin kaydıdır. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, site kökündeki
`index.html` onun `dist` kopyası). Ayrıntılı tasarım/oturum günlüğü: `ay-kiliccisi/PROGRESS.md`, `ay-kiliccisi/ANALIZ.md`.
Eski three.js oyunu (Yaban Yoldaşları) `yaban.html` + kök `src/` içinde duruyor.

Derleme: `cd ay-kiliccisi && python3 tools/build.py` → sonra `cp ay-kiliccisi/dist/ay-kiliccisi.html index.html`.
Test: `cd ay-kiliccisi && node test/harness.js test/<senaryo>.js` (Playwright, yazılımsal WebGL).

## Özellik listesi ve durum

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | Devam ediyor — heykel modeli var (Kael, Kara Zırh); zemine uyan bacaklar + bakış eklendi (çalıştırma 1). Zırh yeniden tasarımı (kullanıcı istemişti) bekliyor |
| Gerçekçi 3B karakter animasyonları | Devam ediyor — hepsi prosedürel; ayak IK eklendi. Anahtar kareli klip sistemi yok |
| Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si bağlı; kawaiope/gwyndolin/aldrich yalnızca iskelet oranı |
| Birden çok hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; zindan yaratıkları yok |
| Yaratık evcilleştirme ve yapay zekâ | Kısmen — kurt evcilleştirme + yoldaş; görüş/uyarı yapay zekâsı var |
| Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi; zindan/lonca yok |
| Android performansı ve mobil kontroller | Kısmen — dokunmatik PS düzeni, uyarlanır kalite; gerçek cihazda test edilmedi |

## Tamamlananlar

_(Henüz listedeki hiçbir özellik tamamen bitmedi.)_

## Çalıştırma günlüğü

### Çalıştırma 1 — 2026-11-26 · Özellik: yüksek kaliteli erkek kahraman (canlılık / zemin teması)
- **Yeni `ay-kiliccisi/src/32-footik.js`:** kahraman için zemine uyan bacaklar.
  - Her ayağın altındaki arazi yüksekliği ölçülür; leğen alçak ayak kadar iner, diğer bacak iki kemikli IK ile bükülür
    (uyluk/baldır burulmasını koruyan IK: önce diz açısı, sonra kalçadan savurma).
  - Taban arazinin eğimine göre yatırılır (yerel normal, %85 ağırlık).
  - Yumuşak geçiş: havada, takla, yere düşme, kalkma, suikast/boğma, ragdoll ve suda IK kendiliğinden söner.
  - Baş/boyun bakışı: kilitli hedefe, yoksa öndeki 10 m içindeki en yakın düşmana döner (yaw ±1,1, eğim ±0,5 rad).
- `60-game.js`: `applyPose` → `footIK(dt)` → `playerMatrix`; `__G.FIK` test için açıldı.
- **Yeni test `test/s-footik.js` (5/5):** 0,69 eğimli zeminde IK kapalıyken ayak hatası ±9,6 cm, açıkken ≤0,5 cm;
  düz zeminde poz değişmiyor; baş yandaki kilitli gobline 0,93 rad dönüyor.
- Gerileme testleri: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5, s-save 1/1. Performans (s-perf): oyun
  mantığı kare başına ~+0,05 ms.
- **Önceden var olan hata (bu çalıştırmada değil):** `s-ui.js` "SALDIR basılı tut = yükleme" 6/7 — 2,5 sn basılı tutunca
  durum zaten `heavy` (yükleme kendiliğinden bırakılıyor ya da test eski). Değişiklikten önceki sürümde de aynı sonuç.

## Sıradaki öncelikler
1. Kahraman: zırhı yeniden tasarla (kullanıcı isteği; `tools/sculpt/models/hero.mjs`). Dikkat: `tools/sculpt/cache/`
   depoda yok → `build.mjs hero` tek başına çalışırsa `data/models.js` yalnızca kahramanla yazılır. Önce build.mjs'i
   mevcut `data/models.js` girdilerini koruyacak şekilde değiştir.
2. Animasyon: koşu/yürüyüşte ayak kayması (adım fazını hıza kilitleme), pelerin için yay fiziği, duruşlara özgü pozlar
   ve kombo bitiricileri (ANALIZ.md aşama 1 kalanları).
3. `s-ui.js` ağır saldırı testini incele (test mi eski, davranış mı bozuk).
4. Yaratıklar: zindan yaratıkları (iskelet, örümcek, golem) ve kurtların wolf_puppy iskeletine geçişi.
