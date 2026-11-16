# Yaban Yoldaşları — Benim İlk Oyunum

Tarayıcıda çalışan 3B (three.js) bir macera/evcilleştirme oyunu. Kurulum ve derleme gerekmez.

## Çalıştırma

```bash
python3 -m http.server 8765      # depo kökünde
# tarayıcıda: http://localhost:8765
```

GitHub Pages açılırsa (Settings → Pages → dal kökü) doğrudan internetten de oynanır. Telefon/tablette dokunmatik kontroller otomatik görünür.

## Kontroller

| Eylem | Tuş |
| --- | --- |
| Hareket / Koş | WASD / Shift |
| Zıpla / Çömel / Takla (kaçınma) | Boşluk / C / Q |
| Kılıç saldırısı (3'lü kombo) | Sol tık veya J |
| Topla · besle · evcilleştir | E (at ve yılanda basılı tut) |
| Seçili yiyeceği yem olarak bırak | G |
| Eşya seç / seçili yiyeceği ye | 1–9 / H |
| Yoldaşlar bekle ↔ takip et | T |
| Kamera | Fareyi sürükle, tekerlek |

## Türler ve evcilleştirme yöntemleri

| Tür | Bölge | Yöntem |
| --- | --- | --- |
| Tavşan | Çayır, orman | Çömelerek yaklaş, havuç ver |
| Geyik | Çayır, orman | Çömelerek yaklaş, 3 kez böğürtlen ver |
| At | Çayır, savan | Elma ver, sonra kıpırdamadan E basılı tutup sakinleştir |
| Tilki | Çayır, orman | Yere et/böğürtlen bırak, 7 m geri çekil (2 kez) |
| Kurt | Orman | Canını %35 altına düşür, et ver |
| Ayı | Orman | Saldırmadan yaklaş, 2 kez bal ver |
| Aslan | Savan | Canını %25 altına düşür, 2 kez et ver |
| Kaplan | Cengel | Çömelerek **arkasından** sokul, 2 kez et ver |
| Yılan | Cengel, göl | Yanında kıpırdamadan kaval çal (E basılı, 5 sn) |
| Timsah | Göl | Yakınına 3 kez balık bırak ve geri çekil |
| Kartal | Dağ etekleri | Açık alana et bırak, geri çekil, inmesini bekle (2 kez) |
| Gölge Pençe (fantastik) | Karanlık vadi | Canını %30 altına düşür, ay taşı sun |
| Ejderha | Dağın zirvesi | Canını %20 altına düşür, ejder mücevheri sun |
| Mağara Devi (fantastik) | Karanlık vadi | Evcilleştirilemez; ejder mücevheri düşürür |

Evcil yoldaşlar (en fazla 5) oyuncuyu takip eder, oyuncuya saldıranları ve oyuncunun vurduğu hedefleri algılayıp savaşır. Her yoldaşın canı ve açlığı vardır: açken zayıf vurur, açlık sıfırlanınca can kaybeder ve sonunda terk eder. Yanına gidip E ile beslenir (etçil: et/balık, otçul: havuç/böğürtlen/elma).

## İlerleme ve kayıt

- **Oyuncu seviyesi (1–30):** av öldürmek (türün canına göre), evcilleştirmek ve kaynak toplamak XP verir. Her seviye +12 can ve +%8 kılıç hasarı verir, seviye atlayınca can dolar. HUD'da mavi XP çubuğu.
- **Yoldaş seviyesi (1–20):** yoldaşlar vurdukları ve öldürdükleri düşmanlardan XP alır (oyuncunun yakınındaki yoldaşlar da oyuncunun avlarından pay alır). Her seviye türün temel canına ve hasarına +%10 ekler. Serbest bırakılan yoldaşın seviyesi sıfırlanır.
- **Görevler:** 14 görevlik bir zincir (evcilleştir, avla, topla, seviyeye ulaş, yoldaş sayısı/seviyesi; ilk görev tavşan, son görev ejderha). Aynı anda sıradaki 3 görev etkindir ve sol üstteki panelde ilerleme çubuğu ve ödülüyle görünür; biten görev XP ve eşya verir, yerine sıradaki gelir. Telefonda panel tek satırdır, başlığa dokununca açılır. Kod: `src/quests.js`.
- **Kayıt:** ilerleme tarayıcıda (localStorage) 20 saniyede bir, duraklatınca ve sekme kapanırken otomatik kaydedilir: konum, can, seviye/XP, envanter, yoldaşlar (tür, ad, seviye, açlık, can) ve görev durumu. Açılış ekranındaki **Yeni Oyun** kaydı siler. `?nosave` kaydı kapatır; test modunda (`?test`) kayıt yalnızca `?save` ile açılır.

## Modeller ve animasyonlar — neyin ne olduğu

| Varlık | Kaynak | İskelet / animasyon |
| --- | --- | --- |
| **Ejderha** | Gönderilen `tarisland_-_dragon_high_poly.glb` | Kendi iskeleti (156 kemik) ve kendi klipleri: `stand`, `walk`, `skill08` (saldırı), `attack01/02`, `die`. Görünüm ve dokular değiştirilmedi. |
| **Erkek kahraman** | VRoid `AvatarSample_C` (anime tarzı) | Kendi insan iskeleti; hareketler Quaternius *Universal Animation Library* kliplerinden oyun açılışında iskelete aktarılır (retarget): bekleme, yürüme, koşu, depar, zıplama (3 aşama), kılıç kombosu, çömelme, çömelerek yürüme, takla, ölüm, etkileşim. Geçişler crossfade ile bağlanır. Saç ve kumaş, modelin kendi VRM yay kemiği verisiyle (7 saç zinciri, paça kumaşı, 10 çarpıştırıcı grubu + eklenen uyluk küreleri) ikincil hareket yapar. Yüz, modelin VRM blendshape gruplarıyla canlanır (`src/face.js`): rastgele göz kırpma; saldırıda öfke ve bağırış, hasarda acı, ölümde kapalı gözler, evcilleştirince sevinç, bir hayvan saldırıya geçince şaşkınlık. Baş, boyun ve gözler 10 m içindeki ilgi çeken hayvana (önce tehdit, sonra etkileşim hedefi) döner; göz açıları VRM `lookAt` aralıklarına uyar. |
| **Tilki** | Khronos glTF örnek modeli | Kendi iskeleti (24 kemik), klipler: `Survey`, `Walk`, `Run`. Saldırı/yeme/ölüm klibi **yok**; bunlar gövde hareketiyle prosedürel tamamlanır. |
| Tavşan, geyik, at, kurt, ayı, aslan, kaplan, timsah, yılan, kartal, Gölge Pençe, Mağara Devi | Bu türler için **GLB dosyası gönderilmedi** | `src/creatures.js` içinde kodla kurulan eklemli (rigli) stilize modeller. Omuz/dirsek/bilek ve kalça/diz/topuk eklemleri ayrı ayrı döner; yürüyüş, dörtnal/sıçrama, saldırı, yeme, ölüm hareketleri eklem açılarından üretilir. |

### Bilinen sınırlar (dürüst durum)

- Gönderilen arşivde **yalnızca ejderha** vardı. Diğer 12 tür el yapımı sanatçı modeli değil, kodla üretilmiş düşük poligonlu modellerdir; görsel kaliteleri ejderha ve kahramanın altındadır. Bu türler için GLB gönderilirse aynı `GLBCreature` sınıfıyla (ejderha/tilki gibi) bağlanır.
- Ejderhanın `fly2` klibi sabit bir sinematik uçuş yolu içerdiği için oyunda kullanılmıyor; ejderha yerde yürür ve savaşır. Özgün 46 MB dosya, oyunda kullanılmayan 21 klip çıkarılarak 11 MB'a indirildi (`tools/build-assets.mjs`); ağ ve dokulara dokunulmadı, yalnızca malzeme tanımı three.js'in okuyabildiği PBR biçimine çevrildi.
- Kahramanda (`src/ik.js`) ve kodla kurulan dört ayaklılarda (`Quadruped._footIK`) eğimli arazi için ayak IK'si var; ikisinde de yürürken basan ayak zemine kilitlenir ve adım boyu hıza göre ayarlanır. Kahramanda yürüme/koşu/depar klipleri, yüklemede ölçülen yer hızlarına göre faz senkronlu karışır (`src/gait.js`). Tilki ve ejderha (kendi iskeletleriyle, `GLBCreature._footIK`) ve Mağara Devi'nde (`Biped._footIK`) de eğimde ayak IK'si ve yürürken basma kilidi var; tilki/ejderha kliplerinin oynatma hızı yüklemede ölçülen klip yer hızına göre, devin adım boyu ve kadansı gövde hızına göre ayarlanır. Yılan ve kartalda ayak IK'si gerekmiyor/yok. Kodla kurulan dört ayaklılar koşarken (dörtnal, tavşanda sıçrama) görev oranlı bir adım döngüsü kullanır: ayak basışın kısa bir bölümünde gövde hızıyla doğrusal geri süpürülür, gövde basışta çöker ve uçuşta yükselir; böylece koşuda da basan ayak kaymaz. Timsahın yürüyüşünde ve koşusunda, tilki ve ejderhanın koşusunda ayak kilidi hâlâ çoğu adımda erken bırakılır (timsahta güçlü gövde salınımı, tilki/ejderhada klipler o hızı karşılayacak adım boyunda değil).
- Kahramanın saç ve paça/etek kumaşı VRM yay kemikleriyle (`src/springbone.js`) sallanır. Dosyadaki kumaş ayarları sürtünmesiz olduğu için oyunda sürtünme, hafif yerçekimi ve açı sınırı eklendi; bu yüzden hareket VRoid/UniVRM'dekinden birebir aynı değildir. Ağız hareketi yalnızca bağırış/nefes için; konuşma (dudak senkronu) yok. Ata binme henüz yok.
- Depoda daha önce bir oyun ya da kız karakter bulunmuyordu (depo boştu); oyun sıfırdan kuruldu, kaldırılacak bir karakter yoktu.

## Test

- `test/model-viewer.html?m=wolf` — her modeli ve animasyonunu tek tek oynatır (kahramanda `&f=joy` ifade, `&look=1` kameraya bakış) (`m=hero`, `dragon`, `fox`, `rabbit`, `deer`, `horse`, `bear`, `lion`, `tiger`, `crocodile`, `snake`, `eagle`, `shadowbeast`, `ogre`).
- `node test/run-tests.mjs` (Playwright gerekir, sunucu açıkken) — 133 oynanış testi: oyuncu animasyon durumları, kahramanda hız–adım eşlemesi ve ayak kilidi, saç/kumaş yay kemikleri, yüz ifadeleri ve bakış, eğimde ayak IK'si (kahraman, dört ayaklılar, tilki, ejderha, Mağara Devi), dört ayaklılarda (yürüme ve dörtnal), tilki, ejderha ve Mağara Devi'nde ayak kilidi, darbe tepkisi, her türün evcilleştirme yöntemi, 5 yoldaş sınırı, takip, koruma/savaş, açlık, besleme, ölüm/yeniden doğma, ganimet, toplama, XP/seviye, yoldaş seviyesi, kayıt/yükleme, görevler.

## Geliştirme planı

1. **Tamamlandı:** dünya ve bölgeler, erkek kahraman + animasyonlar, 14 tür, yapay zekâ, türe özgü evcilleştirme, yoldaş sistemi (takip/savaş/açlık/can), envanter ve toplama, dokunmatik kontroller, testler.
2. **Sıradaki:** gönderilecek yeni GLB'lerle prosedürel türlerin değiştirilmesi, ejderha için uçuş, ata binme.
3. **Sonra:** gece/gündüz, ses. (Kayıt, seviye ve görev sistemi eklendi.)

Lisanslar ve atıflar: [CREDITS.md](CREDITS.md)
