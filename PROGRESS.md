# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin özellik listesini izler. Oyunun ayrıntılı geliştirme günlüğü, tasarım
kararları ve yol haritası `ay-kiliccisi/PROGRESS.md` içinde. Oynanan oyun: `index.html` (= `ay-kiliccisi/dist/ay-kiliccisi.html`).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | Büyük ölçüde hazır: Kael «Kara Zırh», SDF heykel model (~21k üçgen, 58 kemik, ışıyan miğfer yarığı, pelerin kemikleri). Açık iş: kullanıcının istediği zırh yeniden tasarımı (yön bekleniyor), uzak LOD |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** (çalıştırma 1'de başladı) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: iskelet oranları (berserk_armor, kawaiope, aldrich), elf gövdesi ve saç GLB'si kraliçede. Gwyndolin iskeleti henüz kullanılmadı |
| 4 | Birden çok hayvan ve yaratık | Kısmen: kurt, goblin, timsah, ejderha; iskelet/örümcek/golem vb. yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme/evcilleştirme, algı sistemi; diğer türler yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde hazır (2,8 km harita, Tsushima tarzı dövüş, ganimet, seviye); bölge genişletme ve zindanlar bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik düzen, 30 m dış çizgi sınırı; gerçek cihazda ölçülemedi |

## Tamamlananlar
- (henüz listeden tamamen biten özellik yok)

## Çalıştırma günlüğü

### Çalıştırma 1 — 2026-11-17 · Özellik 2: gerçekçi animasyonlar
Özellik 1 ekran görüntüleriyle incelendi (önden, yandan, miğfer, koşu): model yüksek kalitede, açık kalan tek iş
kullanıcının yön vermesi gereken zırh yeniden tasarımı. Bu yüzden sıradaki somut özellik olan animasyonlara geçildi.
- Yeni `ay-kiliccisi/src/32-anim.js`: anahtar pozun üstüne her karede uygulanan animasyon katmanları (`P.ps`'ye ve kayıtlı hikâye pozlarına sızmaz)
  - **Eğimde ayak IK'sı:** her ayağın altındaki zemin yüksekliği ölçülür, kalça alttaki ayak kadar iner, yokuş yukarıdaki bacak analitik iki kemik IK ile bükülür; tabanlar eğime göre eğilir. Zıplama, takla, yere düşme, su içinde kapalı; geçişler yumuşatılmış.
  - **Dönüşe yatma:** koşarken yumuşatılmış dönüş hızına göre gövde dönüşün içine yatar.
- `55-player.js`: bekleme duruşu artık canlı (yumuşak dizler, nefesle göğüs/omuz hareketi, ağırlığın bacaktan bacağa geçmesi); koşu/yürüyüşte omurga duruş bacağının üstüne yuvarlanır, kafa gövde dönüşünü ve öne eğilmeyi dengeler (bakış ufukta kalır).
- `30-player-model.js`: ayak bileği eğim açısı (`ftX`).
- Yeni test `test/s-anim.js` (6/6): 20°'lik eğimde ayak–zemin hatası 2,6–5,5 cm → 0,1–0,4 cm; bekleme hareketi; dönüş hızı; NaN yok.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-save 1/1, s-perf hatasız (mantık ≤0,28 ms/kare).

## Sıradaki öncelikler
1. Özellik 2 devamı: saldırılarda önceden kalkış/sonrası toparlanma (anticipation/follow-through) ve ağırlık; koşu döngüsünde ayak kayması (adım uzunluğunu hıza bağlama); yürüme→koşu geçiş harmanı; durmada fren pozu; düşmanlarda (goblin, köylü) da ayak IK'sı.
2. Özellik 1: kullanıcıdan zırh yeniden tasarımı için yön gelirse uygula; kahraman için uzak mesafe LOD.
3. Özellik 4–5: yeni yaratık türleri (iskelet, örümcek) ve evcilleştirme.
