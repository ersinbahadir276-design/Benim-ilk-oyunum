# PROGRESS — otomatik geliştirme oturumları

Bu dosya zamanlanmış görevin (her çalıştırmada bir özelliği ilerletir) kaydıdır. Oyunun ayrıntılı yol haritası
ve tasarım notları: `ay-kiliccisi/PROGRESS.md`. Siteye çıkan oyun: kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli oyunda; miğfer yenilendi (bu çalıştırma). Kalan: baldır zırhı / eldiven detayları, kullanıcının istediği zırh yeniden tasarımı onayı |
| 2 | Gerçekçi 3B karakter animasyonları | Yapılmadı — tüm hareketler kodla üretilen pozlar; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem vb. yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı, Veyra yoldaş; evcilleştirme yalnızca eski `yaban.html` oyununda |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı savaş, 7 sekmeli envanter/seviye; bölge genişletme bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PS düzeni, dikey/yatay; gerçek cihazda test edilmedi |

## Tamamlananlar
- (henüz listeden tamamen biten özellik yok)

## Çalıştırma günlüğü

### 2026-11-23
- **Özellik 1 (kahraman):** Kael'in miğferi yeniden yapıldı (`ay-kiliccisi/tools/sculpt/models/hero.mjs`).
  - T vizör artık turuncu boyalı yüzey değil: koyu, içe gömük bir yarık; yarığın dibinde iki ayrı **kor gibi yanan göz** (ışıyan malzeme) duruyor.
  - Ağ çözünürlüğünden dar olan nefes yarıkları yanakları yırtıp yüzün altında sivri, kırık üçgenler oluşturuyordu; kaldırıldı, ön plaka temiz.
  - Boynuzlar koyu kemik rengine çekildi (önceden soluk bej, zırhla uyumsuzdu).
  - Model yeniden heykellendi (20 954 üçgen, öncekiyle aynı bütçe), `data/models.js`, `dist/` ve kök `index.html` güncellendi.
  - Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7; oyun içi s-hero ekran görüntüleri kontrol edildi.
  - Not: `tools/sculpt/cache/` git'te yok; tek bir modeli yeniden derlemeden önce cache'i `data/models.js`'ten çıkarmak gerekiyor, yoksa `build.mjs` diğer modelleri siler (bu çalıştırmada öyle yapıldı).

## Sıradaki öncelikler
1. Kahraman: baldır zırhını (şu an düz tüp) lameli/kabartmalı yap, eldivenlere parmak plakaları; uzaktan görünürlük için göz ışıltısını HUD/sis ayarıyla dene.
2. Animasyon: kahraman için anahtar kareli klip sistemi (bekleme nefesi, yürüme/koşu döngüleri) + ayak IK.
3. Yeni yaratıklar (iskelet, örümcek) heykel hattıyla.
