# PROGRESS — zamanlanmış geliştirme çalıştırmaları

Bu dosya zamanlanmış görevin özellik listesini izler. Oyunun ayrıntılı günlüğü ve yol haritası:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı, `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — SDF heykel modeli oyunda; zırh yeniden tasarımı başladı (çalıştırma 1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — tüm hareketler kodla üretilen pozlar; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, Şeytan Kraliçe (elf gövdesi + saç GLB); diğer GLB'lerden yalnızca iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (okçu, büyük), timsah, ejderha; zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/duyma yapay zekâsı, Veyra yoldaşı; Ay Kılıççısı'nda evcilleştirme yok (eski oyun `yaban.html`'de var) |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var — ayrıntı `ay-kiliccisi/PROGRESS.md` |
| 7 | Android performansı ve mobil kontroller | Kısmen — PS düzenli dokunmatik düğmeler; gerçek cihazda test edilmedi |

## Tamamlananlar
- (henüz listede tamamen bitmiş özellik yok)

## Çalıştırma günlüğü

### Çalıştırma 1 — 2026-11-17 (özellik 1: kahraman zırhı)
- `tools/sculpt/models/hero.mjs`:
  - Göğüs zırhına kabartma bronz **hilal ay arması** (oyunun adı: Ay Kılıççısı).
  - **Bel zırhları (tasset):** kutu gibi geniş halkalar yerine uyluğu izleyen, aşağı doğru açılan,
    kalçaya doğru eğik kesilmiş levhalar + her levhanın alt kenarında bronz şerit.
  - **Baldırlık (greave):** düz boru yerine baldır kası şişkinliği olan form.
  - **Kask:** yüzü çubuk gibi kesen ve yanlardan dışarı taşan düz alın çubukları kaldırıldı;
    yerine kask yüzeyini izleyen bronz alın bandı. Nefes delikleri 3 ince (pürüzlü) yarık yerine
    2 temiz yarık.
- Model yeniden heykellendi (21k üçgen, değişmedi), `data/models.js`, `dist/`, kök `index.html` güncellendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-hero (ekran görüntüleri; deri bozulması yok).
- Not: `tools/sculpt/cache/` git'te yok; tek model derlemeden önce mevcut modeller
  `data/models.js`'den cache'e çıkarılmalı (yoksa `build.mjs` diğer modelleri siler).

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: uyluk zırhının (cuisse) kesik alt kenarını yumuşat; omuzluklar çok kalın/kutu;
   kürk yaka seyrek ve dikenli görünüyor; pelerinin sırt bağlantısı; kask yanaklarına hacim. Sonra
   özellik 1 "tamamlandı" sayılabilir.
2. Özellik 2: kahraman için anahtar kareli animasyon klibi sistemi (harmanlama + ayak IK).
3. Özellik 4–5: yeni yaratık türleri (iskelet, örümcek) ve Ay Kılıççısı'na evcilleştirme.
