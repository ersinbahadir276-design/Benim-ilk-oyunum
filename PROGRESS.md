# İlerleme (PROGRESS)

Bu dosya zamanlanmış geliştirme çalıştırmalarının kaydıdır. Her çalıştırma buradan devam eder.

## Tamamlananlar

- [x] **Temel oyun (PR #1):** 3B dünya ve bölgeler, 14 tür, tür başına evcilleştirme yöntemi, yoldaş sistemi (takip/savaş/açlık/can), envanter ve toplama, dokunmatik kontroller, oynanış testleri.
- [x] **Erkek kahraman — saç/ceket fiziği ve yüz ifadeleri (2026-11-14):** VRM 0.x `secondaryAnimation` verisinden yay kemiği simülasyonu (21 eklem, kafa/gövde/kol çarpıştırıcıları, merkez uzayında kuyruk, sabit 60 Hz alt adım) ve `blendShapeMaster`'dan otomatik göz kırpma + duruma bağlı ifadeler.

## Özellik durumu

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | **Büyük ölçüde tamam.** VRoid modeli, toon malzeme, saç/ceket fiziği, ifadeler var. Eksik: konuşma/ağız animasyonu yok, karakter özelleştirme yok. |
| Gerçekçi 3B animasyonlar | Kısmen. Kahraman retarget klipleri + crossfade var. Eksik: kahraman ve prosedürel hayvanlar için ayak IK'sı (eğimde ayak kayması), ekleme (additive) vuruş tepkisi. |
| Gönderilen GLB'lerin entegrasyonu | Gönderilenlerin hepsi bağlı (yalnızca ejderha gönderildi). Yeni GLB gelirse `GLBCreature` ile bağlanacak. Ejderha uçuşu yok. |
| Çok sayıda hayvan/yaratık | Tamam (14 tür; 12'si kodla üretilmiş düşük poligonlu). |
| Evcilleştirme ve yapay zekâ | Tamam (türe özgü yöntemler, yoldaş AI). |
| Açık dünya, savaş, envanter, ilerleme | Kısmen. İlerleme sistemi (XP/seviye), kayıt, görevler, ata binme yok. |
| Android performans ve mobil kontroller | Kısmen. Dokunmatik kontroller var; performans ayarı yok (saç ağı 118 parça, gölgeler, 13 MB kahraman). |

## Bu çalıştırmada yapılanlar (2026-11-14)

- `src/vrm-extras.js` eklendi: `SpringBones` (UniVRM mantığı: atalet, sertlik, sürükleme, yerçekimi, küre çarpıştırıcılar) ve `Expressions` (göz kırpma, öfke/acı/sevinç).
- `src/hero.js` bunları yükler; `src/player.js` her karede günceller; yeniden doğuşta yaylar sıfırlanır; hasar alınca kısa acı ifadesi; evcilleştirince sevinç (`src/animal.js`).
- 7 yeni test (toplam 58/58 geçti, konsol hatası yok).

## Sıradaki öncelikler

1. **Animasyon:** kahraman için iki kemikli ayak IK'sı (eğimli zeminde ayak yerleşimi) ve vuruş tepkisi (hit-react) klibi.
2. **İlerleme:** XP/seviye, `localStorage` kayıt sistemi.
3. **Android:** düşük kalite modu (gölge kapalı, piksel oranı sınırı, saç ağı birleştirme), FPS ölçer.
4. Ejderha için uçuş ve ata binme.
