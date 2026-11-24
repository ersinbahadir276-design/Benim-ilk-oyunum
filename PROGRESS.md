# PROGRESS — otomatik geliştirme oturumları

Bu dosya zamanlanmış geliştirme oturumlarının özetidir. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`, derlenmiş hâli kökteki
`index.html`). Ayrıntılı tasarım günlüğü ve yol haritası: `ay-kiliccisi/PROGRESS.md`. Eski oyun: `yaban.html`.

## Özellik listesi (öncelik sırasıyla) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik) var; pelerin artık fiziksel (bu oturum). Eksik: kullanıcının istediği zırh yeniden tasarımı, kürk yakada ikincil hareket, yüz/kask detayı. |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen. Tüm hareketler kodla üretilen poz + IK; anahtar kareli klip sistemi ve ayak IK'sı yok. |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen. Ejderha, elf gövdesi (kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları alındı. |
| 4 | Birden çok hayvan ve yaratık | Kısmen. Kurt, timsah, goblin türleri, ejderha. Geyik/kuş/zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen. Kurt evcilleştirme + yoldaş, Veyra fayda tabanlı YZ, görüş/uyarı sistemi. |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı savaş, 7 sekmeli sistem, ganimet, seviye). Zindan/mağara yok. |
| 7 | Android performansı ve mobil kontroller | Kısmen. Dokunmatik PS düzeni, LOD/dış çizgi kesme; gerçek cihazda test edilmedi. |

Tamamlanmış (bitti olarak işaretlenen) özellik: henüz yok.

## Oturum günlüğü

### 2026-11-24 — Özellik 1: kahramanın pelerini canlandı
- Sorun: heykel modelde pelerin CapeA/B/C kemiklerine ağırlıklanmıştı ama hiçbir kod bu kemikleri döndürmüyordu; pelerin gövdeye yapışık, kaskatı duruyordu.
- `ay-kiliccisi/src/31-hero.js` → `capeSim(dt)`: üç parçalı, yay-sönümlü kumaş. Kahramanın gerçek kök hareketinden hız/ivme/dönüş hızı/dikey hız ölçülür:
  koşunca geriye açılır, alt parçalar ek kıvrım alır, hızlanınca geride kalır, frenleyince öne savrulur, dönüşte yana savrulur,
  düşerken kalkar, hıza bağlı dalgalanır. Gövde eğimi yerçekimiyle telafi edilir ama pelerin sırta doğru (gövdenin içine) katlanmaz.
  Işınlanmada fırlamaz; hikâye panellerinde (`58-story.js`) sakin konuma oturtulur.
- Test: yeni `ay-kiliccisi/test/s-cape.js` 8/8. Gerileme: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-save 1/1 (yalnız çalışınca; 5 tarayıcı paralelken zamanlama yüzünden bir kez düştü, değişiklikten önce de aynı kayıt zamanlaması var).
- Bilinen, bu oturumdan önce de var olan hata: s-ui "SALDIR basılı tut = yükleme" testi düşüyor (değişiklik öncesi derlemede de 6/7).

## Sıradaki öncelikler
1. (Özellik 1) Kürk yaka ve bel plakalarına da küçük ikincil hareket; kask tüyü/boynuzlara değil. Kullanıcıdan zırh yeniden tasarımı için yön/görsel istenmeli.
2. (Özellik 1/2) s-ui ağır saldırı yükleme testini incele ve düzelt.
3. (Özellik 2) Ayak–zemin IK'sı (eğimde ayaklar) ve yürüme/koşu geçişlerinde kalça salınımı.
4. (Özellik 4) Yeni yaratık: geyik veya zindan iskeleti (heykel hattıyla).
