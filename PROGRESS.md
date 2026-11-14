# İlerleme (PROGRESS)

Zamanlanmış geliştirme görevinin her çalışmasında güncellenir.

## Tamamlananlar

- [x] **Çok sayıda hayvan ve yaratık** — 14 tür (PR #1).
- [x] **Evcilleştirme ve yapay zekâ** — türe özgü 13 yöntem, yoldaş takip/savaş/açlık/can (PR #1).
- [x] **Gönderilen GLB modellerin entegrasyonu** — gönderilen tek GLB (ejderha) kendi iskelet ve klipleriyle bağlı (PR #1). Yeni GLB gelirse `GLBCreature` ile bağlanacak.

## Kısmen tamamlananlar (açık eksikler)

- [ ] **Yüksek kaliteli erkek kahraman** — VRoid avatar + toon malzeme (PR #1). Saç/ceket fiziği eklendi (2026-11-14). Eksik: yüz ifadeleri / göz kırpma (VRM blendShape), göz bakışı.
- [ ] **Gerçekçi 3B karakter animasyonları** — Quaternius klipleri çalışma anında aktarılıyor. Eksik: ayak–zemin IK (eğimde ayak kayması), hayvanlarda IK, yön değiştirirken gövde eğilmesi.
- [ ] **Açık dünya, savaş, envanter, ilerleme** — dünya/bölgeler, kılıç kombosu, envanter var. Eksik: XP/seviye ilerlemesi, kayıt (save) sistemi, görevler, gece/gündüz.
- [ ] **Android performansı ve mobil kontroller** — dokunmatik kontroller var. Eksik: kalite ayarları (gölge/çözünürlük düşürme), FPS ölçümü, gerçek cihaz testi.

## Çalışma günlüğü

### 2026-11-14
- PROGRESS.md oluşturuldu; depo durumu incelendi (açık değişiklik yoktu).
- **Kahraman: VRM yay kemiği fiziği** (`src/springbone.js`): VRM 0.x `secondaryAnimation` verisi (7 saç grubu + ceket eteği, 34 eklem, 10 çarpışma küresi grubu) okunup UniVRM algoritmasıyla simüle ediliyor. Sabit 60 Hz alt adım (mobilde 30 fps'te de aynı davranış), merkez (Root) uzayında atalet, NaN koruması, yeniden doğmada sıfırlama. `model-viewer` da fiziği çalıştırıyor.
- 4 yeni test (kurulum, depar sırasında salınım, dinlenmeye dönüş, uzunluk/NaN kararlılığı). Toplam **55/55 test geçti**, konsol hatası yok.

## Sıradaki öncelikler

1. Kahraman: VRM blendShape ile göz kırpma ve basit yüz ifadeleri (saldırı/hasar/evcilleştirme anında).
2. Animasyon: kahraman için ayak–zemin IK (eğimli arazide ayak yerleşimi).
3. İlerleme: XP/seviye sistemi ve localStorage kayıt sistemi.
4. Android: otomatik kalite ayarı (pixelRatio/gölge) ve FPS göstergesi.
