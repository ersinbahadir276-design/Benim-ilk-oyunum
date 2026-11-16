# PROGRESS

Durum takibi (zamanlanmış geliştirme çalışmaları her seferinde burayı okur ve günceller).

## Özellik listesi

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamamlandı (PR #1) | VRoid AvatarSample_C, anime tarzı. Saç/giysi fiziği (VRM yay kemikleri) yok. |
| Gerçekçi 3B karakter animasyonları | ✅ Tamamlandı (PR #1) | Quaternius klipleri kahraman iskeletine retarget; crossfade. Prosedürel hayvanlarda ayak IK yok. |
| Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmen | Gönderilen tek GLB (ejderha) + tilki entegre. Diğer 12 tür için GLB gönderilmedi; gelince `GLBCreature` ile bağlanacak. Ejderha uçuşu yok. |
| Çok sayıda hayvan ve yaratık | ✅ Tamamlandı (PR #1) | 14 tür, 6 bölge. |
| Yaratık evcilleştirme ve yapay zekâ | ✅ Tamamlandı (PR #1) | Türe özgü 8 yöntem, yoldaş takip/savaş/açlık. |
| Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmen | Dünya, savaş, envanter (PR #1); **ilerleme + kayıt bu çalışmada eklendi**. Eksik: görevler, ekipman/silah yükseltme, gece/gündüz, ata binme. |
| Android performans ve mobil kontroller | 🟡 Kısmen | Dokunmatik çubuk + butonlar var. Eksik: kalite ayarı (gölge/çözünürlük), dokunmatik kamera iyileştirme, gerçek cihazda FPS ölçümü. |

## Tamamlananlar

- **PR #1** — 3B taming macerası: kahraman, 14 tür, evcilleştirme, yoldaşlar, envanter, dokunmatik kontroller, 51 test.
- **2026-11-16 çalışması** — İlerleme ve kayıt sistemi (`src/progress.js`):
  - Oyuncu XP/seviye (1–30): av, evcilleştirme, toplama XP verir; seviye başına +10 can, +%8 saldırı, +4 dayanıklılık; seviye atlayınca tam iyileşme.
  - Yoldaş XP/seviye (1–20): birlikte savaştığı düşmanlardan XP (son vuruş tam, katkı %60); seviye başına +%10 can/saldırı. Serbest bırakılınca seviye sıfırlanır.
  - HUD: seviye rozeti + XP çubuğu; yoldaş panelinde "Sv N".
  - Otomatik kayıt (localStorage): 30 sn'de bir, duraklatınca, sekme gizlenince/kapanınca. Konum, can, seviye, envanter, yoldaşlar (tür/ad/seviye/XP/açlık/can) saklanır; açılışta yüklenir. Bozuk kayıt reddedilir. "Yeni Oyun (kaydı sil)" butonu, `?nosave` parametresi.
  - 10 yeni test (toplam 61/61 geçiyor); gerçek sayfada kayıt→yenile→yükleme doğrulandı.

## Sıradaki öncelikler

1. **Android performans ve mobil kontroller:** kalite ön ayarı (gölge haritası boyutu, pixelRatio, uzak nesne çizim mesafesi), otomatik FPS'e göre ölçekleme, dokunmatik kamera sürükleme alanı, eşya seçimi için dokunmatik hotbar iyileştirmesi.
2. **Açık dünya/ilerleme devamı:** basit görev sistemi (ör. "3 kurt evcilleştir"), silah/ekipman yükseltmeleri (XP harcama veya ganimetle), gece/gündüz döngüsü.
3. **GLB entegrasyonu:** yeni GLB'ler gönderildiğinde prosedürel türleri değiştir; ejderha uçuş hareketi; ata binme.
