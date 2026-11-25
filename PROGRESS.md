# PROGRESS — otomatik geliştirme turu

Bu dosya zamanlanmış geliştirme turunun özetidir. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, sitede `index.html`).
Ayrıntılı yol haritası ve oturum günlüğü: [`ay-kiliccisi/PROGRESS.md`](ay-kiliccisi/PROGRESS.md).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (58 kemik, ~21k üçgen) var. Zırh yeniden tasarımı başladı (tur 1). |
| 2 | Gerçekçi 3B karakter animasyonları | Yapılmadı. Hareketler kodla (prosedürel); anahtar kareli klip + IK + harmanlama gerekiyor (ANALIZ.md). |
| 3 | Gönderilen GLB modellerinin eklenmesi | Kısmen. Ejderha, elf kraliçe gövdesi, saç GLB'si oyunda; diğerlerinden yalnızca iskelet oranları alındı. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen. Kurt, Alfa Kurt, goblin, büyük goblin, okçu, timsah, ejderha. İskelet, örümcek, golem vb. yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen. Görüş/uyarı yapay zekâsı ve Veyra yoldaşı var. Ay Kılıççısı'nda evcilleştirme yok (eski oyun `yaban.html`'de var). |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde tamam (2,8 km harita, duruşlar, ganimet, seviye, demirci). Dünya genişletme sürüyor. |
| 7 | Android performansı ve mobil kontroller | Kısmen. Dokunmatik PS düzeni, 30 m dış çizgi sınırı. Gerçek cihazda test edilmedi. |

## Tamamlananlar
- (henüz listedeki özelliklerin hiçbiri tümüyle bitmedi)

## Tur 1 — 2026-11-25
Özellik 1 (kahraman zırhı) üzerinde çalışıldı:
- Göğüs zırhına bronz **hilal ay arması** ve hilalin içine küçük bir yıldız eklendi (Ay Kılıççısı'nın simgesi). Arma zırh yüzeyini izliyor.
- Miğfer: T göz yarığı inceltildi (yatay 11→10,4 mm, dikey 12→8,4 mm genişlik). Pürüzlü döndürülmüş kutu nefes delikleri kaldırıldı, yerlerine her yanaktan yüzey normaline delinmiş 5 yuvarlak delik kondu.
- Araç hatası düzeltildi: `tools/sculpt/build.mjs` tek bir modeli yeniden yaparken (`cache/` git'te yok) öteki 15 modeli `data/models.js`'den siliyordu. Artık eksik önbellek kayıtları mevcut `data/models.js`'den dolduruluyor.
- `dist/ay-kiliccisi.html` ve kök `index.html` yeniden derlendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 6/7. Kalan s-ui hatası (SALDIR basılı tut = ağır saldırı) değişiklikten önce de vardı. Test, PlayStation düğme düzeninden (△ = ağır) eski kaldığı için düşüyor.

## Sıradaki öncelikler
1. Kahraman zırhı devamı: miğfer yarığındaki ışıma taşmasını gider (köşe rengi yerine doku/ayrı ışıma parçası), hilal armasını daha keskin yap, tassetleri biçimlendir, arka zırha ayrıntı ekle. Sonra özellik 1'i bitmiş say.
2. s-ui testini PS düzenine göre güncelle (△ ağır saldırı).
3. Özellik 2: kahramana anahtar kareli klip sistemi (koşu, hafif kombo, kaçınma), ayak IK'sı, klip harmanlama.
