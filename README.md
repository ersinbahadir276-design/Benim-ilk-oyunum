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

## İlerleme ve kayıt

- **Oyuncu seviyesi (1–20):** av/düşman öldürmek (canına göre XP), evcilleştirmek (büyük XP) ve kaynak toplamak (+2 XP) deneyim kazandırır. Her seviye +12 can ve kılıç hasarına +%8 ekler; seviye atlayınca can dolar.
- **Yoldaş seviyesi (1–10):** yoldaş kendi öldürdüğü hayvandan tam XP alır (oyuncu yarısını), oyuncunun öldürdüklerinden 20 m içindeki yoldaşlar %30 pay alır. Her seviye +%10 can, +%8 hasar. Serbest bırakılan yoldaş yabani istatistiklerine döner.
- **Kayıt:** oyun tarayıcıya (localStorage) 20 saniyede bir, duraklatınca ve sekme kapanırken otomatik kaydedilir: seviye/XP, can, konum, envanter, yoldaşlar (tür, ad, seviye, açlık, can). Açılışta *Devam Et* kaydı yükler, *Yeni Oyun* siler. `?nosave` kaydı kapatır.

Evcil yoldaşlar (en fazla 5) oyuncuyu takip eder, oyuncuya saldıranları ve oyuncunun vurduğu hedefleri algılayıp savaşır. Her yoldaşın canı ve açlığı vardır: açken zayıf vurur, açlık sıfırlanınca can kaybeder ve sonunda terk eder. Yanına gidip E ile beslenir (etçil: et/balık, otçul: havuç/böğürtlen/elma).

## Modeller ve animasyonlar — neyin ne olduğu

| Varlık | Kaynak | İskelet / animasyon |
| --- | --- | --- |
| **Ejderha** | Gönderilen `tarisland_-_dragon_high_poly.glb` | Kendi iskeleti (156 kemik) ve kendi klipleri: `stand`, `walk`, `skill08` (saldırı), `attack01/02`, `die`. Görünüm ve dokular değiştirilmedi. |
| **Erkek kahraman** | VRoid `AvatarSample_C` (anime tarzı) | Kendi insan iskeleti; hareketler Quaternius *Universal Animation Library* kliplerinden oyun açılışında iskelete aktarılır (retarget): bekleme, yürüme, koşu, depar, zıplama (3 aşama), kılıç kombosu, çömelme, çömelerek yürüme, takla, ölüm, etkileşim. Geçişler crossfade ile bağlanır. |
| **Tilki** | Khronos glTF örnek modeli | Kendi iskeleti (24 kemik), klipler: `Survey`, `Walk`, `Run`. Saldırı/yeme/ölüm klibi **yok**; bunlar gövde hareketiyle prosedürel tamamlanır. |
| Tavşan, geyik, at, kurt, ayı, aslan, kaplan, timsah, yılan, kartal, Gölge Pençe, Mağara Devi | Bu türler için **GLB dosyası gönderilmedi** | `src/creatures.js` içinde kodla kurulan eklemli (rigli) stilize modeller. Omuz/dirsek/bilek ve kalça/diz/topuk eklemleri ayrı ayrı döner; yürüyüş, dörtnal/sıçrama, saldırı, yeme, ölüm hareketleri eklem açılarından üretilir. |

### Bilinen sınırlar (dürüst durum)

- Gönderilen arşivde **yalnızca ejderha** vardı. Diğer 12 tür el yapımı sanatçı modeli değil, kodla üretilmiş düşük poligonlu modellerdir; görsel kaliteleri ejderha ve kahramanın altındadır. Bu türler için GLB gönderilirse aynı `GLBCreature` sınıfıyla (ejderha/tilki gibi) bağlanır.
- Ejderhanın `fly2` klibi sabit bir sinematik uçuş yolu içerdiği için oyunda kullanılmıyor; ejderha yerde yürür ve savaşır. Özgün 46 MB dosya, oyunda kullanılmayan 21 klip çıkarılarak 11 MB'a indirildi (`tools/build-assets.mjs`); ağ ve dokulara dokunulmadı, yalnızca malzeme tanımı three.js'in okuyabildiği PBR biçimine çevrildi.
- Prosedürel hayvanlarda ayak–zemin kilidi (IK) yok; hızlı dönüşlerde ayaklar hafif kayabilir.
- Kahramanın saç/giysi fiziği (VRM yay kemikleri) çalışmıyor; ata binme henüz yok.
- Depoda daha önce bir oyun ya da kız karakter bulunmuyordu (depo boştu); oyun sıfırdan kuruldu, kaldırılacak bir karakter yoktu.

## Test

- `test/model-viewer.html?m=wolf` — her modeli ve animasyonunu tek tek oynatır (`m=hero`, `dragon`, `fox`, `rabbit`, `deer`, `horse`, `bear`, `lion`, `tiger`, `crocodile`, `snake`, `eagle`, `shadowbeast`, `ogre`).
- `node test/run-tests.mjs` (Playwright gerekir, sunucu açıkken) — 65 oynanış testi: oyuncu animasyon durumları, her türün evcilleştirme yöntemi, 5 yoldaş sınırı, takip, koruma/savaş, açlık, besleme, ölüm/yeniden doğma, ganimet, toplama, XP/seviye, yoldaş seviyesi, kayıt/yükleme.

## Geliştirme planı

1. **Tamamlandı:** dünya ve bölgeler, erkek kahraman + animasyonlar, 14 tür, yapay zekâ, türe özgü evcilleştirme, yoldaş sistemi (takip/savaş/açlık/can), envanter ve toplama, dokunmatik kontroller, XP/seviye ilerlemesi, otomatik kayıt, testler.
2. **Sıradaki:** gönderilecek yeni GLB'lerle prosedürel türlerin değiştirilmesi, ejderha için uçuş, ata binme.
3. **Sonra:** görevler, gece/gündüz, ses, Android performans ayarları.

Lisanslar ve atıflar: [CREDITS.md](CREDITS.md)
