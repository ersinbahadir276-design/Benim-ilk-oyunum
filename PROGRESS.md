# İlerleme / Progress

Bu dosya zamanlanmış geliştirme çalışmalarının durumunu tutar. Her çalışma en yüksek öncelikli eksik özelliği ilerletir.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | 🟡 Büyük ölçüde | VRoid anime avatarı, toon gölgeleme, kılıç. **Saç/ceket fiziği eklendi (2026-11-15).** Eksik: yüz ifadeleri (blendshape: göz kırpma, acı/öfke), göz takibi. |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde | Kahraman: Quaternius UAL klipleri retarget + crossfade. Eksik: ayak IK (eğimde ayak kayması), prosedürel hayvanlarda ayak kilidi. |
| 3 | Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmi | Ejderha (gönderilen) + tilki entegre. Diğer 12 tür için GLB gönderilmedi; geldiğinde `GLBCreature` ile bağlanacak. Kullanıcıdan dosya bekleniyor. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ Tamamlandı | 14 tür, 6 bölge. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | ✅ Tamamlandı | Türe özgü evcilleştirme, yoldaş takip/savaş/açlık, 5 yoldaş sınırı. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmi | Dünya, savaş (3'lü kombo, takla), envanter, toplama var. **Eksik: ilerleme (XP/seviye), kayıt sistemi, görevler, ata binme.** |
| 7 | Android performansı ve mobil kontroller | 🟡 Kısmi | Dokunmatik kontroller var. Eksik: kalite ayarları (gölge/çözünürlük), cihazda FPS ölçümü, LOD. |

## Çalışma günlüğü

### 2026-11-15 — Kahraman: VRM yay kemiği fiziği (saç + ceket eteği)
- `src/springbone.js` (yeni): hero.glb içindeki VRM 0.x `secondaryAnimation` verisini (20 saç eklemi, 14 etek eklemi, 10 çarpıştırıcı grubu) okuyan Verlet yay kemiği çözücüsü.
  - VRM "center" (Root) uzayında çözüm: karakterin dünyada yer değiştirmesi saçı koparmaz.
  - Koşu hızına bağlı, kemik boyuyla ölçekli sınırlı "rüzgâr" kuvveti: koşarken saç/etek geriye savrulur.
  - Sabit 60 Hz alt adım (en fazla 4) → düşük FPS'li mobilde de aynı davranış, ~34 eklem: ihmal edilebilir maliyet.
  - Kafa/göğüs/kol çarpışma küreleri, eklem başına 65° salınım sınırı, VRoid eteğinin `dragForce=0` değerine 0.2 alt sınır (sönümsüz sallanma ve depar sırasında eteğin havaya kalkması düzeltildi), ışınlanmada sıfırlama.
- `src/hero.js`, `src/player.js`, `test/model-viewer.js`: fizik bağlandı (mixer güncellemesinden sonra).
- `test/run-tests.mjs`: artık ayrı HTTP sunucusu gerekmiyor (Playwright rotası dosyaları diskten sunar); `URL=` ile eski davranış korunur.
- 6 yeni test (yükleme, savrulma, yüze katlanmama, durulma, kararlılık, ışınlanma sıfırlaması). **57/57 test geçti, konsol hatası yok.**
- Görsel kontrol: depar sırasında saç geriye doğal savruluyor; ilk denemede dünya uzayında çözüm saçı yüze katlıyordu, center uzayı + salınım sınırıyla düzeltildi.

## Sıradaki öncelikler
1. **Kahraman (özellik 1):** VRM blendshape ifadeleri — otomatik göz kırpma, hasar alınca acı ifadesi, saldırıda öfke; başın yakındaki hayvana bakması (look-at).
2. **İlerleme (özellik 6):** XP/seviye sistemi ve `localStorage` kayıt/yükleme (envanter, yoldaşlar, konum).
3. **Mobil (özellik 7):** kalite ön ayarları (gölge haritası, piksel oranı), FPS göstergesi.
4. GLB modelleri gelirse (özellik 3) prosedürel türleri değiştir.
