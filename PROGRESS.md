# İlerleme / Progress

Zamanlanmış geliştirme çalışmalarının kaydı. Her çalışma bir sonraki öncelikli eksik özelliği ilerletir.

## Tamamlanan özellikler (Completed)

- [x] **Yüksek kaliteli erkek kahraman** — VRoid `AvatarSample_C` anime kahraman, toon malzemeler, kılıç (PR #1).
- [x] **Gönderilen GLB modellerin entegrasyonu** — gönderilen tek GLB (ejderha) kendi iskelet ve klipleriyle bağlandı; tilki Khronos örneği (PR #1). Yeni GLB gelirse aynı `GLBCreature` yolu kullanılır.
- [x] **Birden çok hayvan ve yaratık** — 14 tür, 6 bölge (PR #1).
- [x] **Yaratık evcilleştirme ve yapay zekâ** — türe özgü evcilleştirme, yoldaş takip/savaş/açlık (PR #1).

## Kısmen tamamlanan (In progress)

- [ ] **Gerçekçi 3B karakter animasyonları**
  - [x] Kahraman: Quaternius kliplerinin retarget'ı, crossfade geçişleri (PR #1)
  - [x] Kahraman: saç ve ceket eteği fiziği — VRM 0.x yay kemikleri (2026-11-16)
  - [ ] Prosedürel hayvanlarda ayak–zemin IK'sı (yokuşta ayak kayması/batması)
  - [ ] Kahramanın ayak IK'sı ve eğimde gövde hizalama
  - [ ] Tilki için saldırı/yeme klipleri (şu an prosedürel)
- [ ] **Açık dünya, savaş, envanter ve ilerleme**
  - [x] Bölgeler, kılıç kombosu, takla, envanter, toplama (PR #1)
  - [ ] Kayıt (save/load) sistemi
  - [ ] Seviye/XP ilerlemesi, görevler, gece/gündüz
  - [ ] Ata/ejderhaya binme
- [ ] **Android performansı ve mobil kontroller**
  - [x] Dokunmatik joystick ve butonlar (PR #1)
  - [ ] Kalite ayarları (gölge/çizim mesafesi/piksel oranı), düşük FPS'te yay kemiklerini kapatma
  - [ ] Gerçek cihaz/emülasyonda FPS ölçümü

## Çalışma günlüğü (Run log)

### 2026-11-16
- `src/springbones.js` eklendi: VRM 0.x `secondaryAnimation` okuyucu ve UniVRM tarzı Verlet yay kemiği çözücüsü
  (sertlik, sürükleme, yerçekimi, küre çarpıştırıcılar, merkez uzayı, 60 Hz alt adımlar, ters dönmeyi önleyen açı sınırı).
- Kahramanın 20 saç ve 14 ceket eteği eklemi artık koşu/zıplama/saldırıda sallanıyor; ilk karede T-poz sıçraması önlendi.
- 4 yeni test (zincir yüklenmesi, hareketle sallanma + açı sınırı, zincir boyu korunumu, durunca dinlenmeye dönüş). **55/55 test geçti**, konsol hatası yok.

## Sıradaki öncelikler (Next)

1. Prosedürel hayvanlar için ayak–zemin IK'sı ve eğime göre gövde hizalama (animasyonların kalan kısmı).
2. Kahraman ayak IK'sı.
3. Kayıt sistemi ve XP/seviye ilerlemesi.
4. Mobil kalite ayarları ve performans ölçümü.
