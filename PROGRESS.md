# İlerleme (PROGRESS)

Zamanlanmış geliştirme çalışmalarının kaydı. Her çalışmada en yüksek öncelikli eksik özellik ilerletilir.

## Özellik durumu

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | **Büyük ölçüde tamam**: VRoid anime avatarı, toon gölgelendirme, kılıç, saç + ceket eteği fiziği. Eksik: yüz ifadeleri (blendshape: göz kırpma, acı/öfke), göz takibi. |
| Gerçekçi 3B karakter animasyonları | Kısmen: kahramanda 17 retarget klip + crossfade. Eksik: ayak IK (eğimli zemin), kahramanın vuruş alma klibi oyunda kullanılmıyor; prosedürel hayvanlarda ayak kayması. |
| Gönderilen GLB modellerin entegrasyonu | Tamam (gönderilen tek GLB: ejderha). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| Çok sayıda hayvan ve yaratık | Tamam: 14 tür (12'si kodla üretilmiş düşük poligon). |
| Yaratık evcilleştirme ve yapay zekâ | Tamam: türe özgü yöntemler, yoldaş takip/savaş/açlık. |
| Açık dünya, savaş, envanter, ilerleme | Kısmen: dünya/bölgeler, savaş, envanter var. **İlerleme (seviye/XP), kayıt sistemi, görevler yok.** |
| Android performansı ve mobil kontroller | Kısmen: dokunmatik joystick + düğmeler var. Kalite ayarı / FPS ölçümü / gölge-çözünürlük ölçekleme yok. |

## Tamamlananlar

- (önceki PR #1) Oyunun tamamı: dünya, kahraman + animasyonlar, 14 tür, evcilleştirme, yoldaşlar, envanter, dokunmatik kontroller, 51 test.
- **2026-11-14** — Kahraman saç ve ceket eteği fiziği (VRM 0.x yay kemikleri).

## Çalışma günlüğü

### 2026-11-14
- `src/springbone.js` eklendi: VRM 0.x `secondaryAnimation` verisini okuyan Verlet yay kemiği çözücüsü (34 eklem: 20 saç, 14 etek; modeldeki 22 küre çarpıştırıcı: baş, boyun, göğüs, kollar).
  - Sabit 1/60 sn adım (düşük FPS'te kararlı), büyük takılmalarda en fazla 4 adım, "center" (Root) uzayında uçlar: koşma/ışınlanma saçı savurmaz, yalnızca vücut hareketi savurur.
  - Model etek için sürtünme 0 veriyordu → koşu ritmiyle rezonans, 160°'ye varan savrulma. En az 0.2 sürtünme, gruba göre açı sınırı (saç ~70°, etek ~50°) ve uyluk/baldır kapsül çarpıştırıcıları eklendi (14 ek küre).
  - Yeniden doğmada yay kemikleri sıfırlanıyor.
- `test/gameplay-test.js`: 5 yeni test (yükleme, depar sırasında savrulma, kemik boyu korunur/NaN yok, durunca yatışma, açı sınırı). **56/56 test geçti, konsol hatası yok.**

## Sıradaki öncelikler

1. Kahraman yüz ifadeleri: VRM blendshape'leri (göz kırpma, hasar alınca acı, saldırıda öfke) + başın yakındaki hedefe dönmesi → kahraman maddesini kapatır.
2. Kahramanın vuruş alma (`Hit_Chest`) klibini hasarda oynatmak; eğimli zeminde basit ayak IK.
3. İlerleme sistemi: XP/seviye, yoldaş seviyeleri; localStorage kayıt/yükleme.
4. Android: kalite ön ayarları (gölge, piksel oranı, görüş mesafesi), FPS ölçümü ve otomatik düşürme.
