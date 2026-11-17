# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin takip listesidir. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`,
kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası). Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`.
Eski oyun «Yaban Yoldaşları» `yaban.html` olarak duruyor (evcilleştirme sistemi orada).

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Test: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | Büyük ölçüde var: Kael, SDF heykel modeli (58 kemik, ~21k üçgen, PBR kanalları). Açık: kullanıcının istediği zırh yeniden tasarımı. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor.** Prosedürel pozlar + kol IK vardı. Bu çalıştırma: bacak IK ile ayak yerleştirme. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha (kendi klipleri), Şeytan Kraliçe (elf GLB + saç GLB), iskelet oranları alınanlar. Açık: kawaiope / wolf_puppy iskeletleri. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (+okçu, şef), timsah, ejderha. Açık: iskelet, örümcek, golem, hortlak, Ak Kurt. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Yapay zekâ var (görüş konisi, uyarı, Veyra fayda puanlaması). Evcilleştirme yalnızca eski oyunda (yaban.html) ve kurt besleme; Ay Kılıççısı'nda yoldaş yaratık sistemi yok. |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı savaş, 4 yuva envanter, seviye/yetenek, demirci). Açık: harita genişletme, zindanlar, lonca. |
| 7 | Android performansı ve mobil kontroller | Dokunmatik düzen + PlayStation tarzı düğmeler + 30 m dış çizgi kesimi var. Açık: gerçek cihazda ölçüm, LOD. |

Hiçbiri "tamamlandı" olarak işaretlenmedi: her birinde açık iş var.

## Tamamlananlar
- [x] (2026-11-17) Animasyon: kahraman için ayak yerleştirme (foot IK) — eğimli zeminde ayaklar havada kalmıyor/gömülmüyor

## Çalıştırma günlüğü

### 2026-11-17 — Özellik 2: gerçekçi animasyon, ayak yerleştirme
- `ay-kiliccisi/src/30-player-model.js`: `legIK()` (iki kemikli bacak IK, uyluğun animasyondaki bükümünü korur) ve
  `footIK(dt)`. Her ayağın altındaki zemin yüksekliği ölçülür; ayak animasyondaki kalkışını koruyarak o zemine taşınır,
  leğen alçaktaki ayağa uzanacak kadar iner, yokuştaki diz daha çok bükülür, yere basan taban eğime göre eğilir
  (ayak havadayken eğim uygulanmaz). Ofsetler yumuşatılır (adımda sıçrama yok); zıplama, kaçınma, yere düşme,
  sinematik durumlarda kapalıdır. `P.fikOff=true` ile kapatılabilir.
- `ay-kiliccisi/src/60-game.js`: döngüde `applyPose → footIK → playerMatrix`.
- Yeni test `test/s-footik.js` 10/10: 0,36 eğimde IK kapalıyken ayaklar arası fark 0,10 m (biri havada), açıkken 0,002 m;
  leğen 5 cm iniyor; yokuş yukarı bakarken ayak uçları kalkıyor; eğimde 4 sn yürüyüşte NaN yok; düz zeminde etkisiz.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5.
- Ölçülmedi: gerçek telefonda performans (kare başına ~4 ek iskelet güncellemesi, 58 kemik — küçük olmalı).

## Sıradaki öncelikler
1. Animasyon (özellik 2) devam: aynı ayak IK'sını insansı NPC/goblinlere ve dört ayaklı kurtlara uygula;
   yürüyüş döngüsünde ayak kaymasını azalt (adım fazını hıza bağla, duruşta ayak kilidi); dönüşte gövde eğimi.
2. Özellik 1: kahraman zırhı yeniden tasarımı (kullanıcı isteği, `tools/sculpt/models/hero.mjs`).
3. Özellik 4: yeni yaratıklar (iskelet, örümcek, golem) — zindan planıyla birlikte.
4. Özellik 5: Ay Kılıççısı'na evcil yaratık/yoldaş sistemi (kurt evcilleştirme).
