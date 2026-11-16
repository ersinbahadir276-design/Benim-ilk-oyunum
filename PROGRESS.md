# İlerleme (PROGRESS)

Otomatik geliştirme rutininin çalışma kaydı. Bir özellik yalnızca gerçekten bittiğinde "Tamamlandı" olarak işaretlenir.

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | Büyük ölçüde hazır | VRoid modeli, toon malzeme, kılıç; **saç/ceket fiziği eklendi (2026-11-16)**. Eksik: yüz ifadeleri/göz kırpma (VRM blendShape), göz takibi. |
| Gerçekçi 3B karakter animasyonları | Kısmen | 20+ retarget klip ve crossfade var. Eksik: ayak IK'si (eğimde ayak kayması), prosedürel hayvanlarda ayak kilidi, vuruş tepkisi (`Hit_Chest` klibi var, kullanılmıyor). |
| Gönderilen GLB modellerin entegrasyonu | Kısmen | Ejderha + tilki bağlı. Diğer 12 tür için GLB gönderilmedi; gelince `GLBCreature` ile bağlanacak. |
| Çok sayıda hayvan ve yaratık | Tamamlandı (ilk sürüm) | 14 tür; 12'si kodla üretilmiş düşük poligon. |
| Yaratık evcilleştirme ve yapay zekâ | Tamamlandı (ilk sürüm) | Türe özgü yöntemler, 5 yoldaş, takip/savaş/açlık. |
| Açık dünya, savaş, envanter, ilerleme | Kısmen | Dünya/savaş/envanter var. Eksik: kayıt sistemi, seviye/deneyim ilerlemesi, görevler, gece/gündüz. |
| Android performansı ve mobil kontroller | Kısmen | Dokunmatik joystick/düğmeler var. Eksik: düşük kalite ayarı (gölge/çözünürlük), FPS ölçümü. |

## Çalışma kaydı

### 2026-11-16
- `PROGRESS.md` oluşturuldu (önceden yoktu). Açık değişiklik yoktu; testler başlangıçta 51/51 geçiyordu.
- **Kahraman: VRM yay kemiği fiziği** (`src/springbone.js`, yeni). `hero.glb` içindeki VRM 0.x `secondaryAnimation` verisi okunuyor: 20 saç eklemi + 14 ceket eteği eklemi, 22 küre çarpıştırıcı (kafa/boyun/gövde).
  - UniVRM tarzı Verlet benzetimi, 60 Hz sabit adım, karakter köküne göre ("center") hesap — koşu ve 180° dönüşler saçı savurmuyor.
  - Hıza bağlı hava akımı terimi: koşarken saç ve etek geriye açılır.
  - Oyun ayarı: VRoid değerleri (yerçekimi 0, sönüm 0) depardaki ~2.5 g kalça sarsıntısında eteği ters çeviriyordu; sertlik ×2, en az 0.25 sönüm, kumaşa hafif yerçekimi ve açı sınırı (kumaş 70°, saç 80°) eklendi.
  - Işınlanmada (yeniden doğma) otomatik sıfırlama; NaN koruması.
  - `src/player.js` her karede animasyondan sonra fiziği çalıştırıyor; `test/model-viewer.html?m=hero` da fiziği gösteriyor.
- 4 yeni test (`test/gameplay-test.js`): yükleme, koşarken savrulma (sınır içinde), durunca sakinleşme, çarpışma/NaN. **55/55 geçti, konsol hatası yok.**

## Sıradaki öncelikler
1. Kahraman yüz ifadeleri: VRM `blendShapeMaster` ile göz kırpma ve saldırı/hasar ifadeleri.
2. Animasyon: vuruş tepkisi (`Hit_Chest`), basit ayak IK'si (eğimde ayak yerleştirme).
3. Mobil: kalite ayarı (gölge haritası, piksel oranı), FPS sayacı.
4. İlerleme: kayıt sistemi (localStorage), deneyim/seviye.
