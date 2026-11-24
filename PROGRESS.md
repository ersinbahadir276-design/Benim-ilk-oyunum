# PROGRESS — zamanlanmış geliştirme görevi

Etkin oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı oturum günlüğü ve yol haritası: `ay-kiliccisi/PROGRESS.md`. Eski oyun (`yaban.html`, `src/`) artık geliştirilmiyor.
Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<s-*.js>`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var**: Kael, SDF heykel modeli (~21k üçgen, 58 kemik, PBR malzeme). Açık: kullanıcının istediği zırh yeniden tasarımı (tasarım yönü kullanıcıdan bekleniyor). Tamamlandı sayılmadı. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor**. Var: prosedürel pozlar, kol IK'sı, ragdoll, ayak IK'sı (bu oturum), topuk–parmak yürüyüşü. Eksik: anahtar kareli klip sistemi + harmanlama, duruşa özgü saldırı pozları, kombo bitirici animasyonları, ayak kayması kilidi (stride locking), düşmanlar için ayak IK'sı. |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen: ejderha, elf gövdesi (kraliçe), saç GLB'si, iskelet oranları (berserk_armor, kawaiope, aldrich). Bekleyen: gwyndolin (Yılan Rahibe), kurtları wolf_puppy iskeletine geçirme. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha, Veyra. Eksik: iskelet, örümcek, golem, hortlak, geyik/kuş. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme/evcilleştirme, görüş/duyma yapay zekâsı, Veyra yoldaş. Eksik: evcil yaratık güçlendirme ağacı, diğer türler. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter/demirci/yetenek). Eksik: bölge genişletme, zindanlar, lonca, hava durumu. |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PS düzeni, dikey/yatay, 30 m ötesi dış çizgi yok. Eksik: HUD düzenleyici, grafik kalite ayarları, gerçek cihaz testi. |

## Tamamlananlar
- (Henüz listedeki hiçbir özellik tam bitmiş sayılmıyor.)

## Oturum günlüğü
- **2026-11-24** — Özellik 2 (animasyon): kahraman için arazi ayak IK'sı. Eğimli zeminde iki ayak da yere basıyor
  (IK kapalı: ±6 cm havada/gömülü → açık: ±0,3 cm), gövde alçaktaki ayağa iniyor, yüksek bacak iki kemik IK ile bükülüyor,
  ayak tabanı eğime dönüyor; kaçınma/zıplama/ragdoll'da yumuşakça sönüyor. Yürüyüşe topuk basışı, parmak itişi, leğen
  dönmesi ve yana düşmesi eklendi. Yeni test `s-footik.js` 7/7; regresyon: mech 47/47, loop 71/71, stance 11/11, ui 7/7,
  save 1/1, assn 5/5, bow 4/4, perf hatasız.

## Sıradaki öncelikler
1. Animasyon: duruşa özgü saldırı pozları (Su: hızlı saplama, Ay: geniş yay, Rüzgâr: hamle) + kombo bitirici animasyonu.
2. Animasyon: yürüyüşte ayak kilidi (ayak yerdeyken kaymasın) ve dönüşte gövde eğilmesi; kurt/goblin için basit ayak IK'sı.
3. Animasyon: anahtar kareli klip sistemi (pozları zaman çizelgesiyle tanımla, crossfade).
4. Sonra özellik 3: kurtları wolf_puppy iskeletine geçirme.
