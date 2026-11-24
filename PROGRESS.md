# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin kaydıdır. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, teslim: kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).
Oyunun ayrıntılı yol haritası ve oturum günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları) `yaban.html` + `src/`.

## Özellik listesi (öncelik sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — Kael (SDF heykel, ~21k üçgen, 58 kemik, pelerin kemikleri) oyunda. Kullanıcının istediği zırh yeniden tasarımı bekliyor. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — arazi ayak IK'sı + yürüyüş katmanı (`32-anim.js`), anahtar kareli saldırı klipleri (`33-clips.js`). Kalan: kaçınma/savunma/zıplama klipleri, kurt/goblin/NPC'lerde ayak IK'sı |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, saç GLB'si, elf gövdesi (kraliçe) bağlı; diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; geyik/kuş/iskelet/örümcek yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş konisi + uyarı yapay zekâsı var; Ay Kılıççısı'nda evcilleştirme yok (eski oyunda vardı) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, demirci, yetenekler); zindan/bölge genişletmesi bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen, 30 m dış çizgi sınırı; gerçek cihazda test edilemedi, grafik kalite ayarı yok |

## Tamamlanan (rutin çalıştırmaları)

### Çalıştırma 1 — 2026-11-24
- Kök `PROGRESS.md` oluşturuldu.
- Heykel hattı bu ortamda yeniden çalışır hale getirildi (`tools/sculpt` önbelleği `data/models.js`'ten çıkarıldı; böylece tek modeli yeniden inşa etmek diğerlerini değiştirmiyor).
- **Kahraman miğferi:** "yanan T-yarığı" önceden plakanın dış yüzüne boyanmış bir ışıma çıkartmasıydı ve köşe renk geçişi yüzünden yüzde kırmızı bir leke gibi görünüyordu. Çıkartma kaldırıldı; yarık biraz genişletildi ve arkasına, miğferin içine gömülü ayrı bir ışıyan çekirdek parçası (`eyes`) eklendi. Artık keskin, içeriden yanan bir T görünüyor; yarığın çevresindeki çelik temiz kalıyor. Öfke (berserk) nabzı aynı ışıma kanalını kullandığı için çalışmaya devam ediyor.
- Yeni yakın plan senaryosu: `ay-kiliccisi/test/s-helm.js`.

### Çalıştırma 2 — 2026-11-24 (dal `ccr-70a30f22-hnszuv`)
- **Birleştirme:** Önceki rutin çalıştırmaları her seferinde `main`'den yeni bir dal açmış ve hiçbiri birleştirilmemiş; bu yüzden aynı işler (ör. ayak IK'sı) birkaç kez yeniden yapılmış. Bu dala son iki çalıştırmanın işi birleştirildi: miğfer düzeltmesi (`ccr-70a30f22-3kejg0`) ve arazi ayak IK'sı + yürüyüş katmanı (`ccr-70a30f22-1d9vf7`, yeni `src/32-anim.js`).
- **Özellik 2 — anahtar kareli saldırı klipleri** (yeni `ay-kiliccisi/src/33-clips.js`):
  - Küçük bir klip sistemi: her kanal kendi anahtarları üzerinde monoton kübik Hermite eğrisiyle aranır (anahtarlar arasında taşma yok, uç noktalarda düz), bir anahtar yalnızca değişen kanalları tanımlayabilir.
  - Kahramanın 5 saldırısı iki noktalı `lerp` yerine 6–7 anahtarlı kliplerle oynatılıyor: önden savuruş, ters savuruş, tepeden bitirici, şarjlı ağır saldırı, koşu kesiği. Her birinde **hazırlık** (gövde hedeften uzağa burulur, bilek geri kırılır, ağırlık arkada; bitiricide parmak ucuna kalkıp kısa bir duraksama), **vuruş** (kalça → göğüs → kol → bilek sırasıyla açılır), **takip** (kılıç hedefi geçip öbür yana taşınır, kalça iner, ön diz yükü alır) ve **toparlanma** var. Baş, gövde dönerken hedefe bakmaya devam eder.
  - Zamanlama oyunun gerçek vuruş karelerine göre kuruldu (hafif u=.36, ağır u=.5, koşu u=.38): hasar verildiği anda kılıç kahramanın önünde. Önceki pozlarda kılıç vuruş anında hâlâ yolun ortasına gelmemişti; ağır saldırının sonu ise kılıcı kahramanın arkasına kadar savuruyordu (düzeltildi).
  - Testler: `mech-tests.js` bölüm 14, 4 yeni test (eğri sınırları/süreklilik, hafif saldırıda hazırlık–vuruş–takip yönleri, ağırlık aktarımı, ağır saldırı yörüngesi). Yeni ekran görüntüsü senaryosu `test/s-clips.js`.
  - Sonuçlar: mekanik 57/57, döngü 71/71, duruş 11/11, dokunmatik 7/7. Döngüdeki «Kırık Diş üç saldırı» testi bir kez başarısız oldu, tekrar çalıştırmada ve değişiklik öncesi sürümde geçti (rastlantıya bağlı, değişiklikle ilgisiz).

## Sıradaki öncelikler
0. **Önemli:** rutin dalları birleştirilmeden kalırsa her çalıştırma `main`'den sıfırlanır ve iş tekrarlanır. Bu dal (`ccr-70a30f22-hnszuv`) önceki iki çalıştırmayı da içeriyor; `main`'e birleştirilmesi önerilir. Henüz birleştirilmemiş başka iş: kahraman zırhı 1. geçiş (`ccr-70a30f22-tw1wm1`), köylü/kurt adım kilidi + ölümsüzler (`ccr-70a30f22-kw3pn0`).
1. Animasyon (özellik 2): kaçınma, savunma/savuşturma, zıplama saldırısı ve yetenekleri de klip sistemine taşımak; saldırılar arası geçişte (kombo) bir sonraki klibin hazırlığını öncekinin takibiyle harmanlamak; kurt/goblin/NPC ayak IK'sı.
2. Kahraman (özellik 1): `tw1wm1` zırh geçişini birleştirip miğferle uyumunu kontrol etmek; uzak LOD.
3. Hayvanlar (özellik 4): geyik/kuş gibi pasif yaban hayvanları, sonra zindan yaratıkları.
