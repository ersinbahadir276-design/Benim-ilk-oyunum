# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme turlarının özetidir. Ayrıntılı yol haritası ve oturum günlüğü:
`ay-kiliccisi/PROGRESS.md` (oyunun kendisi `ay-kiliccisi/`, yayın kopyası kök `index.html`).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Sürüyor**: SDF heykel modeli var (~21k üçgen, 58 kemik). Zırh yeniden tasarımı 1. geçiş yapıldı (tur 1). |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (bu listede): tüm pozlar kodla; anahtar kareli klip + harmanlama sistemi yok. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Büyük ölçüde: ejderha, elf gövdesi (kraliçe), saç GLB, şövalye heykeli oyunda; diğerlerinden yalnızca iskelet oranları alındı (lisans/iskelet yok). Yeni gönderim bekleniyor. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha. Zindan yaratıkları (iskelet, örümcek, golem, hortlak) yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: görüş/uyarı yapay zekâsı, Veyra yoldaş yapay zekâsı, kurt besleme. Tam evcilleştirme döngüsü bu oyunda yok (eski `yaban.html` oyununda vardı). |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde: 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, ganimet, demirci, seviye. Dünya genişletme (liman, kasaba, zindan) bekliyor. |
| 7 | Android performansı ve mobil kontroller | Kısmen: PlayStation düzenli dokunmatik düğmeler, yazılımsal WebGL ile perf testi. Gerçek cihazda ölçülmedi; HUD düzenleyici yok. |

Hiçbiri henüz "tamamlandı" olarak işaretlenmedi.

## Tamamlananlar

- (henüz tam biten özellik yok)

## Tur günlüğü

### Tur 1 — 2026-11-26 · Özellik 1: kahraman zırhı, 1. geçiş
`ay-kiliccisi/tools/sculpt/models/hero.mjs` → `data/models.js` → `dist/` + kök `index.html`.
- **Göğüste hilal arması** (Ay Kılıççısı'nın işareti): plakanın 7,5 mm üstünde bronz hilal + gümüş yıldız perçin.
- **Plackart**: kemerden yukarı sivrilen ikinci göğüs plakası, bronz kenarlı; bel lamlarının önünü kapatıyor,
  Spine↔Hips arası yumuşak ağırlıkla bükülüyor (koşarken kırılma yok).
- **Miğfer**: yarık daraltıldı, ateş artık yarığın *içinde* (dış dudak koyu çelik kalıyor, yarığın arkasında
  ayrı közlü plaka); 5 mm vokselde tırtıklı görünen nefes delikleri kaldırıldı, gagaya bronz omurga şeridi eklendi.
- **Kürk yaka**: yüksek frekanslı gürültü azaltıldı (diken diken kırık üçgenler yerine yumuşak tutamlar).
- Model 20 738 üçgen / 9 625 köşe (önce 20 996 / 9 849); diğer 15 modelin önbelleği `data/models.js`'den
  birebir çıkarıldı, yalnızca kahraman yeniden üretildi.
- Testler: `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-hero` ekran görüntüleri hatasız.

## Sıradaki öncelikler

1. **Kahraman zırhı 2. geçiş**: omuzluklar ve bel lamları hâlâ "lastik halka" gibi kalın ve yuvarlak →
   daha ince, kademeli, kenarı kıvrık plakalar; üst kol hacmi azaltılmalı; miğfer silueti (gaga) daha keskin.
   Opsiyonel: miğfersiz yüz (hikâye sahneleri için).
2. Sonra özellik 2: kahramana anahtar kareli klip sistemi (duruşa özgü saldırı pozları, harmanlama, ayak IK).
