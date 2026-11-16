# PROGRESS

Otomatik geliştirme rutini bu dosyayı her çalıştırmada günceller.

> **Not (2026-11-16):** Önceki rutin çalıştırmaları `ccr-70a30f22-*` dallarına itildi ve `main`'e birleştirilmedi (en uzun zincir: `ccr-70a30f22-gavx93`, Tur 2–13: ilerleme/kayıt, görev zinciri, kahraman/hayvan animasyon cilası; `ccr-70a30f22-723bsp`: ilerleme + kayıt). Bu arada kullanıcı `claude/tsushima-combat` dalını `main`'e birleştirdi. Bu çalıştırma güncel `main` üzerine kuruldu; o dallardaki iş bu dalda **yok**. Hangisinin `main`'e alınacağı kullanıcının kararı.

## Özellik durumu

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamam (VRoid AvatarSample_C, PR #1) |
| Gerçekçi 3B karakter animasyonları | 🟡 Kahraman retarget klipleri tamam; prosedürel hayvanlarda ayak IK yok, VRM saç/giysi fiziği yok (ilerleme `gavx93` dalında, birleştirilmedi) |
| Gönderilen GLB modellerin entegrasyonu | ✅ Gönderilen tek GLB (ejderha) entegre; yeni GLB gelirse `GLBCreature` ile bağlanır |
| Çok sayıda hayvan ve yaratık | ✅ 14 tür (PR #1) |
| Yaratık evcilleştirme ve yapay zekâ | ✅ Türe özgü yöntemler, yoldaş AI (PR #1) |
| Açık dünya, savaş, envanter ve ilerleme | 🟡 Dünya/envanter + Tsushima tarzı dövüş (PR #2) `main`'de; ilerleme/kayıt/görevler yalnızca birleştirilmemiş dallarda; ata binme, ejderha uçuşu, üretim yok |
| Android performansı ve mobil kontroller | 🟡 Dokunmatik düzen (PR #2) + **kalite/performans sistemi (bu çalıştırma)**; KTX2 doku sıkıştırma, gerçek cihaz ölçümü, hotbar–buton çakışması kaldı |

## Tamamlananlar

- **2026-11-16 14:26 UTC — Android performansı: kalite ön ayarları ve uyarlanabilir çözünürlük** (dal `ccr-70a30f22-fxpjiv`, güncel `main` üzerinde)
  - Yeni `src/quality.js`: Düşük/Orta/Yüksek ön ayarları (piksel oranı, gölge haritası boyutu ve kutusu, sis/kamera görüş mesafesi, antialias, hayvan uyku mesafesi, animasyon LOD).
  - `pickAutoPreset`: dokunmatik/Android cihazda Orta, zayıf telefonda (≤4 çekirdek ya da ≤3 GB) Düşük, masaüstünde Yüksek.
  - `FrameGovernor`: 1 sn pencerelerle FPS ölçümü; düşük FPS sürerse çözünürlüğü %10 adımlarla ön ayarın alt sınırına indirir, sonra (Otomatik'te) bir alt ön ayara geçer; bol FPS'te çözünürlüğü geri yükseltir. Arka plan sekmesi kareleri ölçülmez.
  - `src/animal.js`: sabit 130 m uyku mesafesi ön ayardan geliyor; uzaktaki dövüşmeyen hayvanların iskelet animasyonu N karede bir, biriken dt ile güncelleniyor (konum/AI her karede).
  - Başlangıç menüsünde kalite seçici + "FPS göster" (yoldaş panelinde FPS, ön ayar ve çözünürlük yüzdesi); seçim localStorage'da saklanır; `?q=` URL parametresi.
  - Testler 64 → 78 (ön ayar seçimi, FPS yöneticisi, kademeli düşürme, gölge/görüş uygulama, LOD ve uyku). Pixel 5 öykünmesinde menü ve HUD ekran görüntüsüyle doğrulandı, konsol hatası yok.

## Bilinen sorunlar

- `main`'deki iki dövüş testi ara sıra başarısız oluyor ("kırmızı saldırı bloktan geçer", "dayanıklılık bitince savunma kırılır"); bu değişiklikler olmadan `main` üzerinde de 62/64 görüldü. Ayı bazen 3 sn içinde hedefe vurmuyor; test zamanlaması ya da başka hayvanların araya girmesi incelenmeli.
- Telefonda hotbar, Saldır/Kaçın düğmeleriyle üst üste biniyor (PR #2 düzeni); odak paneli yoldaş paneliyle çakışabiliyor.

## Sıradaki öncelikler

1. **Dal kararı (kullanıcı):** `gavx93` zincirindeki ilerleme/kayıt/görev işi güncel `main`'e taşınmalı mı? Taşınırsa sonraki tur bunu yapmalı.
2. **Mobil:** hotbar ile dokunmatik düğme çakışmasını gidermek; flaky iki dövüş testini sağlamlaştırmak; KTX2 doku sıkıştırma; gerçek Android cihazda FPS ölçümü.
3. **Açık dünya:** ata binme, ejderha uçuşu, ekipman/üretim.
4. **Animasyon:** prosedürel hayvanlarda ayak IK, VRM saç/giysi yay kemikleri.
