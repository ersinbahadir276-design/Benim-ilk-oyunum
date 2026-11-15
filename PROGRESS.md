# PROGRESS — Yaban Yoldaşları

Her planlı çalıştırmada güncellenir. Bir özellik yalnızca gerçekten bittiğinde "Tamamlandı" sayılır.

## Özellik durumu

| # | Özellik | Durum | Not |
|---|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde tamam** | VRoid anime avatarı + toon malzeme + kılıç; saç ve ceket eteği fiziği (2026-11-15). Eksik: yüz ifadeleri / göz kırpma (VRM blendshape), bacak çarpışma küreleri. |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen | Kahraman: 17 klip, çalışma anında retarget + crossfade. Eksik: ayak IK (prosedürel hayvanlar ve kahraman), koşu kliplerinde kalça ~25 cm zıplıyor (retarget ölçeği incelenmeli). |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen | Yalnızca ejderha gönderildi ve bağlandı (`GLBCreature`). Yeni GLB gelince aynı yol kullanılacak. |
| 4 | Birden çok hayvan ve yaratık | Tamam (stilize) | 14 tür; 12'si kodla üretilmiş düşük poligon modeller. |
| 5 | Evcilleştirme ve yapay zekâ | Tamam | Türe özgü yöntemler, en fazla 5 yoldaş, takip/savaş/açlık. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Kısmen | Dünya/bölgeler, 3'lü kombo, envanter var. **İlerleme (XP/seviye) ve kayıt sistemi yok.** |
| 7 | Android performansı ve mobil kontroller | Kısmen | Dokunmatik kontroller var. Performans profili / kalite ayarı yapılmadı. |

## Çalıştırma günlüğü

### 2026-11-15 — Kahraman: VRM yay kemiği (saç + ceket eteği) fiziği
- Yeni `src/springbones.js`: VRM 0.x `secondaryAnimation` verisini (8 grup, 34 eklem, 10 çarpışma grubu) okuyan Verlet yay kemiği çözücüsü (UniVRM algoritması; Unity→glTF z dönüşümü).
- `src/hero.js` modelin VRM verisinden fiziği kurar; `src/player.js` her karede mikser + kök dönüşümünden sonra günceller; ışınlanma/yeniden doğmada zincir sıfırlanır.
- Oyun ayarları (ölçümle seçildi): ilk deneme saçı/eteği depar sırasında ~3 rad ters çeviriyordu. Nedenler ve çözümler:
  - Alt adımlama aynı poza baktığı için sahte atalet üretiyordu → UniVRM gibi kare başına tek adım.
  - Retarget edilmiş koşu klipleri kalçayı ~25 cm zıplatıyor → atalet merkezi kalça kemiği (hareketinin %90'ı telafi edilir), sertlik ×2.
  - Ceket eteği kemikleri modelde **baldıra** bağlı ve çarpışma küresi yok → giysi zincirlerinde sertlik ×5, sürükleme ≥0.35.
  - Sonuç: depar + 180° dönüşte saç en çok ~0.9 rad, etek ~1.5 rad; durunca 0.02 rad'a oturur. Durgun poz modelin özgün pozuyla aynı (ekran görüntüsüyle karşılaştırıldı).
- Testler: 4 yeni oynanış testi (yükleme, savrulma alt/üst sınırı, kararlılık/NaN, ışınlanma sıfırlaması) → 55/55. `test/run-tests.mjs` içindeki `waitForFunction` zaman aşımı yanlış parametreye veriliyordu (30 sn'de kesiliyordu), düzeltildi. Model görüntüleyicide `&nospring` seçeneği.
- Bilinen: 9 test çalıştırmasından birinde nedeni yakalanamayan 2 başarısızlık görüldü (sonraki 8 çalıştırma temiz; değişiklik öncesi kod 4/4 temiz). İzlenmeli.

## Sıradaki öncelikler
1. Kahraman: VRM blendshape ile göz kırpma ve basit yüz ifadeleri (saldırı/hasar/evcilleştirme anında) — özellik 1'i kapatır.
2. Animasyon: koşu kliplerindeki kalça zıplamasının retarget ölçeğini düzelt; kahraman için basit ayak–zemin IK'si.
3. İlerleme sistemi: XP/seviye, yoldaş seviyeleri ve `localStorage` kaydı (özellik 6).
4. Mobil: kalite ön ayarları (gölge çözünürlüğü, piksel oranı, uzak nesne seyreltme), FPS ölçümü.
5. Test kararsızlığını yakala: başarısız testlerin adını CI benzeri tekrar döngüsünde kaydet.
