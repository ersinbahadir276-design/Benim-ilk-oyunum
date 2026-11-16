# İlerleme (PROGRESS)

Otomatik geliştirme çalışmalarının kaydı. Her çalışma bir sonraki en öncelikli eksik özelliği ilerletir.

## Özellik durumu

| Öncelik | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde tamam** — VRoid anime avatarı, toon malzeme, kılıç, saç + ceket eteği fiziği. Eksik: yüz ifadeleri / göz kırpma (VRM blendshape), göz takibi. |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — kahraman: 20+ retarget klip + crossfade. Eksik: ayak IK (eğimli zeminde ayak kayması), prosedürel hayvanlarda ayak kilidi, vuruş tepkisi (hit-react) klibi. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — gönderilen tek model (ejderha) entegre. Diğer türler için GLB bekleniyor; `GLBCreature` hazır. Ejderha uçuşu yok. |
| 4 | Çoklu hayvan ve yaratık | Tamam — 14 tür (12'si kodla üretilmiş rigli modeller). |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Tamam — türe özgü yöntemler, yoldaş takip/savaş/açlık. |
| 6 | Açık dünya, savaş, envanter, ilerleme | Kısmen — dünya/bölgeler, kombo savaşı, envanter var. Eksik: XP/seviye ilerlemesi, kayıt (save), görevler, gece/gündüz. |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik joystick ve butonlar var. Eksik: kalite ayarı (gölge/çözünürlük ölçeği), dokunmatik kamera kontrolü testi, FPS ölçümü. |

## Tamamlananlar

- (Önceki PR #1) 3B taming macerası: dünya ve bölgeler, VRoid erkek kahraman + retarget animasyonlar, 14 tür, yapay zekâ, türe özgü evcilleştirme, yoldaş sistemi, envanter/toplama, dokunmatik kontroller, 51 oynanış testi.
- (2026-11-16) Kahraman için VRM 0.x yay kemiği fiziği.

## Çalışma günlüğü

### 2026-11-16 — Kahraman: saç ve ceket eteği fiziği
- `src/springbone.js` eklendi: GLB içindeki VRM `secondaryAnimation` verisini okuyan, UniVRM algoritmasına dayalı Verlet yay kemiği çözücü (34 eklem: 7 saç grubu + ceket etekleri).
  - Sabit 60 Hz alt adım (kare başına en fazla 4) → düşük FPS'te (mobil) kararlı.
  - VRM küre çarpıştırıcıları (baş, boyun, göğüs, kollar) uygulanıyor; VRM0 Unity Z ekseni dönüştürülüyor.
  - Ceket eteklerinin VRM'de çarpıştırıcısı olmadığı için baldır küreleri eklendi (bacak içine girmesin).
  - Işınlanmada (yeniden doğma) otomatik sıfırlama — saç uçup gitmiyor.
- `hero.js` yay kemiklerini yükler; `player.js` her karede animasyondan sonra çalıştırır.
- 6 yeni test: yükleme, koşu/durmada salınım, dinlenmeye dönüş + boy korunumu, NaN yok, saç kafa içine girmez, ışınlanmada sıfırlama. Sonuç: **57/57 test geçti**, konsol hatası yok.

## Sonraki öncelikler
1. Kahraman: VRM blendshape ile göz kırpma ve saldırı/hasar yüz ifadeleri (kahraman özelliğini kapatmak için).
2. Animasyon: kahraman için ayak IK (eğimli zemin), hasar alma tepkisi.
3. İlerleme sistemi: XP/seviye + localStorage kayıt.
4. Mobil: kalite ön ayarı (gölge haritası, pixelRatio sınırı) ve FPS göstergesi.
