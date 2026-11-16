# Proje Analizi ve Yol Haritası (Master Directive, oturum 6)

## 1. Mimari (bugünkü durum)
- **Tek HTML**, harici kütüphane yok. Kaynak `src/NN-*.js` + `data/*.js`, `tools/build.py` birleştirir → `dist/ay-kiliccisi.html` (~8 MB).
- **Motor (10-engine.js):** kendi WebGL1 çizicimiz. Nesne listesi, dış çizgi, sis, 4 kemikli GPU deri, malzeme ışığı (parlaklık/metal/ışıma), alfa kesmeli doku. Gölge haritası, normal haritası ve son işlem (bloom vb.) yok.
- **Karakterler:** kahraman CPU deri (58 kemik), diğerleri GPU deri (en fazla 22 kemik). Modeller ya kendi heykel hattımız (`tools/sculpt`, SDF → mesh) ya da kullanıcının CC BY modelleri (elf gövdesi, saç, ejderha).
- **Animasyon:** hepsi kodla üretilen pozlar (eklem açıları + IK). Elle yapılmış animasyon klibi yok (yalnızca ejderhanın kendi klipleri var).
- **Fizik:** kendi çarpışmamız (daire/kapsül, arazi yüksekliği, ağaç/duvar engelleri). Fizik motoru yok.
- **Test:** Playwright + yazılımsal WebGL; 4 test takımı (mekanik 47, döngü 71, dokunmatik 7, ok 4) + ekran görüntüsü senaryoları.

## 2. Var olan özellikler → yönergedeki karşılığı
| Yönerge | Durum |
|---|---|
| Hafif / ağır / yüklü / koşu / zıplama saldırısı | VAR (gerçek isabet: kılıç ucu–gövde mesafesi) |
| Kombo zinciri, bitirici | KISMEN (3'lü hafif kombo; bitirici yok) |
| Savunma kırma, karşı saldırı, savuşturma | VAR (blok + savunma canı + tam zamanlı savuşturma penceresi) |
| Duruş (posture) + İNFAZ | VAR (düşmanlarda) — oyuncu duruşu YOK (oyuncuda "savunma canı" var) |
| Kaçınma (4 yön, dokunulmazlık) | VAR — "mükemmel kaçınma" ödülü YOK |
| 4 savaş duruşu (Taş/Su/Rüzgâr/Ay) | YOK |
| Resolve kaynağı | Öfke çubuğu benzeri VAR; adı/işlevi farklı |
| Düşman türleri | Kurt, goblin, okçu goblin, büyük goblin, timsah, ejderha. Kalkanlı/mızraklı/suikastçı/elit samuray YOK |
| Boss (aşamalı) | VAR: Kül Yele, Kırık Diş, ejderha (yere basma halkası). Sinematik giriş, yeniden savaş YOK |
| Gizlilik | VAR: görüş konisi, çömelme, şüphe, alarm, arkadan suikast, sırtına atlama. Çalılıkta saklanma YOK |
| Açık dünya | 2,8 km harita, bölgeler, köy, kale, kamplar, bataklık. Gece-gündüz VAR; yağmur/kar/sis/fırtına YOK; geyik/kuş YOK |
| NPC rutinleri | Dolaşma, bakma, panik kısmen VAR; iş/yemek/uyku YOK |
| Keşif | Sunak, 39 sandık, mühürler, gizli görev VAR; mağara/zindan YOK |
| At | YOK |
| Envanter, demirci, yetenek | VAR (7 sekmeli pencere, 4 yetenek); yetenek AĞACI YOK |
| Mobil kontrol | VAR ama karışık (13 düğme); HUD düzenleyici YOK |
| Menü / ayarlar | Sistem penceresi VAR; ana menü, grafik/FPS/ses ayarları YOK |
| Kayıt | VAR (localStorage, otomatik) |

## 3. Teknik riskler ve sınırlar (açıkça)
- **Animasyon kalitesi:** elimizde motion-capture klibi yok; her hareket kodla. "Gerçekçi animasyon" için en iyi yol: kahramana özel, anahtar kareli (keyframe) klip sistemi + IK + harmanlama. Yapılabilir ama her hareket elle ayarlanır.
- **Grafik:** gölge haritası ve normal haritası yok; eklenebilir ama telefonda FPS'e mal olur → kalite ayarına bağlanmalı.
- **Dosya boyutu:** 8 MB. At, yeni düşmanlar, sesler eklendikçe büyür; gzip'li veri ile 15 MB altında tutulmalı.
- **Test:** gerçek telefonda test edemiyorum; dokunmatik ve FPS ölçümü yazılımsal tarayıcıda yapılıyor.
- **Tema:** yönerge "samuray" diyor; oyun şu an kara fantezi (Kara Zırh, iblis kraliçe, kurt, goblin, ejderha). İki yol var — aşağıya bakın.

## 4. Aşama planı (her aşama sonunda çalışan sürüm + testler)
1. **Savaş çekirdeği:** oyuncu duruşu (posture), mükemmel savuşturma/kaçınma pencereleri ve ödülleri, zincir savuşturma, mızrak karşılama (Mikiri benzeri: kırmızı uyarılı saldırıya doğru kaçın), 4 duruş (Taş/Su/Rüzgâr/Ay: her biri farklı kombo, hız, bitirici ve düşman türüne karşı duruş hasarı), Resolve (öfkenin yerine), kombo bitiricileri, saldırı iptali.
2. **Düşmanlar:** kalkanlı, mızraklı, suikastçı, ağır, elit kılıççı (her biri okunabilir hazırlık + duruş zaafı); grup taktikleri (çevirme, sırayla saldırı); boss sinematik girişi ve yeniden savaş.
3. **Mobil kontrol:** sadeleştirilmiş, duruma göre değişen düğmeler; sürükleyerek kamera, yakınlaştırma (iki parmak), kamera duvar çarpışması.
4. **HUD düzenleyici + menüler:** canlı önizlemeli sürükle-bırak, boyut/şeffaflık/gizle, sol-sağ el; ana menü; grafik/FPS/ses/kamera ayarları.
5. **Dünya:** hava durumu (yağmur, sis, kar), geyik/kuş, NPC günlük rutinleri.
6. **At, gizlilik genişletmesi (çalılık), kale baskını + köy kurtarma.**
7. **Yetenek ağacı, zırh setleri, kozmetik.**
8. **Görevler, mağara/zindan/kule, aktiviteler (meditasyon, düello).**
9. **Optimizasyon + kapsamlı test.**
