# Geliştirme İlerlemesi (PROGRESS)

Bu dosya her otomatik geliştirme turunda güncellenir. Bir özellik ancak gerçekten bittiğinde "Tamamlandı" bölümüne taşınır.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid avatar, toon gölgeleme, kılıç, saç/kumaş yay kemikleri (Tur 2), yüz ifadeleri + göz kırpma + baş/göz bakışı (Tur 3). Kalan küçük eksik: dudak senkronu (oyunda diyalog olmadığı için gerekmiyor). |
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

### Tur 3 (2026-11-14): kahramanın yüzü ve bakışı (özellik 1 tamamlandı)
- Not: Tur 2'nin işi iki ayrı dalda (`ccr-70a30f22-0d0k0c` ve `ccr-70a30f22-27dapk`) iki kez yapılmış, ikisi de `main`'e birleşmemişti. Bu tur daha yeni ve PROGRESS.md içeren `27dapk` dalının üstüne kuruldu; `0d0k0c` dalı artık gereksiz (aynı özelliğin eski kopyası).
- Yeni modül `src/face.js`:
  - `blendShapesFromVRM0`: VRM `blendShapeMaster` gruplarını (14 grup: ünlüler, blink, blink_l/r, angry, fun, joy, sorrow, surprised) sahnedeki morph hedeflerine bağlar; yüz mesh'inin 10 alt parçasının hepsine uygulanır.
  - `HeroFace`: duruma göre ifade (saldırıda öfke + vuruş anında ağız açılır, 3. vuruşta tam bağırış; hasarda acı + göz kısma; ölümde kapalı gözler; can %30 altında hüzün; yorgun depar sırasında nefes nefese ağız; zıplarken "o"; çömelince odaklı bakış). Olaylar: evcilleştirince 2 sn sevinç, yeni bir hayvan oyuncuyu hedef alınca şaşkınlık. İfadeler yumuşak geçişli.
  - Rastgele göz kırpma (2–6 sn arası, %15 ihtimalle çift kırpma); sevinç/şaşkınlık/acıda bastırılır.
  - Baş/göz bakışı: boyun %40, baş %60 olarak en fazla 65° yana, 25° yukarı/aşağı döner; kalanını gözler taşır ve VRM `lookAt` aralıklarına (iç 8°, dış 12°, dikey 10°) eşlenir. Dönüş animasyon pozunun üstüne dünya uzayında eklenir; saldırı/takla/ölümde kapalı.
  - Hedef seçimi (`Player.updateFace`, 4 Hz): 10 m içinde, önde ±110° koni; tehdit > etkileşim hedefi > yakın.
  - Hata düzeltmesi (geliştirme sırasında bulundu): göz kemikleri hiçbir klipte yok, ek dönüş her karede birikip göz bebeklerini yüzün içine çeviriyordu. Klip kemiği o karede yeniden yazmadıysa önceki karenin dönüşü geri alınıyor; bunun için test eklendi.
- `test/model-viewer.js`: kahramanda ifade düğmeleri, `?f=<ifade>` ve `?look=1` (kameraya bakış).
- Kararsız kartal testi çözüldü: neden, 120 sn'lik yem beklemesinde yaklaşan vahşi avcıların yeni evcil kartalı savaşa çekip öldürmesiydi (`dead=true`). Test artık yalnızca takip uçuşunu ölçüyor: o anda yakındaki avcılar uzaklaştırılıyor ve son vuran çıktıya yazılıyor. Oyun kodu değişmedi (yoldaşın savaşması doğru davranış).
- 10 yeni test (ifade grupları, göz kırpma, saldırı ifadesi, acı ifadesi, başı hedefe çevirme, gözlerin dönmesi, göz dönüşünün birikmemesi, bakışın sıfırlanması, NaN yok, evcilleştirme sevinci). **65/65 test geçiyor (2 ardışık koşuda).**

## Bilinen sorunlar
- Dudak senkronu yok (oyunda seslendirme yok).
- Prosedürel hayvanlarda ayak kayması; kahramanda eğimde ayak IK'si yok (özellik 2).

## Sonraki öncelikler
1. Özellik 2 (gerçekçi animasyonlar): `Hit_Chest` klibiyle darbe tepkisi (üst gövdeye katmanlı), kahramanın eğimde iki kemikli ayak IK'si, prosedürel hayvanlarda ayak kilidi.
2. Özellik 6: XP/seviye ilerlemesi ve localStorage ile kayıt sistemi.
3. Özellik 7: kalite ayarı (gölge, piksel oranı), doku sıkıştırma (KTX2), uzak hayvanlarda güncelleme seyreltme.
4. Özellik 3: ejderha için uçuş (`fly2` klibinden kök hareketini ayıklayarak).
