# İlerleme (PROGRESS)

Zamanlanmış geliştirme görevinin her çalışmada güncellediği dosya. Ana oyun: `ay-kiliccisi/` (tek HTML, kendi WebGL motoru).
Eski oyun: `yaban.html` + `src/`.

## Özellik listesi ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Var, cilası sürüyor.** Kael / Kara Zırh: heykel hattıyla üretilmiş tek ağ, 58 kemik, boynuzlu miğfer, kürk yaka, pelerin, iki elli kılıç. Eksik: yüz/zırh doku detayı (normal harita yok), zırhsız/kozmetik varyant |
| 2 | Gerçekçi 3D karakter animasyonları | **Devam ediyor.** Bu çalışmada ayak IK'sı ve yürüyüş katmanı eklendi (aşağıda). Eksik: anahtar kareli klip sistemi + klipler arası harmanlama, kök hareketi, adım sesleriyle senkron, düşman animasyonlarına aynı katman |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen: Selene (VRoid), ejderha, şövalye heykeli, saç GLB'si gömülü. Kökteki `assets/models/*.glb` (hero, fox, dragon, anim klipleri) Ay Kılıççısı'na bağlanmadı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, timsah, ejderha, goblin türleri. Geyik/kuş/at yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme/evcilleştirme var; diğer türler için yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, savuşturma, envanter, seviye, yetenek); hava durumu, yetenek ağacı yok |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik düzen + kalite ayarı var; HUD düzenleyici, gerçek cihaz FPS ölçümü yok |

## Tamamlananlar

_(Henüz listedeki hiçbir özellik tamamen bitmiş sayılmıyor.)_

## Çalışma günlüğü

### 2026-11-24
- PROGRESS.md oluşturuldu; depo incelendi (açık issue yok, çalışma ağacı temizdi).
- Özellik 1 incelendi: erkek kahraman zaten var ve iyi görünüyor → "var, cila sürüyor" olarak işaretlendi, tamamlandı denmedi.
- **Özellik 2 ilerletildi**, yeni `ay-kiliccisi/src/32-anim.js`:
  - **Arazi ayak IK'sı:** her ayağın altındaki gerçek zemin yüksekliği okunuyor; iki kemikli bacak IK'sı ayağı yere oturtuyor,
    kalça alçakta kalan ayak kadar iniyor, ayak tabanı zemin eğimine göre yatıyor (en fazla ~29°). Yerdeyken açık; zıplama,
    kaçınma, yere düşme, suikast vb. hâllerde yumuşakça kapanıyor. Eğimde iki ayak arasındaki yükseklik hatası 6,9 cm → 0,1 cm.
  - **Yürüyüş katmanı:** adım başına kalça salınımı ve iki kez iniş-çıkış, dönüşte gövdenin dönüşün içine yatması,
    hızlanırken öne / yavaşlarken arkaya eğilme, başın ufka sabit kalması.
  - **Bekleme:** nefes alma (göğüs + omuzlar), yavaş ağırlık aktarma (bir dizden diğerine), hafif bakınma.
- Testler: 6 yeni mekanik testi (`test/mech-tests.js` bölüm 13) → mekanik 53/53, döngü 71/71, dokunmatik 7/7.
  Not: `s-ui` içindeki kayıt testi bir kez zamanlamaya bağlı başarısız oldu, tekrar iki çalıştırmada geçti (kararsız test, değişiklikle ilgisiz).
- Yeni ekran görüntüsü senaryosu: `test/s-footik.js` (eğimde IK kapalı/açık).

## Sonraki öncelikler
1. Özellik 2 devam: kahraman için anahtar kareli klip sistemi (zaman çizgisi + yumuşak geçiş), saldırı/kaçınma pozlarını kliplere taşımak; aynı ayak IK'sını kurt/goblin/NPC'lere uygulamak.
2. Özellik 1 cila: miğfer altı yüz / zırhsız görünüm, zırh doku detayı.
3. Özellik 3: kökteki `assets/models` GLB'lerinin (tilki, hero anim klipleri) Ay Kılıççısı'na aktarılması.
4. Kararsız kayıt testini (`s-ui`) kaydı doğrudan çağıracak şekilde sağlamlaştırmak.
