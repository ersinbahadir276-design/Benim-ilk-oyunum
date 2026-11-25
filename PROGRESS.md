# PROGRESS — Benim İlk Oyunum (zamanlanmış geliştirme)

Bu dosya zamanlanmış görevin her çalışmasında okunur ve güncellenir. Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`.
Etkin oyun: **Ay Kılıççısı** (`ay-kiliccisi/`). Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası
(derleme: `python3 ay-kiliccisi/tools/build.py`, sonra `cp ay-kiliccisi/dist/ay-kiliccisi.html index.html`).

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var, tamamlandı sayılmadı.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik, PBR malzeme). Açık: kullanıcının istediği "zırhı yeniden tasarla" (sanat yönü kullanıcıdan gelmeli). |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor.** Bu çalışmada kahramanın yürüyüş/koşu/bekleme hareketi yeniden yazıldı (aşağıda). |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha (kendi klipleriyle), elf gövdesi (kraliçe), saç GLB'si, iskelet oranları. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, timsah, ejderha, goblin türleri. Geyik/kuş/zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleyerek evcilleştirme, Veyra yoldaş YZ, görüş/uyarı sistemi. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, demirci, yetenekler, görevler). Harita genişletme/zindan yok. |
| 7 | Android performansı ve mobil kontroller | Dokunmatik düzen ve LOD/kalite var; gerçek cihazda test edilemedi. |

## Tamamlananlar
- (Henüz listedeki hiçbir özellik tamamen bitmiş sayılmadı.)

## Çalışma günlüğü

### 2026-11-25 — kahraman hareketi (özellik 2, kahramanla kesişiyor)
Neden bu: kahraman modeli önceki oturumlarda yapıldı; görünür en büyük kusur hareketiydi — koşarken basan ayak yerde
kayıyordu (uyluk açısı sinüsle sallanıyor, adım uzunluğu gövde hızıyla eşleşmiyordu, üstüne 14/sn yumuşatma fazı geciktiriyordu).
- `ay-kiliccisi/src/32-gait.js` (yeni): her ayak kalça çerçevesinde bir yol izler; basma evresinde gövde hızıyla tam ters
  yönde kayar (dünyada yerinde durur), salınımda kalkar ve öne gider. İki kemikli bacak IK'sı açıları üretir.
  Adım döngüsü hızdan türetilir (yavaş yürüyüş → jog → depar ayrı parametreler: basma oranı, adım boyu, ayak kaldırma).
  Topuk vuruşu (parmak yukarı), topuk kalkışı/parmak itişi, depar uçuş evresi (kalça yüksekliği açıkça verilir).
  Kalça dönmesi/eğilmesi, ağırlığın basan ayağa kayması, gövdenin ters dönmesi, kolların bacaklara karşı sallanması
  (kılıç kolu daha az), baş sabitleme, hızlanma/yavaşlamada öne/geriye eğilme, dönüşlerde içe yatma.
- Bekleme: ağırlık yavaşça ayaktan ayağa kayar, yük taşımayan diz gevşer, göğüs nefes alır, baş etrafa bakar.
- `30-player-model.js`: kalça Y/Z dönmesi, ayak eğimi, kök yan kayması ve açık kalça yüksekliği kanalları.
- `55-player.js`: faz artık metre başına adım döngüsünden; bacak kanalları alçak geçiren süzgeci atlar (ağırlıkla karışır,
  saldırı/dur-kalk geçişleri yumuşak kalır).
- Yeni test `ay-kiliccisi/test/s-gait.js` (7/7). Ölçüm, eski → yeni: basan ayak kayması jog %73 → %3,7, depar %23 → %2,4;
  dönüşte yatma 0 → 0,07 rad; beklerken ağırlık kayması 0 → 3 cm.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5, s-bow 4/4, s-save 1/1 (zamanlamaya duyarlı, bir kez
  başarısız olup yeniden çalıştırmada 2/2 geçti). s-ui 6/7: "SALDIR basılı tut = ağır saldırı" testi **eski sürümde de
  başarısız** (bu değişiklikten değil, açık hata).

## Sıradaki öncelikler
1. Animasyon (özellik 2) devamı: eğimli zeminde ayak IK'sı (ayakları araziye oturtma), koşudan duruşa geçişte
   "durma adımı", saldırı/duruş pozlarını anahtar kareli kliplere taşımak (hamle, saplama, kombo bitiricileri).
2. s-ui'deki ağır saldırı (basılı tut → bırak) test hatasını incele ve düzelt.
3. Özellik 1: kahraman zırhının yeniden tasarımı için kullanıcıdan referans/yön bekleniyor; gelirse `tools/sculpt/models/hero.mjs`.
4. Aynı gait sistemini Veyra ve köylülere uyarlamak (şimdi sinüs uyluk salınımı kullanıyorlar).
