# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya zamanlanmış görevin özellik listesini izler. Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`.
Oyun: `ay-kiliccisi/` (kaynak `src/`, birleştirme `python3 ay-kiliccisi/tools/build.py`, kök `index.html` = `dist` kopyası).

## Tamamlananlar
_(henüz hiçbir özellik tamamen bitmiş sayılmıyor)_

## Özellik durumu
| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | KISMEN — Kael heykel modeli oyunda (~21k üçgen, 58 kemik). Kullanıcının istediği zırh yeniden tasarımı yapılmadı: tasarım yönü (referans/tarz) kullanıcıdan gelmeli. |
| Gerçekçi 3B karakter animasyonları | DEVAM EDİYOR — oturum 8'de animasyon katmanı eklendi (aşağıya bakın). Eksik: anahtar kareli saldırı klipleri, kök hareketi, yürüme döngüsünde ayak kayması düzeltmesi. |
| Gönderilen GLB modellerinin entegrasyonu | KISMEN — elf gövdesi + saç GLB'si (kraliçe), ejderha; diğerlerinden yalnızca iskelet oranları. |
| Çok sayıda hayvan ve yaratık | KISMEN — kurt, goblin (3 tür), timsah, ejderha. |
| Yaratık evcilleştirme ve yapay zekâ | KISMEN — Veyra yoldaş YZ; eski `yaban.html` oyununda evcilleştirme var, Ay Kılıççısı'nda yok. |
| Açık dünya, dövüş, envanter, ilerleme | BÜYÜK ÖLÇÜDE VAR — bkz. `ay-kiliccisi/PROGRESS.md`. |
| Android performansı ve mobil kontroller | KISMEN — dokunmatik düzen var; gerçek cihazda test edilemedi. |

## Çalıştırma günlüğü
### Oturum 8 (2026-11-24) — Gerçekçi animasyon: kahraman animasyon katmanı
Seçim gerekçesi: listedeki 1. madde (kahraman) zırh tasarımı için kullanıcı yönlendirmesi bekliyor; 2. madde ele alındı.
- Yeni `ay-kiliccisi/src/32-anim.js`:
  - **Ayak IK (eğimli zemin):** her ayağın altındaki arazi yüksekliği ölçülüyor; kalça alçaktaki ayağa iniyor, yokuş yukarıdaki bacak 2 kemikli IK ile bükülüyor, basan ayak eğime göre açılanıyor. Test: 0,21 eğimde IK kapalıyken ayak 5,2 cm araziye gömülüyordu, şimdi 1,1 cm.
  - **Pelerin fiziği:** daha önce hiç hareket etmeyen CapeA/B/C kemikleri artık sönümlü yaylarla sürülüyor — yerçekimiyle sarkıyor, koşarken ve düşerken arkaya kalkıyor, hızla dalgalanıyor, dönüşlerde geride kalıyor, uyluklara katlanmıyor.
  - **Gövde dinamiği:** koşarken dönüşe doğru yatma, hızlanma/yavaşlamada öne/arkaya eğilme; beklerken ağırlık aktarma ve nefes.
  - **Bakış:** kilitli hedefe baş ve göğüs dönüyor.
- `30-player-model.js` bacak/kök hesabı `legIK()`'ye taşındı (ara sahnelerde eski davranış aynen kalıyor).
- Testler: yeni `test/s-anim.js` 10/10; `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-ui` 7/7; `s-perf` mantık süresi kare başına ~0,1 ms. Görüntüler: `test/s-animshots.js`.

## Sonraki öncelikler
1. Animasyon: anahtar kareli (Hermite) saldırı klipleri — hazırlık / vuruş / takip / toparlanma, 3'lü kombo ve ağır saldırı için.
2. Animasyon: yürüme/koşu döngüsünü adım uzunluğuna bağlayıp ayak kaymasını gidermek; koşudan durmaya geçişte durma adımı.
3. Animasyon katmanını (ayak IK, bakış) Veyra ve insan NPC'lere genişletmek.
4. Kahraman zırhı yeniden tasarımı — kullanıcıdan tarz/referans alınınca.
