# Geliştirme İlerlemesi (PROGRESS)

Bu dosya her otomatik geliştirme turunda güncellenir. Bir özellik ancak gerçekten bittiğinde "Tamamlandı" bölümüne taşınır.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid avatar, toon gölgeleme, kılıç, saç/kumaş yay kemikleri (Tur 2), yüz ifadeleri + göz kırpma + baş/göz bakışı (Tur 3). Kalan küçük eksik: dudak senkronu (oyunda diyalog olmadığı için gerekmiyor). |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde | Kahraman: 17 retarget klip, eğimde ayak IK'si + kalça alçaltma + ayak tabanı eğimi, katmanlı darbe tepkisi (Tur 4). Dört ayaklılar (9 tür): eğimde ayak IK'si, basma kilidi, adım boyu–hız eşlemesi (Tur 5). **Eksik:** tilki/ejderha (GLB) ve Mağara Devi'nde ayak IK'si; kahramanda yürürken ayak kilidi; dörtnalda (koşu) ayak kilidi çoğu adımda erken bırakılıyor. |
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

### Tur 4 (2026-11-14): kahramanda ayak IK'si ve darbe tepkisi (özellik 2)
- Not: Bu tur `ccr-70a30f22-zpp74x` dalının (Tur 3) üstüne kuruldu; önceki turlar `main`'e birleşmemiş durumda.
- Yeni modül `src/ik.js`:
  - `solveTwoBone`: analitik iki kemikli IK (uyluk–diz–bilek), yalnızca dönüş değiştirir, kemik boyları korunur; diz düzken bile tanımlı bükülme ekseni (karakterin önü ipucu).
  - `FootIK`: her ayağın altındaki zemin yüksekliğini kökün zeminiyle karşılaştırır (−0.40…+0.45 m), kalçayı aşağıdaki ayak kadar alçaltır, iki bacağı hedefe çözer ve ayak tabanını arazi normaline en fazla 26° yatırır. Geçişler yumuşatılır; zıplama/takla/ölümde ağırlık 0'a iner. Animasyon her karede bacakları yeniden yazdığı için düzeltme birikmez.
  - Ölçüm (31° eğim, eğime yan duruş): IK yokken ayak bilekleri zeminden 0.21 m / 0.04 m; IK ile 0.11 / 0.11 m (düz zemindeki değer 0.11 m).
- Darbe tepkisi (`Player.hitReact` / `applyFlinch`):
  - Yüklü ama kullanılmayan `Hit_Chest` klibi yalnızca üst gövde izlerine süzülüp kendi ilk karesine göre **katmanlı (additive)** klibe çevrildi (`Hit_Chest_Add`); koşu/saldırı klibi kesilmeden üstüne oynar. Önden gelen darbede tam, arkadan gelende yarı ağırlık.
  - Omurga zincirine (Spine/Chest/UpperChest) saldırganın tersi yönünde dünya uzayında savrulma: 70 ms yükseliş, ~0.4 sn sönüm, hasar büyüklüğüyle ölçekli.
  - Hafif geri itilme (saldırı sırasında daha az). Oyuncu hızını değiştirmez; at/yılan evcilleştirmesindeki "kıpırdama" kontrolü etkilenmez. Taklada katmanlı klip oynamaz.
- 8 yeni test (eğimde ayak yükseklikleri, kalça alçalması, NaN/baldır boyu, havada IK kapalı, katmanlı klip, savrulma yönü, geri itilme, toparlanma). **73/73 test geçiyor (2 ardışık koşuda).**

### Tur 5 (2026-11-14): dört ayaklı hayvanlarda ayak IK'si ve ayak kilidi (özellik 2)
- Not: Bu tur `ccr-70a30f22-slper5` dalının (Tur 4) üstüne kuruldu. Zamanlanmış çalışmaların çoğu `main`'den başlayıp aynı işi tekrarlamış: yay kemiği fiziği 6 ayrı dalda (`0d0k0c`, `27dapk`, `4x6ipn`, `mhpa06`, `e13i80`, `kuus2y`), ilerleme/kayıt sistemi 2 ayrı dalda (`tidu6t`, `vsejd2`) yapılmış. Hiçbiri `main`'e birleşmedi.
- `src/creatures.js` → `Quadruped._footIK` (kurt, ayı, geyik, at, aslan, kaplan, tavşan, timsah, Gölge Pençe için):
  - Animasyon kökten geçen ve gövde eğimine eşit tek bir düzlem varsayar. Her ayağın altındaki gerçek zeminin bu düzlemden farkı (yan eğim, tümsek, çukur) ayak bileği hedefine eklenir.
  - Düzlemsel iki kemikli IK (uyluk + baldır, kalçanın yerel düzleminde): diz bükülme yönü korunur, ayak tabanının mutlak açısı korunur. Hedef bacak düzleminin dışındaysa kalça eklemi yana döner (en çok 0.35 rad).
  - Erişilemeyen hedefte gövde gerektiği kadar alçalır (en çok boyunun %30'u). Yalnızca animasyondakinden uzak hedefler alçaltır, böylece düz zeminde poz hiç değişmez.
  - Basma kilidi: basma evresinde ayak dünyada sabitlenir. Bacak fazla gerilirse kilit o basışta bırakılır ve ayak yumuşakça animasyona döner (sıçrama yok).
  - Basan ayağın tabanı yerel zemin eğimine yatırılır (±0.4 rad).
  - Her kare önce saf animasyon pozu geri yüklenir, düzeltme birikmez. Ölüm ve havadayken kapalı. Performans için yalnızca oyuncuya 45 m içinde ya da evcilse çalışır.
- Bulunan ve düzeltilen kök neden: bacak eklemleri genel yumuşatmadan (τ≈83 ms) geçiyordu. Bu, yürüyüş döngüsünü süzüp adımı ~%35 kısaltıyor ve kaldırma evresinden ~50° kaydırıyordu; ayaklar bu yüzden kayıyordu. Bacaklar artık hızlı izliyor (hedefleri zaten sürekli).
- Adım boyu–hız eşlemesi (yürüyüş): salınım genliği gövde hızına göre en çok 1.4× büyür, yetmezse adım sıklığı artar (en çok 1.8×).
- Ölçümler (31° yan eğim, dinlenme): kurtta ayak bilekleri zeminden ±0.05 m sapıyordu, şimdi ≤0.006 m; atta ±0.09 m sapıyordu, şimdi ≤0.011 m. Yürürken (2.7–2.9 m/s) kilitli ayakta kayma 0 mm/kare (animasyon tek başına 32–40 mm/kare). Erken bırakma adımların %35–50'sinde oluyor (önce %100'dü).
- 10 yeni test (kurt ve at için: düzde poz değişmez, yan eğimde dört ayak zeminde, NaN yok/kemik boyu, yürürken kayma yok, ölünce kapalı). **83/83 test geçti (3 koşudan 2'sinde).** Diğer koşuda kartal evcilleştirme testi bir kez başarısız oldu (`trust=1`). Kartal bu IK'yi kullanmıyor; vahşi hayvanların rastgeleliğine bağlı ve hâlâ ara sıra başarısız oluyor.

## Bilinen sorunlar
- Dudak senkronu yok (oyunda seslendirme yok).
- Dört ayaklılarda koşuda (dörtnal) ayak kilidi çoğu adımda erken bırakılıyor; yürüyüşte de adımların %35–50'sinde erken bırakılıyor.
- Tilki, ejderha (GLB iskeletleri) ve Mağara Devi'nde ayak IK'si yok.
- Kartal evcilleştirme testi ara sıra başarısız oluyor (vahşi hayvan rastgeleliği).
- Arkadan gelen darbede katmanlı `Hit_Chest` klibi (önden vuruş klibi) yarı ağırlıkla yine geriye doğru oynar; yönlü savrulma bunu baskın şekilde öne çevirir ama ayrı bir "arkadan darbe" klibi yok.
- Önceki turların dalları (`0d0k0c`, `27dapk`, `zpp74x`, bu dal) `main`'e birleşmedi; birleştirme kullanıcının kararı.

## Sonraki öncelikler
1. **Dalları birleştirme (kullanıcı kararı):** Bu dal (`ccr-70a30f22-24awvj`) Tur 2–5'i içeriyor. `tidu6t` dalındaki ilerleme/kayıt sistemi (özellik 6) buraya taşınabilir; yeniden yazılmamalı.
2. Özellik 2'yi bitirmek: tilki ve ejderha GLB iskeletleri için ayak IK'si (`solveTwoBone` kullanılabilir), Mağara Devi için iki ayaklı IK, kahramanda yürürken ayak kilidi. Ardından özellik 2 tamamlanmış sayılabilir.
3. Özellik 6: `tidu6t` dalındaki XP/seviye ve localStorage kaydını bu dala taşımak. Ardından görevler.
4. Özellik 7: kalite ayarı (gölge, piksel oranı), doku sıkıştırma (KTX2), uzak hayvanlarda güncelleme seyreltme.
5. Özellik 3: ejderha için uçuş (`fly2` klibinden kök hareketini ayıklayarak).
