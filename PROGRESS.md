# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış görevin her turda okuduğu özet listedir. Ayrıntılı oyun günlüğü:
`ay-kiliccisi/PROGRESS.md` (asıl oyun, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

## Özellik listesi (öncelik sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor**: SDF heykel modeli var (~21,5k üçgen, 58 kemik); zırh yeniden tasarımı parça parça sürüyor |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı: tüm pozlar kodla; anahtar kareli klip + harmanlama sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha, elf gövdesi (Kraliçe), saç GLB'si, iskelet oranları oyunda; Kawaiope / wolf_puppy iskeletlerine geçiş bekliyor |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem/hortlak yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: görüş/uyarı yapay zekâsı, kurt besleme, Veyra yoldaş; Ay Kılıççısı'nda evcil yaratık sistemi yok (eski oyun yaban.html'de var) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var: 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/ekipman/demirci; zindan, lonca, bölge genişletme bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PS düzeni, dikey/yatay yerleşim, 30 m dış çizgi sınırı; gerçek cihaz testi ve HUD düzenleyici yok |

## Tamamlananlar
- (Henüz listeden tamamen biten özellik yok. Önceki oturumların işi için `ay-kiliccisi/PROGRESS.md`.)

## Tur günlüğü

### Tur 1 — 2026-11-24 (özellik 1: kahraman)
- Bacak zırhı yeniden tasarlandı (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
  - Baldırlık artık düz koni değil: arkada baldır kası, önde kaval kemiği şişkinliği; iki yanda menteşe yarığı + 3'er perçin.
  - Ayak bileğinde bronz, dışa açılan kenar bandı; üst bant gövdeye oturtuldu.
  - Uyluk zırhına dize doğru inen 2 eklemli plaka (diz bükülünce alt kemiğe yarı ağırlıklı) + üstte bronz kenar.
  - Demir ayakkabıya burun sırtı.
- Model yeniden heykellendi: 21 496 üçgen / 10 156 köşe (önce 20 996). `data/models.js`'te yalnızca kahraman satırı değişti.
- Önbellek boşken `build.mjs <ad>` diğer modelleri siliyordu; önce `data/models.js`'ten `tools/sculpt/cache/` dolduruldu (aşağıdaki not).
- Oyun yeniden derlendi, kök `index.html` güncellendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-save 1/1, s-ui 7/7. s-ui ilk çalıştırmada 5/7 verdi (zamanlamaya bağlı, değişiklik öncesi sürüm de aynı testte düştü), iki tekrar 7/7.

## Sonraki öncelikler
1. Kahraman (özellik 1), sırada: eldivenler (şu an eldiven gibi tek parça → parmak eklemli plakalar), üst kol (şişkin; kol plakaları + dirsek kanadı),
   arka bacak/diz arkası, oyun içi yakın çekim ekran görüntüsüyle kontrol. Sonra kask/yüz seçenekleri.
2. Özellik 1 bitince: özellik 2, kahraman için anahtar kareli animasyon klibi sistemi (boşta, yürüme, koşma, saldırı) + harmanlama.

## Notlar
- Heykel derlemesi: `cd ay-kiliccisi/tools/sculpt && npm install`, sonra
  `node --max-old-space-size=6000 tools/sculpt/build.mjs hero` (~75 sn). **Önbellek (`cache/`, git'te yok) boşsa önce doldur**:
  `node -e "const fs=require('fs'),z=require('zlib');const M=new Function(fs.readFileSync('data/models.js','utf8')+';return MODELS')();for(const k in M)fs.writeFileSync('tools/sculpt/cache/'+k+'.bin',z.gunzipSync(Buffer.from(M[k],'base64')))"`
  (`ay-kiliccisi/` içinde, `mkdir -p tools/sculpt/cache` sonrası).
- İnceleme: `NODE_PATH=$(npm root -g) node test/view.js hero <çıktı>`; derleme `python3 tools/build.py`, sonra `cp dist/ay-kiliccisi.html ../index.html`.
