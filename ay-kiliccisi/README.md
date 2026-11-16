# Ay Kılıççısı – Karanlık Fantezi

Telefon tarayıcısında oynanan 3D karanlık fantezi RPG. Teslim edilen oyun **tek bir HTML dosyasıdır**
(`dist/ay-kiliccisi.html`, ~4,8 MB). Hiçbir dış kütüphane ya da sunucu dosyası indirmez: kendi WebGL
motoru, modeller, dokular ve sesler dosyanın içindedir.

Oynamak için: claude.ai'deki "Ay Kılıççısı – Karanlık Fantezi" sayfasını aç. Bu klasör o sayfanın
kaynak kodudur.

## Kontroller (dokunmatik)

| Düğme | Ne yapar |
| --- | --- |
| Sol yarı | Sanal joystick (dokunduğun yerde açılır) |
| Sağ yarıda sürükle | Kamerayı döndür |
| SALDIR | Dokun: hafif saldırı (3'lü kombo). Basılı tut: ağır saldırı yüklenir, bırakınca vurur. Koşarken: koşu saldırısı. Havadayken: zıplama saldırısı |
| BLOK | Basılı tut: kılıçla savun. Hasar candan değil savunma canından düşer. Düşman vuracağı anda basarsan savuşturma |
| KAÇIN | Joystick yönüne göre öne takla, arkaya sıçrama, sağa ya da sola yuvarlanma. Kısa dokunulmazlık verir |
| ZIPLA | Zıpla. Fark edilmemiş bir kurt ya da küçük goblinin arkasındayken iki kez bas: üstüne atla |
| ETKİLEŞ | Konuş, kurt besle, fark edilmemiş küçük gobline arkadan boyun kilidi |
| EĞİL | Gizlen (görülme mesafesi yarıya iner) |
| KOŞ | Basılı tutarak koş. Dayanıklılık bitince kendiliğinden yürüyüşe geçer |
| SİSTEM | Durum penceresi, statlar, görevler, harita, model lisansları |

## Yapı

```
src/        oyunun kaynağı (numara sırasıyla tek dosyada birleşir)
  00-head.html        HTML + CSS + arayüz
  10-engine.js        WebGL motoru (kemikli tek çizim karakterler, yükseklik haritalı çimen)
  20-world.js         2800 × 2800 m harita, bölgeler, su, akışlı orman, köy, kale, kamplar, harabeler
  25-perception.js    görüş konisi + engel + uyarı yayılması
  30-player-model.js  Selene modeli, kılıç, poz, kol IK'sı
  40-wolves.js        kurtlar
  45-rig.js           goblin / köylü / muhafız / tüccar / timsah modelleri
  46-goblins.js  47-npcs.js  48-croc.js  49-dragon.js
  50-system.js        Sistem penceresi, görevler, kayıt
  55-player.js        dövüş, dayanıklılık, blok, ragdoll, sessiz alt etmeler
  60-game.js          kamera, efektler, işaretler, radar, girdi, döngü
data/       gömülü modeller (Selene, şövalye heykeli, ejderha)
tools/      build.py (birleştirme), dragon/ (ejderha GLB dönüştürme betikleri)
test/       otomatik testler (Playwright)
```

Derleme (bilgisayarda): `python3 tools/build.py` → `dist/ay-kiliccisi.html`.
Testler: `node test/harness.js test/s-mech.js` (47 mekanik testi), `test/s-ui.js` (dokunmatik düğmeler,
kayıt), `test/s-shots.js` ve `test/s-close.js` (ekran görüntüleri).

## Modeller ve lisanslar

- **Selene**: «Anime 001», Element (VRoid). Kullanıcının eklediği model. Kıyafet, saç ve kılıç oyunda kodla uyarlandı.
- **Ejderha**: «Tarisland - Dragon (High Poly)», Doctor A. (Sketchfab), CC BY 4.0. Kullanıcının eklediği model;
  10 bin köşeye sadeleştirildi, 9 klip kullanılıyor. Tasarım Tarisland oyununa ait olduğu için herkese açık yayından
  önce kullanım hakkı ayrıca doğrulanmalı.
- **Meydan heykeli**: «The Forgotten Knight», dark_igorek, CC BY 4.0, sadeleştirildi.
- Kurtlar, goblinler, köylüler, tüccarlar, muhafızlar, timsahlar, dünya ve sesler: bu oyun için kodla üretildi.
