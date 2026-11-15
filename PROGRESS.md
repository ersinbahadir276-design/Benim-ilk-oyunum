# Geliştirme İlerlemesi (PROGRESS)

Bu dosya her otomatik geliştirme turunda güncellenir. Bir özellik ancak gerçekten bittiğinde "Tamamlandı" bölümüne taşınır.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | ✅ Tamamlandı | VRoid avatar, toon gölgeleme, kılıç, saç/kumaş yay kemikleri (Tur 2), yüz ifadeleri + göz kırpma + baş/göz bakışı (Tur 3). Kalan küçük eksik: dudak senkronu (oyunda diyalog olmadığı için gerekmiyor). |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Büyük ölçüde | Kahraman: 17 retarget klip, eğimde ayak IK'si + kalça alçaltma + ayak tabanı eğimi, katmanlı darbe tepkisi (Tur 4); yüklemede ölçülen klip yer hızlarıyla faz senkronlu yürüme/koşu/depar karışımı ve basan ayak kilidi (Tur 7). Dört ayaklılar (9 tür): eğimde ayak IK'si, basma kilidi, adım boyu–hız eşlemesi (Tur 5). Tilki, ejderha (GLB iskeletleri) ve Mağara Devi: eğimde ayak IK'si (Tur 6). **Eksik:** tilki/ejderha/devde basma kilidi; dört ayaklılarda dörtnalda (koşu) ayak kilidi çoğu adımda erken bırakılıyor; kahramanda dönüşlerde/yan adımda (strafe) özel klip yok. |
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

## Bilinen sorunlar
- Dudak senkronu yok (oyunda seslendirme yok).
- Dört ayaklılarda koşuda (dörtnal) ayak kilidi çoğu adımda erken bırakılıyor; yürüyüşte de adımların %35–50'sinde erken bırakılıyor.
- Tilki, ejderha ve Mağara Devi'nde ayak IK'si var ama basma kilidi yok: yürürken ayaklar klipteki kadar kayabilir.
- Mağara Devi'nde dik yan eğimde aşağıdaki ayak 2 cm havada kalabiliyor (kalça alçalma sınırı); ayak tabanı eğime yatmıyor (ayrı bilek eklemi yok).
- Kartal evcilleştirme testi ara sıra başarısız oluyor (vahşi hayvan rastgeleliği).
- Arkadan gelen darbede katmanlı `Hit_Chest` klibi (önden vuruş klibi) yarı ağırlıkla yine geriye doğru oynar; yönlü savrulma bunu baskın şekilde öne çevirir ama ayrı bir "arkadan darbe" klibi yok.
- Önceki turların dalları `main`'e birleşmedi; birleştirme kullanıcının kararı. En güncel zincir: `ccr-70a30f22-rorf10` (Tur 2–7).
- Kahramanda yürüme ↔ koşu karışımında (≈1.2–4.6 m/sn) iki ayağın basışı biraz asimetrik. Bir ayak basışın sonunda (topuk kalkarken) erken bırakılabiliyor; ayakta kayma görünmüyor.

## Sonraki öncelikler
1. **Dalları birleştirme (kullanıcı kararı):** `ccr-70a30f22-rorf10` dalı Tur 2–7'yi içeriyor. `tidu6t` dalındaki ilerleme/kayıt sistemi (özellik 6) buraya taşınabilir; yeniden yazılmamalı.
2. Özellik 2'yi bitirmek: tilki, ejderha ve dev için basma kilidi (`FootIK._stance` mantığı `GLBCreature._footIK` ve `Biped._footIK` içine). Dört ayaklılarda dörtnal kilidi için aynı "gövde hızının yarısıyla süpürme" giriş ölçütü denenmeli. Bunlar bitince özellik 2 tamamlanmış sayılabilir.
3. Özellik 6: `tidu6t` dalındaki XP/seviye ve localStorage kaydını bu dala taşımak. Ardından görevler.
4. Özellik 7: kalite ayarı (gölge, piksel oranı), doku sıkıştırma (KTX2), uzak hayvanlarda güncelleme seyreltme. `analyzeGait` yüklemede ~8 karışım örnekliyor; mobilde süresi ölçülmeli.
5. Özellik 3: ejderha için uçuş (`fly2` klibinden kök hareketini ayıklayarak).
