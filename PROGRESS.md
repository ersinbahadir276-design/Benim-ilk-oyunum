# PROGRESS — otomatik geliştirme turları

Ana oyun: `ay-kiliccisi/` (kaynak `src/` + `data/`, derleme `python3 ay-kiliccisi/tools/build.py`, yayın kopyası kök `index.html`).
Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`. Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`.

## Özellik listesi (durum)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var, tamamlandı sayılmadı.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik, PBR) oyunda. Açık iş: kullanıcının istediği zırh yeniden tasarımı — tasarım yönü (referans/tarz) kullanıcıdan bekleniyor. Not: `tools/sculpt/cache/` depoda yok; `build.mjs` yalnızca önbellekteki modelleri `data/models.js`'e yazar, önce önbellek `data/models.js`'ten geri açılmalı, yoksa diğer modeller silinir. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor.** Tur 1: arazi ayak IK'sı yapıldı. Kalan: anahtar kareli klip sistemi + harmanlama, yürüyüşte ayak kilidi (kayma), hayvanlarda ayak IK'sı. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, elf gövdesi, saç; diğerlerinden yalnızca iskelet oranları). |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, timsah, ejderha, Veyra). |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ, görüş/uyarı sistemi). |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var; dünya genişletme, zindanlar, lonca açık. |
| 7 | Android performansı ve mobil kontroller | Dokunmatik düzen var; gerçek cihazda ölçülmedi. |

## Tamamlananlar

- Tur 1 (2026-11-17): **Kahraman için arazi ayak IK'sı** (`ay-kiliccisi/src/30-player-model.js` → `footIK`, `legIK`, `slopeN`; `60-game.js` döngüye bağlandı).
  Her ayak altındaki araziyi örnekler; leğen alçak ayağa iner, iki kemikli bacak çözümü diz düzlemini koruyarak ayağı zemine indirir,
  taban eğim normaline döner. Değerler yumuşatılır (zıplamaz); havada, taklada, yerdeyken, suda kapalı.
  Ölçüm (eğim 0.51): IK kapalı ayak boşluğu +7 / −7 cm → IK açık 0,1–0,4 cm. Yeni test `test/s-footik.js` 5/5;
  `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-perf` hatasız (mantık ≤0,31 ms/kare).

## Sıradaki öncelikler

1. Animasyon: yürüme/koşuda ayak kilidi (basan ayak dünyada sabit kalsın, kayma olmasın) — `footIK` üstüne kurulabilir.
2. Animasyon: kahraman için anahtar kareli klip + çapraz geçiş sistemi (bekleme nefesi, dönüşte ağırlık aktarımı, iniş sönümü).
3. Kurt/goblin/timsah için aynı arazi IK'sı (dört ayaklılarda gövde eğimi).
4. Kahraman zırh yeniden tasarımı: kullanıcıdan tasarım yönü gelince (önce `models.js` → `cache/` geri açma betiği yazılmalı).
