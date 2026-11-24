# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin kaydıdır. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, teslim: kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).
Oyunun ayrıntılı yol haritası ve oturum günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları) `yaban.html` + `src/`.

## Özellik listesi (öncelik sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — Kael (SDF heykel, ~21k üçgen, 58 kemik, pelerin kemikleri) oyunda. Kullanıcının istediği zırh yeniden tasarımı bekliyor. |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (rutin) — şu an tüm hareketler kodla üretilen pozlar; anahtar kareli klip sistemi + ayak IK'sı yok |
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

## Sıradaki öncelikler
1. Kahraman (özellik 1): zırh yeniden tasarımı için kullanıcıdan yön/örnek görsel gerekli; o gelene kadar hedefli kalite işleri (eldiven parmakları, sırt/pelerin bağlantısı, uzak LOD).
2. Animasyon (özellik 2): kahramana anahtar kareli klip + harmanlama sistemi, ayak–zemin IK'sı.
3. Hayvanlar (özellik 4): geyik/kuş gibi pasif yaban hayvanları, sonra zindan yaratıkları.
