# PROGRESS

Otomatik geliştirme rutini bu dosyayı her çalıştırmada günceller.

## Özellik durumu

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamam (VRoid AvatarSample_C, PR #1) |
| Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde — kahraman retarget klipleri tamam; prosedürel hayvanlarda ayak IK yok, VRM saç/giysi fiziği yok |
| Gönderilen GLB modellerin entegrasyonu | ✅ Gönderilen tek GLB (ejderha) entegre; yeni GLB gelirse `GLBCreature` ile bağlanacak |
| Çok sayıda hayvan ve yaratık | ✅ 14 tür (PR #1) |
| Yaratık evcilleştirme ve yapay zekâ | ✅ Türe özgü 8 yöntem, yoldaş AI (PR #1) |
| Açık dünya, savaş, envanter ve ilerleme | 🟡 Dünya/savaş/envanter/**ilerleme + kayıt** tamam; ata binme, ejderha uçuşu, görevler yok |
| Android performansı ve mobil kontroller | 🟡 Dokunmatik joystick/butonlar var; kalite ayarı, FPS ölçümü, mobil kamera sürükleme iyileştirmesi yok |

## Tamamlananlar

- **Çalıştırma 1 (2026-11-16):** İlerleme ve kayıt sistemi
  - `src/progress.js`: oyuncu XP/seviye (maks 30; +10 can, +%6 hasar, +%3 dayanıklılık yenilenmesi/seviye), yoldaş XP/seviye (maks 20; +%8 can, +%7 hasar), XP kaynakları (av, evcilleştirme + ilk tür bonusu, toplama), tür kataloğu.
  - `src/save.js`: localStorage kayıt/yükleme (seviye, konum, can, envanter, yoldaşlar ad/seviye/açlık/can ile), veri doğrulama, bozuk kaydı reddetme.
  - Otomatik kayıt (20 sn, duraklatma, sekme gizlenince), “Devam Et — Seviye N” / “Yeni Oyun” butonları, `?fresh` parametresi.
  - HUD: seviye rozeti + XP çubuğu, seviye atlama animasyonu, yoldaş panelinde “Sv N”, “Kaydedildi” göstergesi.
  - Testler 51 → 66 (XP, seviye, hasar ölçekleme, yoldaş seviyesi, kayıt gidiş-dönüş); hepsi geçiyor. Gerçek localStorage yeniden yükleme akışı tarayıcıda doğrulandı.

## Sıradaki öncelikler

1. **Android performansı:** kalite ön ayarları (gölge çözünürlüğü, pixel ratio, sis/çizim mesafesi), otomatik FPS tabanlı düşürme, dokunmatikte ekranı sürükleyerek kamera, ayarlar menüsü.
2. **Açık dünya:** ata binme (at yoldaşı), ejderha uçuşu, basit görev sistemi.
3. **Animasyon:** prosedürel hayvanlarda ayak–zemin IK, kahraman saç/giysi yay kemikleri.

## Notlar

- Testler: `python3 -m http.server 8765` ve `node test/run-tests.mjs`. Hayvan AI rastgele olduğu için nadiren 1–2 test titreyebilir (ilk ölçümde 49/51, sonraki iki koşuda 51/51 idi).
