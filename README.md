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
- Kahramanda (`src/ik.js`) ve kodla kurulan dört ayaklılarda (`Quadruped._footIK`) eğimli arazi için ayak IK'si var; dört ayaklılarda yürürken basan ayak zemine kilitlenir ve adım boyu hıza göre ayarlanır. Tilki ve ejderha (GLB), yılan, kartal ve Mağara Devi'nde ayak IK'si henüz yok; dörtnalda (koşu) ayak kilidi çoğu adımda erken bırakılır.
- Kahramanın saç ve paça/etek kumaşı VRM yay kemikleriyle (`src/springbone.js`) sallanır. Dosyadaki kumaş ayarları sürtünmesiz olduğu için oyunda sürtünme, hafif yerçekimi ve açı sınırı eklendi; bu yüzden hareket VRoid/UniVRM'dekinden birebir aynı değildir. Ağız hareketi yalnızca bağırış/nefes için; konuşma (dudak senkronu) yok. Ata binme ve kayıt (save) sistemi henüz yok.
- Depoda daha önce bir oyun ya da kız karakter bulunmuyordu (depo boştu); oyun sıfırdan kuruldu, kaldırılacak bir karakter yoktu.

## Test

- `test/model-viewer.html?m=wolf` — her modeli ve animasyonunu tek tek oynatır (kahramanda `&f=joy` ifade, `&look=1` kameraya bakış) (`m=hero`, `dragon`, `fox`, `rabbit`, `deer`, `horse`, `bear`, `lion`, `tiger`, `crocodile`, `snake`, `eagle`, `shadowbeast`, `ogre`).
- `node test/run-tests.mjs` (Playwright gerekir, sunucu açıkken) — 83 oynanış testi: oyuncu animasyon durumları, saç/kumaş yay kemikleri, yüz ifadeleri ve bakış, eğimde ayak IK'si (kahraman ve dört ayaklılar), dört ayaklılarda ayak kilidi, darbe tepkisi, her türün evcilleştirme yöntemi, 5 yoldaş sınırı, takip, koruma/savaş, açlık, besleme, ölüm/yeniden doğma, ganimet, toplama.

## Geliştirme planı

1. **Tamamlandı:** dünya ve bölgeler, erkek kahraman + animasyonlar, 14 tür, yapay zekâ, türe özgü evcilleştirme, yoldaş sistemi (takip/savaş/açlık/can), envanter ve toplama, dokunmatik kontroller, testler.
2. **Sıradaki:** gönderilecek yeni GLB'lerle prosedürel türlerin değiştirilmesi, ejderha için uçuş, ata binme.
3. **Sonra:** kayıt sistemi, görevler, gece/gündüz, ses.

Lisanslar ve atıflar: [CREDITS.md](CREDITS.md)
