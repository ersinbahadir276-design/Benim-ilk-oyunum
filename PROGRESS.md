# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin takip listesidir. Her çalışmada okunur ve güncellenir.
Ana oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı teknik günlük ve yol haritası: `ay-kiliccisi/PROGRESS.md`. Eski oyun: `yaban.html` + `src/`.

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Model: `cd ay-kiliccisi/tools/sculpt && npm install`, `cache/` boşsa önce `data/models.js` içinden doldur
(aksi halde `build.mjs` yalnızca yeniden yapılan modeli yazar, diğerleri silinir — bkz. 1. çalışma notu).
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<s-mech|s-loop|s-stance|s-ui|s-perf>.js`

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **devam ediyor**: model var; miğfer yenilendi, göğüs amblemi eklendi (1. çalışma) |
| 2 | Gerçekçi 3B karakter animasyonları | başlanmadı (rutin) — oyunda prosedürel pozlar var |
| 3 | Gönderilen GLB modellerin entegrasyonu | kısmen (önceki oturumlar: ejderha, saç, elf iskeleti) |
| 4 | Çok sayıda hayvan ve yaratık | kısmen (kurt, goblin, timsah, ejderha) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | kısmen (eski oyun `yaban.html`; Ay Kılıççısı'nda kurt besleme) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | büyük ölçüde var (bkz. `ay-kiliccisi/PROGRESS.md`) |
| 7 | Android performansı ve mobil kontroller | kısmen (dokunmatik düzen var; gerçek cihazda test edilmedi) |

## Tamamlananlar

_(Henüz rutinin listesindeki hiçbir özellik tamamen bitmiş sayılmadı.)_

## Çalışma günlüğü

### 1. çalışma — 2026-11-23
Özellik 1 (kahraman). Miğferin kalitesi düşüktü: 13 mm'lik göz yarığı 5 mm voksel ızgarasında eriyip
büyük turuncu bir bloğa dönüşüyordu, alın şeridi vizörün önünde yüzen bir bronz top gibi duruyordu,
ince nefes delikleri tırtıklı siyah gürültüye dönüşüyordu.
- `tools/sculpt/models/hero.mjs`: T-yarığı ızgaraya uygun genişlikte; yarık ve deliklerin içi koyu «boşluk»
  malzemesi; içeride iki yanan göz (ayrı ışıyan parça); yüzeyi izleyen bronz alın şeridi + burun sırtı;
  ince panjurlar yerine 8 yuvarlak nefes deliği.
- Göğüs zırhına kabartma bronz **hilal amblemi** (Ay Kılıççısı'nın işareti) ve yıldız perçin.
- Model yeniden heykellendi (20 932 üçgen, öncekiyle aynı bütçe), `data/models.js`, `dist`, kök `index.html` güncellendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-perf hatasız (köy: 2,2 ms çizim hazırlığı, 120 çağrı).

## Sıradaki öncelikler
1. Kahraman (devam): kürk yakanın tırtıklı görünümü (gürültü genliği voksel boyuna göre fazla), göğüs oyma
   çizgileri görünmüyor (5 mm oluk < ızgara), uyluk/diz arasındaki boşluk; kullanıcının istediği «zırhı yeniden
   tasarla» için onay/referans gerekiyor — miğfersiz yüz (hikâye sahneleri için) düşünülebilir.
2. Animasyonlar: yürüme/koşu döngüsüne ağırlık aktarımı, dönüşte gövde eğimi, iniş sönümü.
3. Yaratıklar: `ay-kiliccisi/PROGRESS.md` aşama 3 — iskelet/hortlak gece yaratıkları, Ak Kurt.
