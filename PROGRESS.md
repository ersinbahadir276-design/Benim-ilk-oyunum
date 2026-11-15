# PROGRESS

Otomatik geliştirme rutininin ilerleme kaydı. Her çalışmada güncellenir.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı (cila eksik) | VRoid anime avatar. Eksik: VRM saç/giysi yay kemiği fiziği. |
| 2 | Gerçekçi 3B karakter animasyonları | ✅ Tamamlandı (cila eksik) | Kahraman: retarget edilmiş Quaternius klipleri + crossfade. Prosedürel hayvanlarda ayak IK yok. |
| 3 | Gönderilen GLB modellerin entegrasyonu | ✅ Tamamlandı | Gönderilen tek GLB (ejderha) bağlı; tilki Khronos örneği. Yeni GLB gelirse `GLBCreature` ile bağlanır. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ Tamamlandı | 14 tür, 6 bölge. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | ✅ Tamamlandı | Türe özgü 8 yöntem; yoldaş takip/savaş/açlık. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmen | Dünya, savaş, envanter ✅; ilerleme (XP/seviye/bağ/kayıt) ✅ bu çalışmada. Eksik: görevler, ekipman/üretim, ata binme. |
| 7 | Android performans ve mobil kontroller | 🟡 Kısmen | Dokunmatik joystick+butonlar var. Eksik: kalite ayarları (gölge/çözünürlük), dokunmatik kamera iyileştirmesi, cihazda ölçüm. |

## Tamamlananlar

- (İlk sürüm, PR #1) Dünya ve bölgeler, kahraman + animasyonlar, 14 tür, AI, evcilleştirme, yoldaşlar, envanter/toplama, dokunmatik kontroller, 51 test.
- **2026-11-15:** İlerleme sistemi (`src/progress.js`):
  - Oyuncu XP/seviye (1–30): av, evcilleştirme, toplama XP verir; seviye can/saldırı/dayanıklılık yenilenmesini artırır. HUD'da seviye rozeti ve XP çubuğu.
  - Yoldaş bağ seviyesi (B1–B10): savaş, av ve besleme ile artar; can ve güç çarpanı. Panelde gösterilir; serbest bırakınca sıfırlanır.
  - Kayıt/yükleme: localStorage'a 30 sn'de bir ve sekme kapanırken otomatik kayıt; açılışta *Devam Et* / *Yeni Oyun*. Bozuk kayıt reddedilir. `?test` ve `?nosave` kaydı kapatır.
  - 10 yeni test (toplam 61/61 geçiyor), gerçek tarayıcıda kaydet → yenile → devam akışı doğrulandı.

## Sıradaki öncelikler

1. **Özellik 6 devamı:** basit görev/başarı sistemi (ör. "3 tür evcilleştir", "ejderhayı yen") XP ödülleriyle; ekipman (kılıç seviyeleri) veya üretim.
2. **Özellik 7:** kalite ön ayarları (düşük/orta/yüksek: gölge haritası, pixel ratio, sis mesafesi), FPS'e göre otomatik düşürme, dokunmatik kamera sürükleme alanı.
3. Cila: VRM yay kemiği (saç/giysi) fiziği, prosedürel hayvanlara basit ayak IK, ata binme.
