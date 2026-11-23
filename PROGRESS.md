# PROGRESS — otomatik geliştirme çalışmaları

Zamanlanmış görev her çalıştığında bu dosyayı okur, sıradaki eksik özelliği ilerletir ve burayı günceller.
Ana oyun: `ay-kiliccisi/` (kaynak `src/` + `data/`, derleme `python3 tools/build.py` → `dist/ay-kiliccisi.html`;
kök `index.html` bu dosyanın kopyasıdır). Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`.
Eski oyun (three.js, `src/`, `yaban.html`) artık geliştirilmiyor.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Kısmen.** SDF heykel modeli (~21k üçgen, 58 kemik) oyunda. Kalan: kullanıcının istediği zırh yeniden tasarımı (yön bekliyor), yakın plan yüz/kask ayrıntısı |
| 2 | Gerçekçi 3B karakter animasyonları | **Kısmen.** Tüm hareketler kodla üretilen pozlar. Çalışma 1'de bekleme ve yürüme/koşu iyileştirildi (aşağıda) |
| 3 | Gönderilen GLB modellerinin entegrasyonu | **Kısmen.** Elf gövdesi + saç (kraliçe), ejderha, şövalye heykeli oyunda. `assets/models/hero_anims*.glb` (Quaternius CC0 klipleri) yeni oyuna henüz bağlanmadı |
| 4 | Çok sayıda hayvan ve yaratık | **Kısmen.** Kurt, goblin (3 tür), timsah, ejderha. Eksik: geyik/kuş, iskelet, örümcek, golem… |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen.** Kurt besleme, görüş/algı yapay zekâsı, Veyra yoldaşı. Eski oyundaki 14 türlük evcilleştirme yeni oyuna taşınmadı |
| 6 | Açık dünya, dövüş, envanter, ilerleme | **Büyük ölçüde var.** 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter/ilerleme. Kalan: bölge genişletme, zindanlar |
| 7 | Android performansı ve mobil kontroller | **Kısmen.** Dokunmatik düzen + kalite ayarı var; gerçek cihazda test edilmedi, HUD düzenleyici yok |

## Tamamlananlar

(Henüz bu listeden tamamen biten özellik yok.)

## Çalışma günlüğü

### Çalışma 1 — 2026-11-23 · Özellik 1–2: kahramanın duruşu ve yürüyüşü
Kael bekleme anında dimdik, ayaklar bitişik, kollar düz duruyordu; yürüyüş yalnızca kalça/diz salınımıydı.
- **Savaşa hazır bekleme** (`idlePose`, `55-player.js`): açık ve kademeli duruş (sol ayak önde, yumuşak dizler),
  ~0,27 Hz nefes (göğüs + omuz), birkaç saniyede bir ayaktan ayağa ağırlık aktarma (kalça yana eğilir, gövde karşılar),
  kılıç önde ve hazır, ara sıra etrafa bakma. Arka bacak boyu ön bacağa eşitlendi; iki ayak da yere basıyor.
- **Yürüyüş/koşu ayrıntısı**: öndeki ayakta topuk vuruşu, arkadakinde parmak itişi; salınan tarafta kalça düşmesi;
  gövdenin öne eğilmesine karşı baş dengede (bakış düz); dönüş hızına göre gövde dönüşe yatıyor.
- **Poz sistemi** (`30-player-model.js`): yeni kanallar `pelZ` (kalça yan eğimi), `LfX/RfX` (ayak yuvarlanması);
  ayaklar artık kalça eğimini ve bacak açıklığını da telafi ederek zemine düz basıyor.
- **Test**: yeni `ay-kiliccisi/test/s-anim.js` (7 kontrol: NaN yok, açık duruş, iki ayak yerde, nefes + ağırlık aktarma,
  ayak yuvarlanması + kalça düşmesi, dönüşte yatma, durunca beklemeye dönüş).

## Sıradaki öncelikler
1. Animasyon (özellik 2): eğimli zeminde ayak IK'sı (her ayak kendi zemin yüksekliğine basar, kalça alçalır);
   saldırılarda hazırlık/takip (anticipation / follow-through) ve ağırlık aktarımı; koşudan duruşa geçişte fren pozu.
2. Özellik 3: `hero_anims*.glb` Quaternius kliplerinden (CC0) yürüme/koşu/bekleme eğrilerini Kael'in poz kanallarına
   örnekleyip (yeniden hedefleme) kodla üretilen döngülerle karşılaştırmak.
3. Özellik 1: zırh yeniden tasarımı için kullanıcıdan yön/örnek görsel gerekli; o gelene kadar kask ve yüz yakın plan ayrıntısı.
4. Özellik 4–5: geyik/kuş gibi barışçıl hayvanlar ve eski oyundaki evcilleştirme yöntemlerinin yeni oyuna taşınması.
