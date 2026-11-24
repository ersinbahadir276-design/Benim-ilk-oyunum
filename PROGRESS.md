# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya her zamanlanmış çalıştırmanın başında okunur. Oyunun ayrıntılı yol haritası ve oturum günlüğü:
`ay-kiliccisi/PROGRESS.md` (aktif oyun: Ay Kılıççısı — kök `index.html` onun `dist` kopyasıdır; eski oyun `yaban.html`).

## Tamamlanan (yalnızca gerçekten bitenler)

_(henüz yok — aşağıdaki özelliklerin hepsi kısmen var, hiçbiri bitmiş sayılmaz)_

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | sürüyor | Kael: SDF heykel modeli (~21k üçgen, 58 kemik). Kullanıcının istediği zırh yeniden tasarımı bekliyor. |
| Gerçekçi 3B karakter animasyonları | sürüyor | Prosedürel pozlar + kol IK. **Bu çalıştırma:** pelerin fiziği ve eğimde ayak IK. |
| Gönderilen GLB modellerinin entegrasyonu | kısmi | Ejderha GLB, saç GLB, elf gövdesi içe aktarıldı; diğer GLB'lerden yalnızca iskelet oranları. |
| Çok sayıda hayvan ve yaratık | kısmi | Kurt, timsah, ejderha, goblinler; iskelet/örümcek/golem vb. yok. |
| Yaratık evcilleştirme ve yapay zekâ | kısmi | Kurt evcilleştirme, görüş/duyma yapay zekâsı, Veyra yoldaş YZ'si. |
| Açık dünya, savaş, envanter, ilerleme | büyük ölçüde var | Harita genişletme, zindanlar, lonca hâlâ yapılmadı. |
| Android performansı ve mobil kontroller | kısmi | Dokunmatik düzen + dikey ekran var; gerçek cihazda test edilmedi. |

## Çalıştırma günlüğü

### 2026-11-24
- Kahramanın pelerin kemikleri tanımlıydı ama hiç hareket etmiyordu → `ay-kiliccisi/src/32-secondary.js`: üç eklemli sönümlü yay pelerini
  (koşuda açılma, düşerken havalanma, dönüşte savrulma, alt uçta gecikme/dalgalanma, bacak itmesi, öne eğilince sırtta kalma).
- Eğimli zeminde ayak IK: iki kemikli bacak IK, kalça alçalması, tabanların eğime yatması; havada/yerde/taklada kapanır.
- Yeni test `ay-kiliccisi/test/s-anim.js` (12/12). Mevcut testler: mech 47/47, stance 11/11, loop 71/71, ui 7/7, assn 5/5, save 1/1; performans değişmedi.

## Sıradaki öncelikler
1. Animasyon: kalçanın adım ritmiyle yana kayması/dönmesi, koşu başlangıç-durma geçişleri (ivme eğilmesi), vuruş alınca yönlü sarsılma.
2. Kahraman: zırh yeniden tasarımı (kullanıcı isteği) — `tools/sculpt/models/hero.mjs`.
3. Yaratıklar: zindan yaratıkları (iskelet, örümcek) — model + YZ.
4. Android: gerçek cihaz için kalite ayarı otomatik düşürme (FPS ölçümüne göre).
