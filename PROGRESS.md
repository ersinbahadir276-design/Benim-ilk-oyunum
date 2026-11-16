# Geliştirme İlerlemesi (PROGRESS)

Bu dosya her otomatik geliştirme turunda güncellenir. Bir özellik ancak gerçekten bittiğinde "Tamamlandı" bölümüne taşınır.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid avatar, toon gölgeleme, kılıç, saç/kumaş yay kemikleri (Tur 2), yüz ifadeleri + göz kırpma + baş/göz bakışı (Tur 3). Kalan küçük eksik: dudak senkronu (oyunda diyalog olmadığı için gerekmiyor). |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde | Kahraman: 17 retarget klip, eğimde ayak IK'si + kalça alçaltma + ayak tabanı eğimi, katmanlı darbe tepkisi (Tur 4); faz senkronlu yürüme/koşu/depar karışımı ve basan ayak kilidi (Tur 7). Dört ayaklılar (9 tür): eğimde ayak IK'si, yürürken basma kilidi, adım boyu–hız eşlemesi (Tur 5); koşuda görev oranlı dörtnal döngüsü, 7 türde koşuda erken bırakma %100 → %0 (Tur 10). Tilki, ejderha, Mağara Devi: eğimde ayak IK'si (Tur 6), yürürken basma kilidi (Tur 8). **Eksik:** timsah yürüyüş/koşusunda ve tilki/ejderha koşusunda kilit çoğu adımda bırakılıyor; tavşanın koşu basışı 30 fps'de tek kare; kahramanda dönüş/yan adım (strafe) klibi yok. |
| 3 | Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmen | Gönderilen tek dosya (ejderha) ve tilki bağlı. Ejderhanın `fly2` klibi kullanılmıyor (ejderha uçmuyor). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| 4 | Çok sayıda hayvan ve yaratık | ✅ İşlevsel olarak tamam | 14 tür. 12 tür kodla üretilmiş düşük poligonlu model; görsel kalite ejderha ve kahramanın altında. |
| 5 | Evcilleştirme ve yapay zekâ | ✅ İşlevsel olarak tamam | Türe özgü yöntemler, 5 yoldaş, takip/savaş/açlık. Testler geçiyor; tek kararsız test aşağıda. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Büyük ölçüde | Dünya, bölgeler, savaş, envanter; XP/seviye, yoldaş seviyesi, localStorage kaydı (Tur 9'da bu zincire taşındı); 14 görevlik görev zinciri (Tur 9). **Eksik:** ekipman/üretim (kılıç yükseltme), ata binme, gece/gündüz. |
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

### Tur 6 (2026-11-14): tilki, ejderha ve Mağara Devi'nde ayak IK'si (özellik 2)
- Not: Bu tur `ccr-70a30f22-24awvj` dalının (Tur 5) üstüne, `ccr-70a30f22-5zh2te` dalında kuruldu.
- `src/creatures.js` → `GLBCreature._footIK` (tilki ve ejderha, modellerin kendi iskeletleri):
  - Tür tablosuna bacak zincirleri eklendi (`ikLegs`): tilki ön `UpperArm→ForeArm→Hand`, arka `Leg01→Leg02→Foot01`; ejderha ön `UpperArm→Forearm→Hand`, arka `Thigh→Calf→HorseLink`.
  - Klip, kökten geçen ve gövde eğimine eşit bir düzlem varsayar. Her bacak ucunun altındaki gerçek zeminin bu düzlemden farkı hedefe eklenir. Bacaklar `ik.js` içindeki `solveTwoBone` ile çözülür. Uç kemiğin dünya yönü korunur, parmaklar/toynak onu izler. Erişilemeyen hedefte model gerektiği kadar alçalır.
  - Her karenin başında üst/orta kemiklerin animasyon dönüşü geri yüklenir, düzeltme birikmez (klipte izi olmayan kemikler için de güvenli).
  - Prosedürel saldırı (tilki hamlesi), yeme, ölüm ve havadayken kapalı; 45 m dışında çalışmaz.
- `src/creatures.js` → `Biped._footIK` (Mağara Devi): animasyon düz zemin varsayıyordu (dev eğime yatmaz). Her ayak bileğinin altındaki zemin farkı hedefe eklenir, kalça gerektiği kadar alçalır, uyluk + baldır düzlemsel iki kemikli IK ile çözülür. Yumuşatma (`r`) saf animasyon açılarından devam etsin diye önceki karenin düzeltmesi her karede geri alınır.
- Ölçümler (31° yan eğim, aynı klip karesinde, düz zemindeki bacak ucu yüksekliğine göre en büyük sapma): tilki 0.048 → 0.000 m; ejderha 0.754 → 0.001 m; Mağara Devi 0.216 → 0.021 m (aşağıdaki ayak kalça alçalma sınırına takılıyor). Düz zeminde poz değişmiyor (fark ≤ 0.0012 m).
- 12 yeni test (her üç tür için: düz zeminde poz değişmez, yan eğimde bacak uçları zemine oturur, NaN yok, ölünce kapalı). Testte klip zamanı dondurulup tüm ölçümler aynı pozda alınıyor. **95/95 test geçti (2 ardışık koşuda).**

### Tur 7 (2026-11-15): kahramanda hız–adım eşlemesi ve ayak kilidi (özellik 2)
- Not: Bu tur `ccr-70a30f22-5zh2te` dalının (Tur 6) üstüne, `ccr-70a30f22-rorf10` dalında kuruldu.
- Ölçülen sorun: kahramanın yürüme klibi ~0.93 m/sn'lik adım için yapılmış ama 2.8 m/sn'ye kadar oynatılıyordu; koşu klibi ~5.4 m/sn için yapılmış ama 4.4 m/sn'de oynatılıyordu. Basan ayak yürürken ~19 mm/kare (60 fps) kayıyordu.
- Yeni modül `src/gait.js`:
  - `sampleBlend` / `analyzeGait`: klipleri (ya da faz senkronlu karışımlarını) ayrı bir mixer'la örnekler. Kök uzayında, yere yakın ve geriye giden ayağın süpürme hızlarının ortancasını alır. Ortanca kullanılır, çünkü depar klibinin yavaş iniş kareleri ortalamayı 7.97'den 5.2 m/sn'ye düşürüyordu. Ölçülen değerler: yürüme 0.93, koşu 5.43, depar 7.97, çömelerek yürüme 0.71 m/sn.
  - `Locomotion`: yürüme ↔ koşu ↔ depar faz senkronlu karışımı. Kliplerin zamanı doğrudan ortak faza göre ayarlanır. Döngü süresi adım boyu / hız formülüyle bulunur, kadans en fazla 1.8 kat hızlanır, en fazla 0.55 kata yavaşlar.
  - Faz hizalama: "en öndeki sol ayak" her klipte aynı faza denk gelmiyordu. Koşu–depar karışımında ayaklar birbirini götürüyor, adım boyu 5.1'den 2.0 m'ye çöküyordu. Klipler artık iki ayağın ileri–geri ve yükseklik izlerinin çapraz ilintisiyle hizalanıyor; karışım adım boyları 5.07/4.89/5.05/5.10/5.31 m.
  - Karışımın adım boyu doğrusal değil (koşuda basış döngünün daha küçük bir bölümü). Bu yüzden her komşu çift için 0.25/0.5/0.75 oranlarında ölçülüyor; ara değerler doğrusal tamamlanıyor.
- `src/ik.js` → `FootIK` basma kilidi:
  - Basış animasyon pozundan tespit edilir: ayak bileği kendi en alçak yüksekliğine yakındır ve köke göre en az gövde hızının yarısıyla geriye gider. Böylece depar klibinin iniş kareleri kilitlenmiyor; bunlar önceden 1–2 kare sonra kaymayla bırakılıyordu.
  - Basış boyunca ayağın yatay konumu dünyada sabit kalır. Yükseklik animasyondan gelir, bu sayede topuk kalkışı korunur.
  - Kilit noktası bacak boyunun ötesine düşerse kalça en çok 6 cm alçalır. Bu da yetmezse ya da 16 cm'den fazla kayma birikirse kilit bırakılır ve ayak yumuşakça animasyona döner.
  - Ayak kilidi yalnızca yürüme döngüsünde çalışır. Saldırı, etkileşim, zıplama ve takla etkilenmez.
- `src/player.js`: yürüme, koşu, depar ve çömelerek yürüme `Locomotion` ile oynatılıyor. Başka bir klibe (saldırı, bekleme vb.) geçişte karışım söner. Ölüm ve yeniden doğmada sıfırlanır.
- Oynanış değişikliği: çömelerek yürüme hızı 1.9'dan 1.25 m/sn'ye düşürüldü. Klip en fazla 1.8 kat hızlandırılabildiği için 1.9 m/sn'de ayak kaçınılmaz olarak kayıyordu. Evcilleştirme kuralları değişmedi.
- Ölçümler (30 fps test, basışta ayağın dünyadaki kayması, kilit uygulanmadan → kilitli): yürüme 19.5 → 0.00, koşu 7.2 → 0.00, depar 10.9 → 0.03, çömelerek 10.1 → 0.00 mm/kare. Topuk kalkmadan bırakılan basış: 0.
- 8 yeni test: klip yer hızları, faz hizalı karışımda adım boyunun çökmemesi, dört hızda basan ayağın kaymaması ve erken bırakılmaması, durunca karışımın sönmesi, saldırıya geçip geri dönme. **103/103 test geçti.**

### Tur 8 (2026-11-15): tilki, ejderha ve Mağara Devi'nde basma kilidi ve hız–adım eşlemesi (özellik 2)
- Not: Bu tur `ccr-70a30f22-rorf10` dalının (Tur 7) üstüne, `ccr-70a30f22-7iohle` dalında kuruldu. Bu çalışmanın dalı `main`'den başlıyordu; işi tekrarlamamak için önce en güncel zincire (`rorf10`) taşındı.
- `src/ik.js` → `stanceLock` (yeni, üç türün ortak kodu): basış, animasyon pozundan gövde (pivot) uzayında tespit edilir. Bacak ucu kendi en alçak yüksekliğine yakın olmalı ve gövdeye göre en az gövde hızının yarısıyla geriye gitmeli. Pivot uzayı kullanıldığı için tespit eğimden bağımsız. Basış boyunca ucun yatay dünya konumu sabit, yükseklik animasyondan gelir. Kilit noktasına bacak boyu yetmezse gövde en çok bacak boyunun %6'sı kadar alçalabilir. Bu da yetmezse ya da kayma bacak boyunun %40'ını aşarsa kilit o basışta bırakılır.
- `GLBCreature` (tilki, ejderha):
  - Yeni `clipGroundSpeed`: yüklemede yürüme/koşu kliplerini örnekler ve basan ayağın süpürme hızlarının ortancasını alır. Sonuç türe göre önbelleğe alınır. Ölçülen değerler: tilki `Walk` 1.24, `Run` 1.46; ejderha `walk` 1.68 m/sn.
  - Klip oynatma hızı artık gövde hızı / klip yer hızı (0.5–2.2 arası). Önceden gövde hızı / türün yürüme hızı kullanılıyordu ve klip hızından bağımsızdı.
  - IK hedefi kilitli konumdan alınıyor; zemin farkı o noktada ölçülüyor.
- `Biped` (Mağara Devi):
  - Hız–adım eşlemesi: uyluk salınım açısı gövde hızına göre büyür (yürümede en çok 0.6, koşuda en çok 0.75 rad). Bu da yetmezse kadans artar (en çok 2 kat). Önceden adım sabitti, ayak gövdeden ~1.5 m/sn yavaş süpürülüyordu.
  - Ters sarkaç: kalça yüksekliği, en uzun bacağın gerçek dikey boyundan (kalça eğimi ve diz bükümü dahil) hesaplanıyor. Basan ayak basış boyunca aynı yükseklikte kalıyor; önceden basış sonunda 12 cm yükseliyordu.
  - Bacak eklemleri genel yumuşatmadan çıkarıldı (dört ayaklılardaki aynı sorun: adım kısalıyor, faz kayıyordu).
  - IK'ye uyluk yana açılması eklendi (`ZXY` sırası). Neden: kalça yalpaladığında kilitli ayak bacak düzleminin dışında kalıyor ve kareye 7 mm kayıyordu. Yan etki: 31° yan eğimde aşağıdaki ayak artık zemine oturuyor (0.021 → 0.000 m).
  - Kalça alçalması artık hızlı iniyor, yumuşak kalkıyor.
- `test/model-viewer.js`: yaratıklara türün yürüme/koşu hızı veriliyor, böylece görüntüleyicide de adım eşlemesi oyundaki gibi.
- Ölçümler (30 fps, düz zemin, kilitli karelerde ayağın dünyadaki kayması: animasyon → IK sonrası; basış sayısı / erken bırakma):

  | Tür | Hız | Animasyon | IK sonrası | Basış / erken bırakma |
  | --- | --- | --- | --- | --- |
  | Tilki, yürüme | 2.4 m/sn | 35.6 mm/kare | 0.36 mm/kare | 45 / 2 |
  | Ejderha, yürüme | 3.8 m/sn | 39.1 mm/kare | 0.00 mm/kare | 21 / 3 |
  | Mağara Devi, yürüme | 2.1 m/sn | 31.9 mm/kare | 0.04 mm/kare | 9 / 1 |
  | Mağara Devi, koşu | 4.6 m/sn | 66 mm/kare | 0.01 mm/kare | 18 / 1 |
  | Tilki, koşu | 7.5 m/sn | — | — | 21 / 12 |
  | Ejderha, koşu | 6.5 m/sn | — | — | 25 / 21 |

  Tilki ve ejderha koşusunda kilit çoğunlukla bırakılıyor; aşağıdaki "Bilinen sorunlar"a bakın.
- 3 yeni test (her tür için yürürken basan ayak kayması, yeniden basma, erken bırakma oranı). **106/106 test geçti (2 ardışık koşuda), konsol hatası yok.** Görsel kontrol: devin yan görünüşte yürüme/koşu adımı doğal, basan ayak düz.

### Tur 9 (2026-11-15): ilerleme/kayıt sistemi zincire taşındı + görev sistemi (özellik 6)
- Not: Bu turun dalı (`ccr-70a30f22-5gqvtf`) `main`'deydi; önce Tur 8 dalına (`7iohle`) ileri sarıldı (fast-forward), iş tekrar edilmedi.
- **Taşıma:** XP/seviye + yoldaş seviyesi + localStorage kaydı, `main`'den başlayan dallarda 6 kez ayrı ayrı yazılmıştı (`tidu6t`, `vsejd2`, `5rl9w2`, `tyye3p`, `amrfjw`, `yimt6c`). En yenisi (`yimt6c`, `2e0c2f4`) cherry-pick edildi. Çakışmalar yalnızca README ve PROGRESS'teydi; kod otomatik birleşti. Ayrı commit: "Port progression and save system onto the Tur 2-8 chain". Taşıma sonrası 117/117 test geçti.
- **Yeni modül `src/quests.js`:** 14 görevlik sıralı zincir. Türler: evcilleştir, yen (oyuncu ya da yoldaşın öldürmesi sayılır), topla (E ile toplanan eşya adedi), seviyeye ulaş, aynı anda N yoldaş, yoldaşı N. seviyeye çıkar. Görevler tavşandan başlar, ejderhada biter.
  - Aynı anda sıradaki 3 tamamlanmamış görev etkin. Sayaçlar yalnızca etkin görevlerde artar. Bitince ödül verilir (XP + eşya), sıradaki görev etkinleşir. O görev zaten sağlanmışsa (ör. seviye) aynı anda tamamlanır.
  - Olaylar `Progress` kancalarından gelir (`onKill`, `onTame`, `onGather(node, item, n)`). Durum görevleri (seviye, yoldaş sayısı/seviyesi) 2 Hz'de denetlenir.
  - Kayda `quests: {done, count}` eklendi. Yüklemede bilinmeyen görev kimlikleri atılır, sayaçlar hedefle sınırlanır. Eski kayıtlarda bu alan yok, sorunsuz açılıyor.
- **Arayüz:** sol üstte görev paneli (başlık, açıklama, ilerleme çubuğu, ödül, `n/14` sayacı); yalnızca değişince yeniden çizilir. Küçük/yatay telefon ekranında (≤760 px genişlik ya da ≤500 px yükseklik) panel tek satır olur, başlığa dokununca açılır. Mesaj günlüğü de üst ortaya alındı: 780×360'ta günlük daha önce can/dayanıklılık çubuklarının, görev paneli de joystick'in üstüne biniyordu (ekran görüntüsüyle kontrol edildi).
- **Test düzeltmesi:** taşınan "seviye bonusu: kılıç hasarı artar" testi bir koşuda `hasar=5.0` ile başarısız oldu. Neden oyun hatası değil: önceki testlerdeki rastgele dövüşte canı 5'e düşmüş bir kurt seçilmişti, `die()` canı 0'a sabitlediği için ölçülen hasar kalan canla sınırlı kalıyordu. Test artık kurdun canını önce dolduruyor.
- 10 yeni test (başlangıç görevleri, tavşan görevinin ödülü, E ile toplamanın sayılması, böğürtlen görevinin bitmesi, ilgisiz toplamanın sayılmaması, yoldaş + oyuncu kurt öldürmeleri, seviye görevinin kendiliğinden bitmesi, panelin DOM'da etkin görevleri göstermesi, kayıt/yükleme, bozuk kaydın temizlenmesi). **127/127 test geçti (son 2 ardışık koşu), konsol hatası yok.**
- Ortam notu: bu turda yerel `python3 -m http.server` başlatma izni verilmedi. Testler, dosyaları Playwright istek yakalama (`context.route`) ile diskten sunan geçici bir çalıştırıcıyla koşuldu; `test/gameplay-test.js` aynen kullanıldı. Depodaki `test/run-tests.mjs` değişmedi.

### Tur 10 (2026-11-16): dört ayaklılarda koşu için görev oranlı dörtnal döngüsü (özellik 2)
- Not: Bu turun dalı (`ccr-70a30f22-8genbv`) `main`'deydi; önce Tur 9 dalına (`5gqvtf`) ileri sarıldı (fast-forward), iş tekrar edilmedi. Tur 9'dan sonra `main`'den başlayan 3 dal (`isowws`, `yjk648`: yay kemiği fiziği; `x29z4t`: XP/kayıt) yine aynı işi tekrarlamış; bunlar gereksiz.
- Ölçülen sorun (30 fps, düz zemin, türün koşu hızında 4 sn): koşuda 9 dört ayaklının hepsinde basışların ~%100'ü erken bırakılıyordu. Sinüs döngüsünde basış her zaman döngünün yarısıydı ve ayak bu sürede ancak gövdeden çok kısa bir mesafe süpürebiliyordu; klipte ayak yerde 150–240 mm/kare kayıyordu.
- `src/creatures.js` → `Quadruped.animate`, görev oranlı (duty factor) döngü (koşu ve tavşanın sıçraması):
  - Basış döngünün D kadarı (en az 0.2, en çok 0.45). Bu sürede bilek, gövde hızıyla doğrusal olarak geri süpürülür: d = v·D/f. Önce D küçülür; yetmezse adım sıklığı artar (en çok 2×). Salınımda ayak yumuşak (smoothstep) öne taşınır, kaldırma sin(π·v).
  - Bilek dinlenme pozunda kalçanın tam altında değil. Her bacak için kalça düzlemindeki açısı (`a0`) ve uzaklığı (`sR`) yüklemede ölçülüyor; uyluk açısı z = −sR·sin(a0 + açı) bağıntısından çözülüyor, böylece süpürme zeminde gerçekten doğrusal. Ön ve arka bacak boyları farklı olduğu için her bacak kendi açısını alıyor.
  - Gövde basışlarla eş zamanlı: ayak yerdeyken çöker, uçuşta yükselir; ön ayak basarken burun aşağı, arka ayak iterken yukarı. Önceki sinüs sıçraması basışla ilgisizdi; basış ortasında gövde kalkınca bacak kilitli ayağa yetişemiyordu.
  - Bacak eklem süzgeci bu döngüde kapalı: 8 m/sn'de basış 30 fps'de 2–3 kare sürüyor ve süzgecin gecikmesi tek başına ~25 mm/kare kayma yaratıyordu (hedefler zaten sürekli).
- `Quadruped._footIK` düzeltmeleri (yürüyüşü de etkiler):
  - Kilit artık animasyona göre bir ofset olarak uygulanıyor; ayak kalkınca bu ofset sönüyor. Önceden hedef eski kilit noktasına doğru harmanlanıyordu: koşuda salınımdaki ayak geride sürükleniyor, erişemediği için gövdeyi %20–30 alçaltıyordu.
  - Erişim denetimi kilit anındaki eski yüksekliği değil, animasyonun o anki yüksekliğini kullanıyor; gövdenin alçalabileceği kadar (%6) pay var.
  - Gövde alçaltma artık gereken dikey mesafeyi hesaplıyor (önceden düz çizgi farkını kullanıyordu) ve hızlı iniyor, yumuşak kalkıyor.
- Ölçümler (koşu, 30 fps, 4 sn; önce → sonra):

  | Tür | Hız | Erken bırakma / basış | Klipte kayma | IK sonrası kayma | Ort. gövde alçalması |
  | --- | --- | --- | --- | --- | --- |
  | Kurt | 8.2 m/sn | 41/42 → 0/46 | 199 → 12 mm/kare | 0.01 mm/kare | %0.4 |
  | At | 11.0 m/sn | 33/34 → 0/33 | 238 → 19 mm/kare | 0.01 mm/kare | %0.4 |
  | Geyik | 9.0 m/sn | 36/36 → 0/37 | 200 → 15 mm/kare | 0.01 mm/kare | %0.4 |
  | Ayı | 6.8 m/sn | 30/28 → 0/30 | 148 → 12 mm/kare | 0.00 mm/kare | %0.4 |
  | Aslan | 8.6 m/sn | 35/34 → 0/36 | 197 → 14 mm/kare | 0.01 mm/kare | %0.3 |
  | Kaplan | 9.0 m/sn | 34/35 → 0/40 | 221 → 13 mm/kare | 0.01 mm/kare | %0.3 |
  | Gölge Pençe | 8.4 m/sn | 37/36 → 0/36 | 147 → 14 mm/kare | 0.01 mm/kare | %0.5 |
  | Timsah | 4.6 m/sn | 41/40 → 22/44 | 124 → 40 mm/kare | — | %2 |
  | Tavşan (yürüme/sıçrama) | 2.6 m/sn | 48/46 → 10/86 | — | — | %1.6 |

  Yürüyüşte (7 tür) değerler değişmedi: erken bırakma 0–1, kayma 0.
- Timsahta görev oranlı döngü yalnızca koşuda açık. Yürüyüşte denendi ama erken bırakma arttı (27 → 36), bu yüzden yürüyüşte eski döngü kaldı.
- Görsel kontrol (model görüntüleyici, yandan 6 kare): at, kurt ve tavşanın dörtnal/sıçrama pozları doğal; uzanma ve toplanma evreleri görünüyor.
- 6 yeni test: kurt, at, geyik, aslan, ayı koşusunda basan ayak kayması < 1 mm/kare, erken bırakma ≤ %10, ortalama gövde alçalması < %5; yürüyüşe dönünce normal döngü. **133/133 test geçti (2 ardışık koşu), konsol hatası yok.**
- Ortam notu: bu turda yerel sunucu `npx http-server` ile çalıştırıldı; `test/run-tests.mjs` değişmedi.

## Bilinen sorunlar
- Dudak senkronu yok (oyunda seslendirme yok).
- Timsahta (yayvan bacaklar, güçlü gövde salınımı) ayak kilidi yürürken basışların ~yarısında, koşarken ~yarısında erken bırakılıyor. Tavşanın koşusunda basış 30 fps'de tek kare sürüyor, kilit pratikte görünmüyor (kayma da görünmüyor). Diğer 7 dört ayaklıda yürüyüş ve koşuda erken bırakma yok (Tur 10).
- Tilki ve ejderha koşusunda klipler bu hızı karşılayamıyor: tilki `Run` klibi ~1.5 m/sn, ejderhada koşu için yürüme klibi kullanılıyor (1.7 m/sn). Oynatma hızı en çok 2.2 kat (daha hızlısı doğal görünmüyor). Bu yüzden 7.5 / 6.5 m/sn'de basışların çoğu erken bırakılıyor ve ayak klipteki kadar kayıyor. Çözüm: hızlı koşu klibi olan GLB'ler ya da koşu hızının klibe göre düşürülmesi (oynanış kararı).
- Mağara Devi'nde ayak tabanı eğime yatmıyor (ayrı bilek eklemi yok).
- Kartal evcilleştirme testi ara sıra başarısız oluyor (vahşi hayvan rastgeleliği).
- Arkadan gelen darbede katmanlı `Hit_Chest` klibi (önden vuruş klibi) yarı ağırlıkla yine geriye doğru oynar; yönlü savrulma bunu baskın şekilde öne çevirir ama ayrı bir "arkadan darbe" klibi yok.
- Önceki turların dalları `main`'e birleşmedi; birleştirme kullanıcının kararı. En güncel zincir artık `ccr-70a30f22-8genbv` (Tur 2–10; `5gqvtf` Tur 9'a kadar). Tur 9'dan sonra da yay kemiği fiziği `main`'den başlayan 4 dalda daha tekrar yazılmış (`3blqpr`, `znc4u0`, `gtq3z2`, `i6tc9k`); bunlar artık gereksiz. Zamanlanmış çalışmalar hâlâ `main`'den başlıyor; her tur önce bu zincire taşınmalı (ya da zincir `main`'e birleştirilmeli), yoksa iş yeniden yapılır.
- Kahramanda yürüme ↔ koşu karışımında (≈1.2–4.6 m/sn) iki ayağın basışı biraz asimetrik. Bir ayak basışın sonunda (topuk kalkarken) erken bırakılabiliyor; ayakta kayma görünmüyor.

## Sonraki öncelikler
1. **Dalları birleştirme (kullanıcı kararı):** `ccr-70a30f22-8genbv` dalı Tur 2–10'u içeriyor. `main`'e birleştirilirse sonraki turlar işi tekrarlamaz. Birleştirilmezse her tur önce bu dala ileri sarılmalı.
2. Özellik 2'de kalanlar (küçük): kahramanda yerinde dönüş / yan adım (strafe) klipleri ya da prosedürel dönüş adımı; timsah için gövde salınımını telafi eden kilit. Tilki/ejderha koşu kilidi yeni GLB kliplerine ya da koşu hızının klibe göre düşürülmesine (oynanış kararı) bağlı.
3. **Özellik 6'nın kalanı:** ekipman/üretim (kılıç seviyesi, malzeme), ata binme (at evcilleştirilebiliyor ama binilemiyor; at artık koşuda doğal dörtnal atıyor), gece/gündüz.
4. Özellik 7: kalite ayarı (gölge, piksel oranı), doku sıkıştırma (KTX2), uzak hayvanlarda güncelleme seyreltme. Yüklemede `analyzeGait` (kahraman) ve `clipGroundSpeed` (tilki/ejderha) süreleri mobilde ölçülmeli.
5. Özellik 3: ejderha için uçuş (`fly2` klibinden kök hareketini ayıklayarak).
