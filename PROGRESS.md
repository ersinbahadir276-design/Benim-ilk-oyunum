# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış rutinin özet takibidir. Ayrıntılı oyun günlüğü: [`ay-kiliccisi/PROGRESS.md`](ay-kiliccisi/PROGRESS.md).
Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, derleme `python3 ay-kiliccisi/tools/build.py`, kök `index.html` = dist kopyası).
Eski oyun `yaban.html` (Yaban Yoldaşları) artık geliştirilmiyor.

## Özellik listesi

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Büyük ölçüde var** — SDF heykel modeli (~21k üçgen, 58 kemik, PBR kanalları). Açık: kullanıcının istediği zırh yeniden tasarımı. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — oturum 8'de kahraman yürüyüşü anahtar kareli oldu (aşağıda). Açık: saldırı/kaçınma klipleri, NPC/hayvan yürüyüşleri. |
| 3 | Gönderilen GLB modellerin entegrasyonu | **Kısmen** — ejderha, elf gövdesi (Kraliçe), saç GLB'si oyunda; diğerlerinden yalnızca iskelet oranları alındı. |
| 4 | Çok sayıda hayvan ve yaratık | **Kısmen** — kurt, goblin (3 tür), timsah, ejderha. Açık: iskelet, örümcek, golem, geyik/kuş… |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen** — görüş/uyarı yapay zekâsı, kurt besleme, Veyra yoldaşı. Evcilleştirme sistemi Ay Kılıççısı'nda sınırlı. |
| 6 | Açık dünya, savaş, envanter, ilerleme | **Büyük ölçüde var** — 2,8 km harita, Tsushima tarzı savaş, 4 duruş, envanter/demirci/yetenek. Açık: harita genişletme, zindanlar. |
| 7 | Android performansı ve mobil kontroller | **Kısmen** — dokunmatik PS düzeni, 30 m dış çizgi kesimi. Açık: gerçek cihaz testi, HUD düzenleyici, LOD. |

Hiçbir özellik henüz "tamamlandı" olarak işaretlenmedi.

## Çalıştırma günlüğü

### 2026-11-23 — Özellik 2: kahramanın gerçekçi yürüme animasyonu
- `ay-kiliccisi/src/32-gait.js` (yeni): tek sinüs dalgası yerine elle anahtar karelenmiş **yürüme / koşu / depar döngüleri**
  (topuk vuruşu, yük alma, orta duruş, itiş, parmak kalkışı, salınım), periyodik Catmull-Rom ile örnekleniyor ve hıza göre harmanlanıyor.
- Hıza bağlı adım boyu (1,45 → 2,6 → 4,0 m), böylece basan ayak zeminde kaymıyor (ölçülen kayma oranı 0,82–0,92).
- Kalça dönüşü ve salınan tarafta kalça düşmesi, omuzların ters dönüşü, kolların gecikmeli sallanması, ileri eğilme,
  ivmeye karşı eğilme, dönüşlerde merkeze doğru eğilme, baş sabitleme.
- Duruş katmanı: nefes, 17 sn'lik ağırlık aktarımı (bir diz bükülür), etrafa bakınma.
- **Arazi ayak IK'sı**: eğimde kalça alçaltılıyor, yukarıdaki bacak kısaltılıyor. Ölçüm: IK'sız bir ayak 4 cm havada, diğeri 3,4 cm gömük; IK ile ikisi de 4 mm içinde.
- Poz sistemi: `pelZ`, `pelY` (kalça yuvarlanma/dönüş), `LftX`/`RftX` (ayak bileği) kanalları eklendi.
- Yeni test: `ay-kiliccisi/test/s-gait.js` (16 test).

## Sıradaki öncelikler
1. Özellik 2 devamı: saldırı/kaçınma için anahtar kareli klipler (beklenti–vuruş–toparlanma), eğimde ayak açısı (ayak tabanı zemine paralel), merdiven/çömelme yürüyüşü döngüsü.
2. Aynı döngü sistemini köylü/muhafız NPC'lerine ve Veyra'ya uygulamak (şu an basit `gaitPose`).
3. Özellik 1: kahraman zırhının yeniden tasarımı (kullanıcı isteği, ayrıntı `ay-kiliccisi/PROGRESS.md`).
4. Özellik 4: yeni yaratık türleri (iskelet, örümcek) — DÜNYA DİREKTİFİ sırasıyla.
