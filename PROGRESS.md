# PROGRESS — otomatik geliştirme oturumları

Bu dosya zamanlanmış geliştirme görevinin kaydıdır. Etkin oyun **Ay Kılıççısı** (`ay-kiliccisi/`, site açılışı `index.html`).
Ayrıntılı tasarım/oturum günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları): `yaban.html` + `src/`.

Derleme: `python3 ay-kiliccisi/tools/build.py` → `ay-kiliccisi/dist/ay-kiliccisi.html` (sonra kök `index.html`'e kopyala).
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum | Not |
| - | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | Büyük ölçüde var, **açık** | Kael "Kara Zırh" SDF heykel modeli (~21k üçgen, 58 kemik). Kullanıcı zırhın yeniden tasarımını istedi, yapılmadı. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** | Oturum A: kahraman için arazi ayak IK'sı. Kalan: duruşa özgü pozlar, NPC/düşman ayak IK'sı, vuruş tepkileri. |
| 3 | Gönderilen GLB modellerinin entegrasyonu | **Kısmen** | Ejderha, kraliçe (elf GLB), saç GLB'si bağlı. Kalan: wolf_puppy iskeleti, Kawaiope tarzı kız. |
| 4 | Çok sayıda hayvan ve yaratık | **Kısmen** | Kurt, timsah, ejderha, goblin türleri. Kalan: iskelet, örümcek, golem, hortlak, Ak Kurt. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen** | Görüş/duyma yapay zekâsı, Veyra yoldaşı, kurt besleme. Ay Kılıççısı'nda tam evcil hayvan sistemi yok (eski oyunda vardı). |
| 6 | Açık dünya, savaş, envanter, ilerleme | **Büyük ölçüde var** | 2,8 km harita, Tsushima tarzı savaş, 7 sekmeli sistem, ganimet, seviye. Kalan: harita genişletme, zindanlar, lonca. |
| 7 | Android performansı ve mobil kontroller | **Kısmen** | Dokunmatik PS düzeni, LOD/dış çizgi kesme. Gerçek cihazda test edilemedi. |

## Tamamlanan (otomatik oturumlar)

### Oturum A — 2026-11-23: kahramanın arazi ayak IK'sı (özellik 2)
- `ay-kiliccisi/src/32-footik.js` (yeni): poz uygulandıktan sonra her ayak bileği gerçek araziyle ölçülür;
  pelvis alçak ayağa iner, diğer bacak iki kemikli IK ile bükülür (diz, animasyonun büküm yönünü korur),
  basan ayak tabanı eğime yatırılır (en çok ~29°). Salınımdaki ayak araziyi kısmen izler; değerler
  yumuşatılır (zıplama yok). Havada, yerdeyken, takla/kaçınma, suda, kurt yakalamışken IK sönümlenir.
- `55-player.js` `playerMatrix`: `M[13]+=footIK(M,dt)`; `60-game.js`: `__G.FIK/footIK` test erişimi.
- Test `test/s-footik.js` 7/7: 0,69 eğimde ayak–zemin hatası IK kapalıyken 5,8 cm → açıkken 0,1 cm;
  pelvis düşüşü, yürüyüşte NaN yok, havada sönme / inişte geri gelme.
- Gerileme: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5; s-perf mantık süresi 0,14–0,24 ms/kare.

## Sıradaki öncelikler
1. Animasyon (2): aynı ayak IK'sını goblin/köylü/Veyra insan iskeletlerine yaymak (`limbIK` genel); duruşa özgü saldırı pozları (hamle/saplama); yönlü vuruş tepkileri.
2. Kahraman (1): zırh yeniden tasarımı (kullanıcı isteği) — `tools/sculpt/models/hero.mjs`; görsel onay gerektiği için kullanıcıya sorulmalı.
3. GLB (3): kurtları wolf_puppy iskeletine geçirmek.
4. Yaratıklar (4): zindan yaratıkları (iskelet, örümcek).
