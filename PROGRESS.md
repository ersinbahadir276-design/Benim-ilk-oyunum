# PROGRESS — Yaban Yoldaşları

Otomatik geliştirme oturumlarının ilerleme kaydı. Her çalıştırma buradan devam eder.

## Tamamlananlar (Completed)

_Henüz tamamen bitmiş ana özellik yok. Aşağıdaki ana özelliklerin hepsi kısmen var; ayrıntı "Durum" bölümünde._

## Ana özelliklerin durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | 🟡 Büyük ölçüde | VRoid anime avatarı + toon gölgeleme; **bu çalıştırmada** saç/palto fiziği, yüz ifadeleri, baş bakışı eklendi. Eksik: kişiselleştirme, ağız/konuşma hareketi, ayak IK. |
| Gerçekçi 3B karakter animasyonları | 🟡 Kahramanda iyi | Kahraman: Quaternius kliplerinin retarget'ı, crossfade. Prosedürel hayvanlarda ayak–zemin IK yok (ayak kayması). |
| Gönderilen GLB modellerin entegrasyonu | 🟡 | Gönderilen tek model (ejderha) bağlı. Ejderha `fly2` klibi kullanılmıyor (uçuş yok). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| Çok sayıda hayvan ve yaratık | 🟡 | 14 tür var; 12'si kodla üretilmiş düşük poligonlu model. |
| Evcilleştirme ve yapay zekâ | 🟡 Büyük ölçüde | Türe özgü yöntemler, yoldaş takip/savaş/açlık. Eksik: yoldaş komutları (saldır/hedef seç), yoldaş seviyesi. |
| Açık dünya, savaş, envanter, ilerleme | 🟡 | Dünya/bölgeler, kılıç kombosu, envanter var. **Eksik: kayıt (save), XP/seviye ilerlemesi, görevler, gece/gündüz.** |
| Android performansı ve mobil kontroller | 🟡 | Dokunmatik kontroller var. Eksik: kalite ayarları (gölge/çözünürlük/çizim mesafesi), FPS ölçümü, LOD. |

## Çalıştırma günlüğü

### 2026-11-14 — Kahraman: VRM ikincil sistemleri
- `src/vrm-extras.js` (yeni): VRM 0.x uzantısını doğrudan okuyan
  - **SpringBones**: 34 eklem (7 saç grubu + palto eteği), merkez uzayında Verlet benzetimi, gövde/kol/baş çarpıştırıcıları.
    Model verisindeki sorun düzeltildi: palto grubunun sönümü 0 ve çarpıştırıcısı yoktu → koşarken 175°'ye kadar savrulup bacaklardan geçiyordu. En az sönüm (0.2), salınım konisi (palto 43°, saç 63°) ve uyluk küreleri eklendi; depar sırasında azami sapma ölçülerek doğrulandı.
  - **Face**: blendShape gruplarını morf hedeflerine bağlar; rastgele göz kırpma, saldırıda öfke, hasarda/ölümde acı, evcilleştirmede sevinç.
  - **HeadLook**: boyun+baş, 9 m içindeki en ilgili hayvana (tehdit > yoldaş > diğer) sınırlı ve yumuşatılmış dönüş.
- `src/hero.js`: sistemler yüklenip `hero.post(dt, ...)` olarak dışa açıldı; `src/player.js` animasyondan sonra çağırıyor.
- `test/model-viewer.js`: kahraman görüntüleyicisinde fizik açık (`&nophys=1` ile kapatılır).
- Testler: 7 yeni test (yay kemikleri, palto sallanması, patlamama, göz kırpma, öfke, acı, baş bakışı). **58/58 geçti**, konsol hatası yok.

## Sonraki öncelikler
1. **Animasyon**: prosedürel hayvanlara ayak–zemin IK (eğimde ayak kayması); kahramana eğimde ayak IK ve hasar alma (hit-react) tepkisi.
2. **GLB**: ejderhaya uçuş (`fly2` klibinin kök hareketini ayıklayıp döngüye çevirmek).
3. **İlerleme**: localStorage kayıt sistemi (envanter, yoldaşlar, konum), XP/seviye.
4. **Mobil**: kalite ön ayarları ve otomatik FPS'e göre düşürme.
