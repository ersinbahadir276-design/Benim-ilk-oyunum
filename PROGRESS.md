# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya, her çalıştırmada bir özelliği ilerleten zamanlanmış görevin takip dosyasıdır.
Aktif oyun **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, sitede `index.html`). Ayrıntılı tasarım notları,
yol haritası ve oturum günlüğü: [`ay-kiliccisi/PROGRESS.md`](ay-kiliccisi/PROGRESS.md).
Eski oyun «Yaban Yoldaşları» `yaban.html` + `src/` altında duruyor, artık geliştirilmiyor.

## Tamamlananlar
_(Bir özellik ancak gerçekten bittiğinde buraya taşınır.)_

- (henüz hiçbiri tam bitmedi; aşağıdaki durumlara bakın)

## Özellik listesi — durum

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **sürüyor** | Kael heykel modeli var (58 kemik, ~22k üçgen). Zırh yeniden tasarımı 1. geçiş yapıldı (gövde + bacaklar). Kalan: miğfer, omuzluk/kol, pelerin, yakın plan doku. |
| 2 | Gerçekçi 3B karakter animasyonları | sürüyor | Eklem tabanlı animasyonlar, 4 duruş, kaçınma, suikast var. Kalan: duruşa özgü pozlar (hamle/saplama), kombo bitirici efektleri, yönlü saldırı. |
| 3 | Gönderilen GLB modellerinin entegrasyonu | kısmen | Ejderha GLB, saç GLB, elf (Şeytan Kraliçe) oyunda. Diğer GLB'lerden yalnızca iskelet oranları alındı (lisans/iskelet tablosu ay-kiliccisi/PROGRESS.md). |
| 4 | Çok sayıda hayvan ve yaratık | kısmen | Kurt, goblin, büyük goblin, okçu, timsah, ejderha, Kül Yele, Kırık Diş. Kalan: iskelet, örümcek, golem, hortlak, Ak Kurt. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | kısmen | Görüş/duyma algısı, sürü uyarısı, Veyra yoldaş yapay zekâsı var. Ay Kılıççısı'nda evcilleştirme yok (eski oyunda vardı). |
| 6 | Açık dünya, savaş, envanter, ilerleme | büyük ölçüde | 2,8 km harita, 10 bölge, ganimet/nadirlik, 7 sekmeli sistem penceresi, seviye/stat, demirci, sunaklar, kayıt. Kalan: DÜNYA DİREKTİFİ (liman, kasaba, lonca, zindanlar). |
| 7 | Android performansı ve mobil kontroller | kısmen | PlayStation düzeninde dokunmatik düğmeler, dikey/yatay yerleşim, uzak dış çizgi kesimi. Gerçek cihazda test edilemedi. |

## Çalıştırma günlüğü

### 2026-11-24 — Özellik 1: kahraman zırhı, yeniden tasarım 1. geçiş
- Göğüs zırhı: ortada kabartma **hilal ay** amblemi (oyunun adı Ay Kılıççısı), göğüs kası hattında oyma çizgiler,
  üst kenarı sivri ve bronz şeritli ayrı **karın plakası** (plackart).
- Bel lamları beline doğru daralıyor, önde V'ye iniyor; kalça plakaları (tasset) daha dar, dışa açılan ve dış kenarı aşağı sarkan biçimde.
- Uyluk zırhı (cuisse) artık silindir değil: ön uyluk kası şişkinliği, yüzeyi izleyen orta sırt, diz üstünde eklemli lam.
- Baldır zırhı (greave): arkada baldır kası, inciğin önünde sırt, bilekte bronz bant.
- Sculpt hattına `tools/sculpt/seed_cache.mjs` eklendi: `data/models.js`'i önbelleğe açar, böylece tek model
  yeniden üretilince diğerleri (kaynağı olmayan `king` dahil) birebir aynı kalır (14 model doğrulandı).
- Testler: s-mech 47/47, s-loop 71/71, s-hero ekran görüntüleri, s-perf (çizim hazırlığı ≤ 1,6 ms) — hata yok.

## Sıradaki öncelikler
1. Özellik 1 devam: miğfer (daha net vizör, alın/yanak plakaları), omuzluk ve kol zırhı (şişkin "balon" omuzluk yerine katmanlı, kenarı kıvrık), pelerin yırtıkları.
2. Özellik 1 bitince: Özellik 2 — duruşa özgü saldırı pozları ve kombo bitirici efektleri.
3. Kahramanın uzak mesafe LOD modeli (Özellik 7 ile birlikte).
