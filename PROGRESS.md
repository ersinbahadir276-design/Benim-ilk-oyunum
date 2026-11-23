# PROGRESS — otomatik geliştirme rutini

Bu dosyayı her zamanlanmış çalıştırma okur ve günceller. Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`.
Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, tek HTML, kendi WebGL motoru). Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası.
Eski three.js oyunu (Yaban Yoldaşları) `yaban.html` + `src/` altında duruyor; geliştirilmiyor.

## Özellik listesi (rutin önceliği sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli var; zırh yeniden tasarımı 1. tur yapıldı (aşağıda). Kalan: yakın plan yüz/kask ayrıntısı, pelerin/kürk kalitesi, eldiven parmakları |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — tüm hareketler kodla üretilen pozlar; anahtar kareli klip + harmanlama sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si oyunda; diğerlerinden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha. Eksik: iskelet, örümcek, golem, hortlak, geyik/kuş |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı, Veyra yoldaşı, kurt besleme var; evcilleştirme sistemi bu oyunda yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/yetenek. Eksik: harita genişletme, zindanlar, lonca |
| 7 | Android performansı ve mobil kontroller | Kısmen — PlayStation düzenli dokunmatik düğmeler, 30 m ötesi dış çizgi kapalı; gerçek cihazda test edilmedi, HUD düzenleyici yok |

## Tamamlananlar
_(Henüz hiçbir özellik tamamen bitmiş olarak işaretlenmedi.)_

## Çalıştırma günlüğü

### 2026-11-23 — Kahraman zırhı yeniden tasarımı (1. tur)
Önceki görünüm: kollar/bacaklar düz koni (boru gibi), kask top gibi, göğüs düz.
`ay-kiliccisi/tools/sculpt/models/hero.mjs` değişiklikleri:
- Göğüs: kabarık pektoral plakalar, ortada bronz omurga sırtı, karından yükselen sivri plackart + bronz kenarı
- Kol: üst kol tek boru yerine iki bindirmeli lam; ön kolda kas şişkinliği ve dirsekte çan genişlemesi
- Bacak: uyluk zırhı kas biçimli (dizde daralan) + dış yan lamı; baldır zırhında arkada baldır şişkinliği, bilekte daralma
- Kask: yanları düzlemlerle kesilmiş köşeli kafatası, göz yarığına gölge düşüren kaş rafı, vizörün üstüne oturan V biçimli yanak plakaları + perçinler
- Model: 20 996 → 22 368 üçgen (aynı 58 kemik, oyun kodu değişmedi)
- Araç notu: `tools/sculpt/cache/` git'te yok; tek model derlemeden önce `data/models.js`'ten doldurulmalı, yoksa diğer 15 model silinir (bu turda yapıldı; diğer modeller bayt bayt aynı kaldı)

Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-perf hatasız; oyun içi koşu/ağır saldırı/blok görüntüleri kontrol edildi.

## Sıradaki öncelikler
1. Kahraman 2. tur: kürk yakayı daha ince tutamlara böl (şimdi topak), pelerin kenarını yırtık şeritlere çevir, eldivenlere ayrı parmak lamları, omuzlukları biraz küçült (silüeti örtüyor)
2. Bundan sonra özellik 2: kahraman için anahtar kareli klip sistemi (bekleme/yürüme/koşu/saldırı) + çapraz geçiş
3. Ay Kılıççısı kendi listesindeki kalan işler: harita genişletme, zindan, yeni yaratıklar
