# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya her zamanlanmış çalıştırmanın başında okunur. Oyunun ayrıntılı yol haritası ve oturum günlüğü:
`ay-kiliccisi/PROGRESS.md` (aktif oyun: Ay Kılıççısı — kök `index.html` onun `dist` kopyasıdır; eski oyun `yaban.html`).

## Tamamlanan (yalnızca gerçekten bitenler)

_(henüz yok — aşağıdaki özelliklerin hepsi kısmen var, hiçbiri bitmiş sayılmaz)_

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | sürüyor | Kael: SDF heykel modeli (~21k üçgen, 58 kemik). Kullanıcının istediği zırh yeniden tasarımı bekliyor. |
| Gerçekçi 3B karakter animasyonları | sürüyor | Prosedürel pozlar + kol IK, pelerin fiziği, eğimde ayak IK, hareket katmanı (adımda leğen, ivme eğilmesi, dönüşte yatma, yönlü sarsılma). Eksik: anahtar kareli saldırı klipleri, duruşa özgü pozlar, NPC/düşman animasyon kalitesi. |
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

### 2026-11-24 (2. çalıştırma)
- **Süreç sorunu bulundu:** her zamanlanmış çalıştırma `main`'den yeni bir `ccr-…` dalı açıyor; dallar birleştirilmediği için işler
  birikmiyor ve tekrarlanıyor (zırh yeniden tasarımı ~6, ayak IK ~4 kez farklı dallarda yapılmış). Bu çalıştırma önceki çalıştırmanın
  dalını (`ccr-70a30f22-0lgwjo`) kendi dalına birleştirdi ve üstüne devam etti. Dalların `main`'e PR ile alınması gerekiyor.
- Yeni hareket katmanı (`ay-kiliccisi/src/32-secondary.js` → `motionLayer`, `hitReact`): durum pozunun üstüne eklenir, `P.ps`'i bozmaz.
  - Adım: leğen öndeki bacakla birlikte döner (yürüyüş ±0.11, depar ±0.16 rad), salınan bacağın kalçası düşer; omurga ters döner,
    uyluklar ters yatırılır, ayaklar gövdenin altında kalır (`applyPose`: `pelY`, `pelZ`).
  - İvme: hızlanırken gövde öne, fren yaparken geriye yaslanır (süzülmüş hız türevi).
  - Dönüş: koşarken gövde dönüşün içine yatar, baş dönüş yönüne bakar.
  - Vuruş: itme yönü kahramanın yerel eksenine çevrilir; önden vuruş geriye, arkadan öne, yandan yana savurur (3 sönümlü yay).
    Öfke modunda veya saldırı ortasında (durum değişmeden) de görünür. `hurt` pozu da artık yöne göre (eskiden hep geriye).
- Yeni test `ay-kiliccisi/test/s-motion.js` 12/12 (iskeletin gerçek kemik konumlarından ölçer). Regresyon: mech 47/47, stance 11/11,
  loop 71/71, ui 7/7, save 1/1, anim 12/12, assn 5/5 (okçu isabet testi rastgele: değişiklik olmadan da sınırda, bir koşuda %31 ile
  kaldı, yeniden koşunca geçti; ok çarpışması kemiklere bakmadığı için bu değişiklikten etkilenmez). Performans ölçümü değişmedi.

## Sıradaki öncelikler
1. **Süreç:** biriken `ccr-…` dallarını `main`'e al (kullanıcı onayı gerekir); yoksa sonraki çalıştırmalar yine sıfırdan başlar.
2. Animasyon: duruşa özgü saldırı pozları (Rüzgâr/Su/Ay farklı vuruş yayları), saldırıya anahtar kareli hazırlık–vuruş–toparlanma,
   kılıç ağırlığıyla gövde gecikmesi; köylü/goblin yürüyüşlerine aynı leğen katmanı.
3. Kahraman: zırh yeniden tasarımı (kullanıcı isteği) — `tools/sculpt/models/hero.mjs` (başka dallarda yapılmış sürümler var, birleştirilmeli).
4. Yaratıklar: zindan yaratıkları (iskelet, örümcek) — model + YZ.
5. Android: FPS ölçümüne göre otomatik kalite düşürme.
