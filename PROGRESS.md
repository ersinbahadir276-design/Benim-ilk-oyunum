# İlerleme Günlüğü (PROGRESS)

Zamanlanmış geliştirme çalıştırmalarının kaydı. Her çalıştırma en yüksek öncelikli eksik özelliği ilerletir.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid AvatarSample_C (PR #1). |
| 2 | Gerçekçi 3B karakter animasyonları | ✅ Büyük ölçüde | Kahraman: retarget edilmiş Quaternius klipleri. Eksik: saç/giysi yay kemikleri, prosedürel hayvanlarda ayak IK. |
| 3 | Gönderilen GLB modellerin entegrasyonu | ✅ Gönderilenler için tamam | Ejderha (+ tilki örnek modeli). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ Tamamlandı | 14 tür (12'si kodla üretilmiş stilize model). |
| 5 | Evcilleştirme ve yapay zekâ | ✅ Tamamlandı | Türe özgü 8 yöntem, yoldaş takip/savaş/açlık. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Devam ediyor | Dünya/savaş/envanter vardı; **bu çalıştırmada XP/seviye + kayıt eklendi**. Eksik: ata binme, görevler, gece/gündüz, ses, yoldaş seviyeleri. |
| 7 | Android performansı ve mobil kontroller | 🟡 Kısmen | Dokunmatik joystick/düğmeler var. Eksik: düşük kalite modu (gölge/piksel oranı), FPS ölçümü, cihazda test. |

## Tamamlananlar

### Çalıştırma 1 — 2026-11-14
- PROGRESS.md oluşturuldu; mevcut durum (PR #1) değerlendirildi. Açık issue yok, çalışma ağacı temizdi.
- **İlerleme sistemi** (`src/progression.js`): XP eğrisi, 30 seviye; av/evcilleştirme/toplama XP'si; seviye başına can, dayanıklılık, kılıç hasarı ve yoldaş hasarı artışı; seviye atlama ekran efekti ve HUD'da XP çubuğu.
- **Kayıt sistemi**: localStorage'a otomatik (20 sn), duraklatınca ve sayfa kapanırken kayıt; seviye, XP, envanter, konum, yoldaşlar (ad/can/açlık/bekle) geri yüklenir. Kayıt verisi doğrulanır/kırpılır (bozuk ya da elle oynanmış veri oyunu bozmaz). Açılışta "Devam Et" / "Yeni Oyun".
- Oyuncuda `staminaMax`, `dmgMul`, `snapToGround()`; hayvanda `restorePet()`; oyunda `spawnAnimal()`.
- Testler 51 → 63 (12 yeni ilerleme/kayıt testi), hepsi geçiyor, konsol hatası yok.

## Sıradaki öncelikler
1. **Ata binme** (açık dünya): at yoldaşına E ile bin/in, binekli hareket ve kamera, kahraman binme pozu.
2. **Android performansı**: otomatik kalite seviyesi (gölge haritası, piksel oranı, görüş mesafesi), FPS sayacı, uzak hayvanlarda animasyon seyreltme.
3. Görevler (basit görev günlüğü), gece/gündüz döngüsü, ses efektleri.
4. Yoldaş seviyeleri/deneyimi.
