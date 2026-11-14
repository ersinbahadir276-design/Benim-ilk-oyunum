# Geliştirme İlerlemesi (PROGRESS)

Bu dosya her otomatik geliştirme turunda güncellenir. Bir özellik ancak gerçekten bittiğinde "Tamamlandı" bölümüne taşınır.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | 🟡 Devam ediyor | VRoid avatar, toon gölgeleme, kılıç ve saç/kumaş yay kemikleri var. Eksik olanlar: yüz ifadeleri (göz kırpma, acı/öfke ifadesi; VRM blendshape'leri), göz/baş bakışı (look-at). |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Kısmen | Kahramanın 17 klibi retarget ediliyor. Eksik olanlar: kahraman için ayak IK'si (eğimde ayak gömülüyor), `Hit_Chest` klibi yüklü ama kullanılmıyor (darbe tepkisi yok), prosedürel hayvanlarda ayak kayması. |
| 3 | Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmen | Gönderilen tek dosya (ejderha) ve tilki bağlı. Ejderhanın `fly2` klibi kullanılmıyor (ejderha uçmuyor). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ İşlevsel olarak tamam | 14 tür. 12 tür kodla üretilmiş düşük poligonlu model; görsel kalite ejderha ve kahramanın altında. |
| 5 | Evcilleştirme ve yapay zekâ | ✅ İşlevsel olarak tamam | Türe özgü yöntemler, 5 yoldaş, takip/savaş/açlık. Testler geçiyor; tek kararsız test aşağıda. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmen | Dünya, bölgeler, savaş ve envanter var. **İlerleme (XP/seviye), kayıt (save), görevler yok.** |
| 7 | Android performansı ve mobil kontroller | 🟡 Kısmen | Dokunmatik joystick ve düğmeler var. Performans ayarı yok: kahraman 13 MB, ejderha 11 MB, sıkıştırılmamış dokular, kalite ayarı ya da LOD yok. |

## Tamamlanan işler

### Tur 1 (2026-11-14, ilk sürüm, PR #1)
- three.js oyunu, dünya, 14 tür, kahraman, retarget edilmiş animasyonlar, evcilleştirme, yoldaşlar, dokunmatik kontroller, 51 test.

### Tur 2 (2026-11-14): kahraman için saç ve kumaş fiziği (özellik 1)
- Yeni modül `src/springbone.js`: VRM 0.x `secondaryAnimation` yay kemiklerinin çözücüsü (UniVRM algoritması: Verlet kuyruk, sertlik, sürtünme, yerçekimi, küre çarpıştırıcılar).
  - Kuyruklar karakter kökü uzayında tutuluyor. Böylece koşu ve dönüş zinciri savurmuyor; gövde hızından "hava direnci" uygulanıyor.
  - Sabit 60 Hz alt adımlarla çalışıyor, davranış kare hızından bağımsız. Işınlanma ve yeniden doğmada kendini sıfırlıyor.
  - Gruba göre ayar kancası (`tune`) ve açı sınırı (`maxAngle`) var.
- `src/hero.js`: modelin kendi verisinden 34 eklem yükleniyor (7 saç zinciri, paça kumaşı) ve 10 çarpıştırıcı grubu kullanılıyor. Kumaş bacaktan geçmesin diye uyluklara 6 küre eklendi. Dosyadaki kumaş ayarı sürtünmesiz ve yerçekimsiz olduğu için (koşarken 170° savruluyordu) hafif yerçekimi, en az sürtünme ve 60° açı sınırı eklendi.
- `src/player.js`: yay kemikleri her karede mixer'dan sonra güncelleniyor ve yeniden doğmada sıfırlanıyor.
- `test/model-viewer.js`: kahraman görüntüleyicisi de yay kemiklerini çalıştırıyor.
- 4 yeni test: yay kemikleri yükleniyor, koşarken sallanıyor, durunca yatışıyor, kemik uzunlukları korunuyor. **55/55 test geçiyor** (4 koşudan 3'ünde; kararsız test için aşağıya bakın).

## Bilinen sorunlar
- **Kararsız test:** `kartal yoldaş: oyuncunun üstünde uçar` 4 koşudan 1'inde düştü (`alt=0.0 d=0.8`). Bu turdaki değişiklik hayvan kodunu etkilemiyor. Teşhis için testin çıktısına durum, hedef ve `stay` bilgisi eklendi. Bir sonraki turda bakılacak.

## Sonraki öncelikler
1. Özellik 1, kahramanı bitirme: VRM blendshape'leriyle göz kırpma ve duruma göre yüz ifadesi (hasar, saldırı, ölüm), baş ve göz bakışı (look-at). Bu ikisi bitince özellik 1 tamamlanmış sayılabilir.
2. Özellik 2: `Hit_Chest` ile darbe tepkisi, kahramanın eğimde ayak IK'si.
3. Kartal yoldaş testindeki kararsızlığı çözmek.
4. Özellik 6: XP/seviye ilerlemesi ve localStorage ile kayıt sistemi.
5. Özellik 7: kalite ayarı (gölge, piksel oranı), doku sıkıştırma (KTX2), uzak hayvanlarda güncelleme seyreltme.
