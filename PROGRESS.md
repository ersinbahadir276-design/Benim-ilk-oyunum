# PROGRESS — otomatik geliştirme rutini

Bu dosyayı zamanlanmış rutin okur ve günceller. Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski evcilleştirme oyunu: `yaban.html` + `src/`.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor**: SDF heykel modeli var; zırh yeniden tasarımı başladı (oturum R1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı: tüm pozlar kodla; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: elf gövdesi (kraliçe), saç GLB'si, ejderha oyunda; diğerlerinden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme, Veyra yoldaş YZ; `yaban.html`'deki 14 türlük sistem Ay Kılıççısı'na taşınmadı |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, 4 duruş, ganimet, demirci, yetenekler); harita genişletme/zindan yok |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PS düzeni, 30 m ötesi dış çizgi yok; gerçek cihazda test edilmedi, LOD yok |

## Tamamlananlar
- (henüz listedeki hiçbir özellik tamamen bitmedi)

## Oturum günlüğü
### R1 — 2026-11-25 · Özellik 1 (kahraman)
- `tools/sculpt/models/hero.mjs`: göğüs zırhına heykel göğüs kasları (pektoral loblar), ortaya bronz göğüs madalyonu (halka + ok ucu kabartma).
- Kemerden sarkan kızıl **tabard** (yırtık etek ucu, bronz üst şerit); yürürken bacaklarla birlikte sallanır (kalça/uyluk ağırlıkları).
- Miğfer: düz turuncu "T" ışıması kaldırıldı; yarığın arkasında koyu boşluk (`face`, `void` malzeme) ve içte iki kor göz.
- `data/models.js` yalnızca `hero` girdisi yeniden üretildi (önbellek mevcut models.js'den çıkarıldı, diğer modeller birebir aynı).
- Testler: s-mech 47/47, s-loop 71/71, s-hero ekran görüntüleri hatasız.

## Sıradaki öncelikler
1. Kahraman (devam): miğferi daha dar/sivri çene siperliği ile yeniden biçimlendir; uyluk tassetlerinin kutu görünümünü kır (daha kısa, eğimli); kol/el zırhında ayrıntı; isteğe bağlı miğfersiz yüz varyantı (köy sahneleri).
2. Kahraman bitince: anahtar kareli animasyon klibi sistemi (koşu, saldırı, kaçınma) — özellik 2.
3. Not: `tools/sculpt/cache/` git'te yok; R1'de `build.mjs` önbelleği eksikse `data/models.js`'den kendisi dolduracak şekilde düzeltildi (tek model yeniden üretmek artık diğerlerini silmez).
