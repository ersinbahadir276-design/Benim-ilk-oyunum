# PROGRESS — otomatik geliştirme turları

Bu dosyayı zamanlanmış geliştirme görevi tutar. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` onun derlenmiş kopyası).
Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski deneme oyunu: `yaban.html` + `src/` (three.js).

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js` (s-mech, s-loop, s-stance, s-ui, s-anim, s-perf)

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var** — Kael (SDF heykel, 21k üçgen, PBR malzeme). Açık: kullanıcının istediği zırh yeniden tasarımı (tasarım yönü belirtilmemiş, onay bekliyor) |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — tur 1: hareket klipleri (aşağıda). Açık: saldırı/kaçınma/zıplama/ölüm klipleri, ayak IK'sı |
| 3 | Gönderilen GLB modellerin entegrasyonu | **Kısmen** — elf gövdesi, saç, ejderha, Quaternius klipleri oyunda. `hero.glb` (VRoid) ve `fox.glb` yalnızca eski yaban.html'de |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin, okçu, büyük goblin, timsah, ejderha (yaban.html'de 14 tür, Ay Kılıççısı'nda henüz yok) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — kurt besleme, görüş/uyarı yapay zekâsı, Veyra yoldaşı |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ekipman/demirci) |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PlayStation düzeni, 30 m ötesi dış çizgi kapalı. Gerçek cihazda test edilemedi |

## Tamamlananlar

### Tur 1 — 2026-11-25: gerçek hareket klipleri (özellik 2 + 3)
- `tools/anim/import_clips.mjs`: three.js olmadan GLB okuyucu; `assets/models/hero_anims1.glb` (Quaternius Universal Animation Library, CC0)
  içinden 6 döngüyü (Idle, Walk, Jog, Sprint, Crouch Idle, Crouch Walk) 30 fps örnekler, T-pozdan dünya-uzayı fark dönüşü
  olarak Kael'in 58 kemikli iskeletine aktarır (22 kemik eşlenir; kılıç tutan sağ kol hariç 18'i oyunda sürülür).
  Her döngü sol ayak öndeyken başlayacak şekilde hizalanır; zemindeki ayaktan doğal hızı ölçülür. Çıktı `data/anims.js` (73 KB, int16).
- `src/32-anim.js`: klip katmanı. Hıza göre bekle→yürü→koş→depar (ve çömel-bekle→çömel-yürü) harmanlama, ortak adım fazı
  (bacaklar harmanlamada çaprazlanmaz), her klip kendi temposunda oynar. Kılıç kolu (sağ kol) prosedürel kalır, IK bozulmaz.
  Kaynak iskelet farkı için en alttaki ayak her karede zemine oturtulur. Saldırı/kaçınma vb. durumlarda katman yumuşakça kapanır.
- `test/s-anim.js` (11 test): klipler yüklü, durum→klip eşleşmesi, adım uzunluğu, faz ilerlemesi, ayak zeminde, çömelme kalça
  yüksekliği, saldırıda katmanın kapanması, NaN yok — 11/11.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (s-ui'deki iki zamanlama testi değişiklik öncesi sürümde de
  ara sıra düşüyor: gerçek saat ile ölçüyorlar, yazılımsal WebGL'de kararsız). Performans değişmedi (s-perf, kare başı <0,3 ms mantık).
- Oyun içi lisans listesine Quaternius (CC0) eklendi.

## Sıradaki öncelikler
1. **Animasyon (devam):** `hero_anims2.glb` kılıç kliplerini (Sword_Regular_A/B/C) ve `Roll`, `Jump_*`, `Hit_Chest`, `Death01`
   kliplerini aynı hatla aktar; saldırılarda alt gövdeyi klipten, sağ kolu prosedürel/IK'dan sür. Yokuşta ayak IK'sı (iki kemik bacak IK).
2. Koşuda uçuş fazı: şu an en alttaki ayak hep zemine sabitleniyor (sıçrama kaybolur) — yalnızca temas karelerinde sabitle.
3. Kahraman: zırh yeniden tasarımı için kullanıcıdan yön/referans gerekiyor; o gelene kadar yüz/miğfer çıkarma seçeneği düşünülebilir.
4. Yaratıklar: yaban.html'deki 14 türü (tavşan, geyik, at, tilki, ayı, aslan, kaplan, yılan, kartal…) Ay Kılıççısı'na taşı;
   `fox.glb` (iskeletli, animasyonlu) ilk aday.
5. Android: dokunmatik düzen ve kalite ayarı (gölge/çizgi/çizim mesafesi) gerçek cihaz geri bildirimiyle.
