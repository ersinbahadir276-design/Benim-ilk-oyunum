# PROGRESS — zamanlanmış geliştirme çalıştırmaları

Bu dosya zamanlanmış görevin özellik listesini izler. Oyunun ayrıntılı günlüğü ve yol haritası:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı; kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

> Not: Önceki zamanlanmış çalıştırmalar kendi `ccr-70a30f22-*` dallarında kaldı, `main`'e birleştirilmedi
> (ör. kahraman zırhı geçişleri: `-kpnltt`, `-xztvch`, `-lsmbh1`; ayak IK: `-w1kluf`, `-rme2uo`; mobil kalite: `-fxpjiv`).
> Her yeni çalıştırma `main`'den başladığı için bu işler burada görünmez. Aynı işi tekrar etmemek için bu çalıştırma
> o dallarda hiç dokunulmamış bir özelliği (4: yaratıklar) ilerletti. O dallardan biri birleştirilirse bu tablo güncellenmeli.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor**: SDF heykel modeli oyunda; zırh yeniden tasarımı dallarda var, `main`'de yok |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor**: kodla üretilen pozlar; arazi ayak IK'sı dallarda var, `main`'de yok; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha, Şeytan Kraliçe (elf gövdesi + saç GLB); diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | **Devam ediyor**: kurt, goblin (okçu, büyük, şef), timsah, ejderha, **iskelet savaşçı (bu çalıştırma)**; örümcek, hortlak, golem yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: görüş/duyma yapay zekâsı, Veyra yoldaşı; Ay Kılıççısı'nda evcilleştirme yok (eski oyun `yaban.html`'de var) |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var; ayrıntı `ay-kiliccisi/PROGRESS.md` |
| 7 | Android performansı ve mobil kontroller | Kısmen: PS düzenli dokunmatik düğmeler, kalite seviyeleri; gerçek cihazda test edilmedi |

## Tamamlananlar
- Listede henüz tamamen bitmiş özellik yok.

## Çalıştırma günlüğü

### 2026-11-17: özellik 4, iskelet savaşçılar (gece yaratığı)
- **Yeni model:** `ay-kiliccisi/tools/sculpt/models/skeleton.mjs`. SDF heykel hattıyla yapıldı: uçları topuzlu uzun kemikler,
  kaburga kafesi (7 çift kaburga, göğüs kemiği), omurga, kürek kemikleri, leğen kemiği, çatlak kafatası, oyuk göz çukurlarında
  soluk mavi ruh ateşi (ışıyan malzeme), ayrı çene ve dişler, parmak/ayak parmağı kemikleri, yırtık bez, paslı kemer ve
  çentikli paslı kılıç. 9,3k üçgen, köylülerle aynı 16 kemikli insan iskeleti.
- **Oyun (`src/46b-skeletons.js` + `46-goblins.js` kancaları):** 3 harabede 5'er toplam 15 iskelet savaşçı.
  - Gündüz toprağın altındalar: görünmez, düşman listesinde değiller.
  - Gece kahraman 75 m içine girince topraktan kalkarlar (2,2 sn kalkış animasyonu, kemik tozu, uyarı mesajı).
  - Goblin beynini kullanırlar (görüş, kovalama, çevreleme, hazırlık/vuruş); vuruşları daha ağır (12 hasar), hazırlıkları daha
    yavaş ve okunur (0,75 sn), menzilleri daha uzun.
  - **Yeniden birleşme:** sıradan bir öldürücü vuruş kemikleri yalnızca dağıtır; 3,2 sn sonra iskelet yarım canla yeniden
    birleşir (yerden kalkma pozu). Ağır saldırı, zıplama saldırısı, yetenek, İNFAZ ya da suikast onu kesin bitirir. İlk seferde
    sistem ipucu çıkar.
  - Ölenler o gece dinlenir (300 sn); şafakta savaşmayanlar toprağa döner. Bölge seviyesine göre can (harabeler Sv.11 → 210).
  - Ödül: +60 XP, +8 altın, normal ganimet; `SYS.skelKills` sayacı. Boyun kilidi ile alt etme iskeletlere uygulanmaz.
  - Düzeltme: iskelet seni görünce "Goblin seni gördü" yerine "İskelet savaşçı seni gördü!" yazıyor.
- **Hata düzeltmesi:** `data/models.js` içinde `bigGoblin` heykel modeli eksikti (büyük goblin ve şef eski silindir modeline
  düşüyordu); yeniden paketlendi.
- **Testler:** yeni `test/s-undead.js` 13/13 (gömülü/kalkış/savaş/dağılma/yeniden birleşme/ağır bitiriş/dinlenme/şafak).
  Gerilemeler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-assn 5/5.
  `s-save` yazılımsal WebGL'de zamanlamaya bağlı ve kararsız: `main`'de de 2 denemenin 2'sinde başarısız oldu, bu değişiklikle 2'de 1 geçti.
- Önbellek notu: `tools/sculpt/cache/` git'te yok. Tek model derlemeden önce `data/models.js`'teki her girdi
  (gzip+base64) `cache/<ad>.bin` olarak açılmalı, yoksa `build.mjs` diğer modelleri siler.

## Sıradaki öncelikler
1. Önceki çalıştırma dallarından en iyisini (kahraman zırhı + ayak IK) `main`'e birleştirme kararı, kullanıcı onayıyla.
   Böylece özellik 1 ve 2 aynı işi tekrar etmeden ilerler.
2. Özellik 4 devam: dev örümcek (8 bacak, yeni iskelet; harabe/mağara), hortlak (uçan, yarı saydam), iskelet okçu
   (mevcut `archer` mantığı + `SKM`). İskeletlere özel ses (kemik takırtısı).
3. Özellik 5: Ay Kılıççısı'na evcilleştirme (kurt besleme altyapısı `47-npcs`/`40-wolves`'ta var).
4. Özellik 7: `s-save` testini oyun zamanından bağımsız yap (kaydı doğrudan tetikle), gerçek cihaz ölçümü.
