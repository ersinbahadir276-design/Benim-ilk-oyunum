# İlerleme / Progress

Bu dosya zamanlanmış geliştirme çalışmalarının kaydıdır. Her çalışma en yüksek öncelikli eksik özelliği ilerletir.

## Özellik durumu

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı (VRoid AvatarSample_C, PR #1). Eksik: saç/giysi yay kemiği fiziği. |
| 2 | Gerçekçi 3B karakter animasyonları | ✅ Tamamlandı (Quaternius UAL klipleri, retarget + crossfade, PR #1). Eksik: prosedürel hayvanlarda ayak IK. |
| 3 | Gönderilen GLB modellerin entegrasyonu | ✅ Gönderilen tek model (ejderha) entegre. Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ 14 tür (PR #1). 12'si kodla üretilmiş stilize model. |
| 5 | Evcilleştirme ve yapay zekâ | ✅ Türe özgü 9 yöntem, yoldaş takip/savaş/açlık (PR #1). |
| 6 | Açık dünya, savaş, envanter ve ilerleme | 🟡 Büyük kısmı tamam. Bu çalışmada ilerleme + kayıt eklendi. Eksik: görevler, ata binme, ekipman/kılıç yükseltme. |
| 7 | Android performansı ve mobil kontroller | 🟡 Dokunmatik joystick/butonlar var. Eksik: kalite ayarları, düşük güçlü cihaz ölçümü, dokunmatik kamera iyileştirmesi. |

## Tamamlananlar

- **PR #1:** dünya ve 6 bölge, erkek kahraman ve animasyonları, 14 tür, yapay zekâ, evcilleştirme, yoldaş sistemi, envanter/toplama, dokunmatik kontroller, 51 test.
- **2026-11-15 (zamanlanmış çalışma):** İlerleme ve kayıt sistemi (özellik 6).
  - `src/progression.js`: oyuncu XP/seviye (1–20; can, dayanıklılık, saldırı, can yenilenmesi ölçeklenir), XP kaynakları (av, evcilleştirme adımı, evcilleştirme — ilk tür ×2, toplama, yoldaş avı).
  - Yoldaş bağ seviyesi (1–10): besleme ve av ile artar; can ve hasarı ölçekler; serbest bırakınca sıfırlanır.
  - Kayıt/yükleme (`localStorage`): 30 sn'de bir, duraklatınca, `pagehide`/`visibilitychange` (Android arka plan) ile otomatik kayıt; seviye, konum, envanter, kaynak zamanlayıcıları, yoldaşlar (ad, bağ, açlık, can). Açılışta *Kayıttan Devam Et* / *Yeni Oyun*.
  - Arayüz: seviye rozeti + XP çubuğu, yoldaş panelinde bağ göstergesi; dayanıklılık çubuğu yeni maksimuma göre.
  - Testler: 12 yeni test (XP, seviye nitelikleri, hasar ölçekleme, bağ, kayıt/yükleme turu, bozuk kayıt reddi). **63/63 geçti**, konsol hatası yok. Tarayıcıda gerçek kayıt → yeniden yükleme → devam akışı da doğrulandı.

## Sıradaki öncelikler

1. **Android performansı (özellik 7):** otomatik kalite seviyesi (gölge haritası boyutu, piksel oranı, çizim uzaklığı, ağaç/çim yoğunluğu), FPS ölçümüne göre dinamik ayar, dokunmatik kamerada iki parmakla yakınlaştırma.
2. **Özellik 6 kalanlar:** basit görevler (ör. "3 tür evcilleştir"), ata binme, kılıç yükseltme/ekipman.
3. Yeni GLB gelirse prosedürel türleri değiştirme; ejderha uçuşu.
