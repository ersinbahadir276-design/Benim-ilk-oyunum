# PROGRESS

Otomatik geliştirme çalışmalarının kaydı. Her çalışma bu dosyayı okuyup bir sonraki eksik özelliği ilerletir.

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid AvatarSample_C, kendi iskeleti (PR #1) |
| Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde | Kahraman: Quaternius kliplerinin retarget'ı + crossfade. Eksik: saç/giysi fiziği (VRM spring bones), hayvanlarda ayak IK |
| Gönderilen GLB modellerin entegrasyonu | 🟡 Gönderilenler bağlı | Ejderha + tilki GLB bağlı. Diğer 12 tür için GLB gönderilmedi; gelirse `GLBCreature` ile bağlanacak |
| Çok sayıda hayvan ve yaratık | ✅ Tamamlandı | 14 tür, 7 bölge |
| Yaratık evcilleştirme ve yapay zekâ | ✅ Tamamlandı | Türe özgü yöntemler, yoldaş takip/savaş/açlık |
| Açık dünya, savaş, envanter, ilerleme | 🟡 Büyük ölçüde | Dünya, kombo savaş, envanter, **seviye/DP, yoldaş bağ seviyesi, kayıt (bu çalışma)**. Eksik: görevler, ekipman/silah yükseltme, ata binme |
| Android performansı ve mobil kontroller | 🟡 Kısmen | Dokunmatik joystick + butonlar var. Eksik: kalite kademeleri (gölge/çözünürlük), FPS ölçümü, kamera için dokunmatik sürükleme testi |

## Tamamlananlar

- **(önceki, PR #1)** Dünya ve bölgeler, erkek kahraman ve animasyonları, 14 tür, evcilleştirme, yoldaş sistemi, envanter/toplama, dokunmatik kontroller, 51 oynanış testi.
- **2026-11-14** İlerleme ve kayıt sistemi:
  - `src/progression.js`: oyuncu deneyim/seviye (1–30; can, saldırı gücü, dayanıklılık yenilenmesi artar), avlanma/evcilleştirme/toplama DP'si.
  - Yoldaş bağ seviyesi (1–10): besleme ve savaşla deneyim; can ve saldırı gücü çarpanı. Serbest bırakınca sıfırlanır.
  - localStorage kaydı: 20 sn'de bir, seviye atlama/evcilleştirmede ve sekme gizlenince otomatik. Açılışta "Devam Et (Seviye N)" / "Yeni Oyun".
  - HUD: seviye rozeti + DP çubuğu, yoldaş panelinde "Sv N". Mobil düzende odak paneli çakışması düzeltildi.
  - 11 yeni test (toplam 62/62 geçiyor) + gerçek localStorage ile kaydet→yeniden yükle→devam et uçtan uca doğrulandı.

## Sonraki öncelikler

1. **Android performansı:** otomatik kalite kademesi (FPS'e göre pixelRatio/gölge haritası/sis mesafesi düşürme), `?quality=low` parametresi, dokunmatik kamera sürüklemesinin joystick ile çakışmadığını test etmek.
2. **Görevler:** basit görev günlüğü (ör. "3 tavşan evcilleştir", "kurt sürüsünü yen") — ilerleme sistemine DP ödülü bağlanacak.
3. **Ekipman:** ganimetten kılıç/zırh yükseltmesi (oyuncu `dmgMul`/`hpMax` üzerine).
4. **Animasyon kalitesi:** VRM yay kemikleri (saç/ceket), prosedürel hayvanlarda ayak IK.
5. Ata binme, ejderha uçuşu, gece/gündüz, ses.
