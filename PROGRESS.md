# PROGRESS — Yaban Yoldaşları

Bu dosya zamanlanmış geliştirme çalıştırmalarının ilerlemesini izler.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı (VRoid AvatarSample_C, `src/hero.js`) |
| 2 | Gerçekçi 3B karakter animasyonları | ✅ Tamamlandı (Quaternius UAL klipleri retarget, crossfade durum makinesi) — eksik: saç/giysi yay kemikleri fiziği |
| 3 | Gönderilen GLB modellerin entegrasyonu | ✅ Gönderilen tek model (ejderha) entegre; tilki Khronos örneği. Yeni GLB gelirse `GLBCreature` ile bağlanacak |
| 4 | Çok sayıda hayvan ve yaratık | ✅ 14 tür |
| 5 | Evcilleştirme ve yapay zekâ | ✅ Türe özgü yöntemler, yoldaş takip/savaş/açlık |
| 6 | Açık dünya, savaş, envanter ve ilerleme | 🟡 Kısmen — dünya/savaş/envanter/XP-seviye/kayıt tamam; görevler, ekipman/üretim, gece-gündüz eksik |
| 7 | Android performans ve mobil kontroller | 🟡 Kısmen — dokunmatik joystick + butonlar var; kalite ayarı, düşük gölge/piksel oranı, dokunmatik kamera iyileştirmesi eksik |

## Tamamlanan çalışmalar

### Önceki çalışma (PR #1)
- 3B dünya ve 6 bölge, erkek anime kahraman + animasyonlar, 14 tür (ejderha GLB, tilki GLB, 12 prosedürel rigli model), türe özgü evcilleştirme, yoldaş sistemi, envanter/toplama, dokunmatik kontroller, 51 oynanış testi.

### 2026-11-16 çalıştırması — İlerleme (progression) ve kayıt sistemi
- `src/progress.js` (yeni): oyuncu XP/seviye (1–20; seviye başına +12 can, +%8 kılıç hasarı), yoldaş XP/seviye (1–10; +%10 can, +%8 hasar), XP kaynakları (öldürme, evcilleştirme, toplama, yoldaş payı).
- Kayıt/yükleme: localStorage, 20 sn'de bir + duraklatma + sekme kapanışında otomatik; kayıt doğrulama (bozuk kayıt oyunu kırmaz); yoldaşlar seviyeleriyle geri yüklenir; ejderha tekil kalır.
- Arayüz: XP çubuğu + seviye etiketi, yoldaş panelinde seviye, başlangıçta "Devam Et — Seviye N" ve "Yeni Oyun" düğmeleri; "?" düğmesi yeni çubukla çakışmayacak şekilde taşındı.
- `animal.js`: yoldaş hasar çarpanı, öldürme/evcilleştirme XP kancaları, `becomePet(restored)`; `player.js`: seviyeye bağlı kılıç hasarı.
- Testler: 14 yeni test (51 → 65), hepsi geçiyor, konsol hatası yok. Gerçek sayfada kaydet → yenile → devam et akışı Playwright ile doğrulandı.

## Sıradaki öncelikler
1. **Özellik 6'nın kalanı:** basit görev sistemi (ör. "3 kurt avla", "bir at evcilleştir") ve XP ödülleri; gece/gündüz döngüsü.
2. **Özellik 7 — Android:** otomatik kalite seviyesi (FPS ölçüp gölge haritası/piksel oranı/görüş mesafesi düşürme), dokunmatik kamera sürükleme alanı, buton boyutları, ekran yönü.
3. Seviye atlama için ses/parçacık efekti; yoldaşlar için XP çubuğu.
4. Yeni GLB'ler gönderilirse prosedürel türlerin değiştirilmesi; ata binme.
