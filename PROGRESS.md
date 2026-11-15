# PROGRESS

Otomatik geliştirme turlarının kaydı. Her tur en öncelikli tamamlanmamış özelliği ilerletir.

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamamlandı (temel) | VRoid AvatarSample_C. Eksik: saç/giysi yay kemiği fiziği. |
| Gerçekçi 3B karakter animasyonları | ✅ Tamamlandı (temel) | Quaternius klipleri retarget + crossfade. Eksik: prosedürel hayvanlarda ayak IK'sı. |
| Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmi | Gönderilen tek GLB (ejderha) bağlı; tilki örnek modeli bağlı. Diğer 12 tür için GLB gönderilmedi — gelince `GLBCreature` ile bağlanacak. |
| Çok sayıda hayvan ve yaratık | ✅ Tamamlandı | 14 tür. |
| Evcilleştirme ve yapay zekâ | ✅ Tamamlandı | Türe özgü 8 yöntem, yoldaş takip/koruma/açlık. |
| Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmi | Dünya/savaş/envanter vardı. **Bu tur:** XP/seviye, yoldaş seviyesi, kayıt/yükleme. Eksik: görevler, ekipman/üretim, gece-gündüz, ata binme. |
| Android performansı ve mobil kontroller | 🟡 Kısmi | Dokunmatik çubuk ve düğmeler var. Eksik: dokunmatik kamera hassasiyeti ayarı, düşük kalite modu (gölge/piksel oranı), FPS ölçümü. |

## Tamamlananlar

### 2026-11-15 — İlerleme ve kayıt sistemi
- `src/progress.js` (yeni): oyuncu XP/seviye (1–30, +12 can, +%8 hasar/seviye), yoldaş XP/seviye (1–20, +%10 can/hasar), XP kaynakları (öldürme, evcilleştirme, toplama, yoldaş vuruşları; paylaşımlı XP).
- localStorage kaydı: 20 sn'de bir otomatik, duraklatmada ve sekme kapanırken; konum, can, seviye, envanter, yoldaşlar. Yüklemede aynı türden bir yabani dünyadan çıkarılır (nüfus sabit, ejderha tek kalır).
- Arayüz: HUD'da XP çubuğu ve seviye, yoldaş panelinde "Sv N" ve XP çubuğu, odak panelinde yoldaş seviyesi, açılışta "Devam Et" / "Yeni Oyun".
- Testler: 11 yeni oynanış testi (62/62 geçti, konsol hatası yok); ayrıca gerçek sayfa yeniden yüklemesiyle kayıt→yükleme uçtan uca doğrulandı.

## Sıradaki öncelikler
1. Android performansı: kalite ayarı (gölge haritası boyutu, piksel oranı, görüş mesafesi), dokunmatikte kamera sürükleme alanı ve hassasiyet, FPS ölçer; düşük güçlü cihaz simülasyonunda ölçüm.
2. İlerleme devamı: basit görevler (evcilleştir/avla/topla), ekipman yükseltmesi (kılıç seviyesi), ata binme.
3. Kahraman: VRM saç/giysi yay kemiği fiziği (basit sönümlü yay).
4. Prosedürel hayvanlarda ayak–zemin IK'sı.
5. Yeni GLB'ler gönderilirse prosedürel türleri değiştirmek.
