# PROGRESS — otomatik geliştirme turları

Bu dosyayı zamanlanmış geliştirme görevi tutar. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` onun derlenmiş kopyası).
Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski deneme oyunu: `yaban.html` + `src/` (three.js).

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js` (s-mech, s-loop, s-stance, s-ui, s-anim, s-perf)

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var** — Kael (SDF heykel, 21k üçgen, PBR malzeme). Açık: kullanıcının istediği zırh yeniden tasarımı (tasarım yönü belirtilmemiş, onay bekliyor) |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — tur 1: hareket klipleri; tur 2: zıplama/iniş/darbe; tur 3: ileri takla; tur 4: hafif kombo kılıç klipleri; tur 5: ölüm klibi. Açık: ağır/koşu/zıplama saldırısı, yan/geri kaçınma, koşuda uçuş fazı, ayak IK'sı |
| 3 | Gönderilen GLB modellerin entegrasyonu | **Kısmen** — elf gövdesi, saç, ejderha, Quaternius klipleri oyunda. `hero.glb` (VRoid) ve `fox.glb` yalnızca eski yaban.html'de |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin, okçu, büyük goblin, timsah, ejderha (yaban.html'de 14 tür, Ay Kılıççısı'nda henüz yok) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — kurt besleme, görüş/uyarı yapay zekâsı, Veyra yoldaşı |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ekipman/demirci) |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PlayStation düzeni, 30 m ötesi dış çizgi kapalı. Gerçek cihazda test edilemedi |

## Tamamlananlar

### Tur 1 — 2026-11-25: gerçek hareket klipleri (özellik 2 + 3)
- `tools/anim/import_clips.mjs`: three.js olmadan GLB okuyucu; `assets/models/hero_anims1.glb` (Quaternius Universal Animation Library, CC0)
  içinden 6 döngüyü (Idle, Walk, Jog, Sprint, Crouch Idle, Crouch Walk) 30 fps örnekler, T-pozdan dünya-uzayı fark dönüşü
  olarak Kael'in 58 kemikli iskeletine aktarır (22 kemik eşlenir; kılıç tutan sağ kol hariç 18'i oyunda sürülür).
  Her döngü sol ayak öndeyken başlayacak şekilde hizalanır; zemindeki ayaktan doğal hızı ölçülür. Çıktı `data/anims.js` (73 KB, int16).
- `src/32-anim.js`: klip katmanı. Hıza göre bekle→yürü→koş→depar (ve çömel-bekle→çömel-yürü) harmanlama, ortak adım fazı
  (bacaklar harmanlamada çaprazlanmaz), her klip kendi temposunda oynar. Kılıç kolu (sağ kol) prosedürel kalır, IK bozulmaz.
  Kaynak iskelet farkı için en alttaki ayak her karede zemine oturtulur. Saldırı/kaçınma vb. durumlarda katman yumuşakça kapanır.
- `test/s-anim.js` (11 test): klipler yüklü, durum→klip eşleşmesi, adım uzunluğu, faz ilerlemesi, ayak zeminde, çömelme kalça
  yüksekliği, saldırıda katmanın kapanması, NaN yok — 11/11.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (s-ui'deki iki zamanlama testi değişiklik öncesi sürümde de
  ara sıra düşüyor: gerçek saat ile ölçüyorlar, yazılımsal WebGL'de kararsız). Performans değişmedi (s-perf, kare başı <0,3 ms mantık).
- Oyun içi lisans listesine Quaternius (CC0) eklendi.

### Tur 2 — 2026-11-25: eylem klipleri — zıplama, iniş, darbe (özellik 2 + 3)
- **Dal sorunu bulundu:** önceki zamanlanmış turların her biri `main`'den ayrı bir `ccr-…` dalı açıp tek commit itti ve hiçbiri
  birleştirilmedi; bu yüzden ilerleme birikmedi (ör. ayak IK'sı 4 ayrı dalda, zırh yeniden tasarımı 6+ dalda tekrar yapıldı).
  Bu tur, tur 1'in dalını (`ccr-70a30f22-6z1mbm`) kendi dalına birleştirip onun üstüne kurdu. Kalıcı çözüm: turların dallarını `main`'e birleştirmek.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den 4 tek seferlik klip daha: `Jump_Start`, `Jump_Loop`, `Jump_Land`, `Hit_Chest`.
  Tek seferlik klipler faz hizalamasına sokulmuyor. İçe aktarım sırasında kalça/ayak yükseklik profili yazdırılıyor (klip adlarının
  gerçek içeriğini görmek için: `Jump_Start` = çömel→kalk→bacak topla, `Jump_Loop` = havada toplu duruş, `Jump_Land` = derin diz kırma).
  `data/anims.js` 73 → 111 KB.
- `src/32-anim.js`: normalize zamanla oynatılan eylem klipleri (`ACTION_CLIP`). Zıplama: ayakların yerden kesildiği kareden (0,1 sn)
  başlayan kalkış, 0,4–0,6 sn'de havada döngüye geçiş. İniş: `Jump_Land`'in ilk 0,45 sn'si kısa iniş durumuna sığdırılıyor
  (zıplayarak saldırı inişi prosedürel kalıyor). Darbe: `Hit_Chest` 0,38 sn sendeleme süresine yayılıyor. Kılıç kolu yine prosedürel.
  Eylem kliplerine giriş/çıkış ~0,1 sn çapraz geçişle (`gaitBlend`), artık kliplerden yürümeye geçişte ani sıçrama yok;
  yürüme/koşu harmanlaması eskisi gibi anlık.
- `test/s-anim.js`: 11 → 19 test (kalkış klibi, havada döngü, zıplarken ayak zemine gömülmüyor, inişte kalça alçalıyor,
  inişten/darbeden sonra yürüme katmanına dönüş, NaN yok) — 19/19. Ekran görüntüleriyle havadaki toplu duruş ve darbe geri
  çekilmesi gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (bir koşuda 6/7: bilinen gerçek-saat zamanlama testi
  «SALDIR basılı tut», yeniden koşuda geçti; değişiklikle ilgisi yok).

### Tur 3 — 2026-11-25: ileri kaçınma = gerçek takla klibi (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-18esij`) tur 2'nin dalını (`ccr-70a30f22-lafz5x`, tur 1+2) birleştirip üstüne kurdu.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den `Roll` (1,47 sn) tek seferlik klip olarak eklendi. Profil: 0,04 sn çömelme →
  dalış (kalça 1,37 m) → sırt üstü yuvarlanma (kalça 0,06 m) → ~1,1 sn'de ayakta. `data/anims.js` 111 → 121 KB.
- `src/32-anim.js`: ileri kaçınmada (`dodgeKind==='fwd'`) `Roll`'un 0,04–1,1 sn arası kaçınma süresine (0,56 sn) yumuşak zamanla sığdırılıyor.
  Gövdenin ters dönüşü artık klipteki kalça dönüşünden geliyor; eski model matrisi dönüşü (`P.spin`) klip yoksa yedek olarak kalıyor.
  Takla sırasında «en alttaki ayağı zemine oturt» düzeltmesi kapalı (ayaklar havada); gövdenin zemine gömülmemesini
  `playerMatrix`'in yatık durum açıklık kontrolü sağlıyor. Kılıç kolu yine prosedürel; girişte/çıkışta ~0,1 sn çapraz geçiş.
- `test/s-anim.js`: 19 → 25 test (takla klibi seçiliyor ve model dönüşü kapalı, kalça başın 61 cm üstüne çıkıyor = gerçek ters dönüş,
  kalça yere iniyor, baş/gövde zemine gömülmüyor, sonra ayakta yürüme katmanına dönüş, NaN yok) — 25/25.
  `test/s-rollshots.js`: taklanın 5 karelik ekran görüntüsü (`test/out/roll-*.jpg`); dalış, omuz üstü yuvarlanma, kalkış gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf değişmedi (mantık ≤0,44 ms/kare). s-ui 6/7: «SALDIR basılı tut»
  testi bu turda iki kez düştü; değişiklik geri alınmış sürümde de aynı şekilde düşüyor (gerçek saatle 2,5 sn basılı tutunca yükleme
  kendiliğinden ağır saldırıya dönüyor) → var olan, bu değişiklikle ilgisiz kararsız test.

### Tur 4 — 2026-11-25: hafif kombo = gerçek kılıç klipleri (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-j9phxd`) tur 3'ün dalını (`ccr-70a30f22-18esij`, tur 1+2+3) birleştirip üstüne kurdu.
- `tools/anim/import_clips.mjs` artık iki kaynak okuyor: `hero_anims1.glb` ve `hero_anims2.glb`. İkincisinden 3 tek seferlik klip alındı:
  - `Sword_Regular_A`: sağdan sola kesik, sol ayak geri atılıyor, derin hamle duruşu.
  - `Sword_Regular_B`: o hamleden ters kesik.
  - `Sword_Regular_C`: dönerek sıçrayıp tepeden indirilen bitiriş.
  Eski 11 klip bayt bayt aynı kaldı. `data/anims.js` 121 → 142 KB. `PROFZ=1` ile çalıştırınca kliplerin sağ el hızı, ayak/kalça yerleşimi ve kalça dönüşü yazdırılıyor; vuruş anları buradan ölçüldü (A 0,25 sn, B 0,27 sn, C 0,66 sn).
- `src/32-anim.js`: saldırı durumunda duruşun kombo pozu klibi seçiyor (poz 0 → A, 1 → B, 2 → C; yani her duruşun kendi sırası korunuyor).
  - Klip zamanı bükülüyor: klibin en hızlı kılıç karesi oyunun vuruş anına (u≈0,36–0,4) denk geliyor, ardından savuruşun devamı geliyor. Saldırı süreleri ve hasar zamanlaması değişmedi.
  - C'nin ilk 0,3 sn'si atlanıyor; dönüşün son kısmı ve tepeden vuruş oynuyor.
  - Bu kliplerde sağ kol (kılıç kolu) da klipten geliyor. Bunun için kol kemikleri ayrı harmanlanıyor: yalnızca kılıç kliplerinin payı kadar (`CLIP.armW`), geri kalanı yine prosedürel. Böylece yürüme, zıplama vb. kliplerde kılıç kolu eskisi gibi.
  - C'nin havadaki kısmında «en alttaki ayağı zemine oturt» düzeltmesi kapalı.
- `src/55-player.js`: saldırı pozu artık `clipW` veriyor. İlk denemede bu eksikti ve klip hiç görünmüyordu; test bunu yakaladı.
- `test/s-anim.js`: 25 → 38 test. Yeni testler:
  - saldırıda kılıç klibi gövdeyi ve kolu sürüyor;
  - her kombo pozu doğru klibi seçiyor;
  - elin en hızlı anı vuruş penceresinde (u 0,36; el 31–46 m/s);
  - ayaklar zemine gömülmüyor, kalça hamlede 0,67–0,73 m'ye iniyor (ayakta 1,07 m);
  - NaN yok;
  - saldırıdan sonra yürüme katmanına dönülüyor ve kol yine prosedürel.
  Sonuç 38/38. `test/s-swordshots.js` 3 vuruşun 4'er karesini çekiyor (`test/out/sword-*.jpg`); gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7. s-perf'te mantık kare başına 0,11–0,26 ms, öncekiyle aynı düzeyde.
- Bilinen kusurlar:
  - Klipler tek elli kılıç için yapılmış. Kael'in dev kılıcı B'nin derin hamlesinde ve C'nin sonunda bıçak ucuyla zemine çok yaklaşıyor, yer yer zemine giriyor.
  - A'nın savuruş devamında kılıç başın arkasında dik kalıyor.
  - Ağır saldırı ve iki elli tutuş hâlâ prosedürel.

### Tur 5 — 2026-11-25: ölüm = gerçek düşme klibi (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-7zm4ho`) tur 4'ün dalını (`ccr-70a30f22-j9phxd`, tur 1+2+3+4) hızlı ileri sararak aldı ve üstüne kurdu.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den `Death01` (2,4 sn) tek seferlik klip olarak eklendi. Profil: sendeleme →
  0,6 sn'de dizler çöküyor (kalça 0,59 m) → 0,93 sn'de sırt üstü yerde (kalça 6 cm) → bacaklar ~1,4 sn'de duruluyor.
  `PROFZ=1` teşhisi artık ölüm klibini de yazdırıyor. Eski 14 klip bayt bayt aynı. `data/anims.js` 142 → 159 KB.
  (`Sword_Attack` de incelendi: 0,40 sn'de 37 m/s yatay kesik + adım; ağır saldırı tepeden iki elli olduğu için şimdilik alınmadı.)
- `src/32-anim.js`: `dead` durumunda `Death01` gerçek zamanda (×1,1) oynuyor, 2,2 sn'den sonra son pozda duruyor. Ölüm klibi
  tüm gövdeyi, kılıç kolu dahil sürüyor (`ARM_CLIPS`); düşerken «en alttaki ayağı zemine oturt» kapalı (gövdeyi zemin üstünde
  `playerMatrix`'in yatık açıklık kontrolü tutuyor). `clipHas(k)` yardımcı fonksiyonu.
- `src/55-player.js`: `die()` ayaktayken artık `knockDown` ragdoll eğimini başlatmıyor (yoksa klipteki düşüşle model matrisi
  eğimi üst üste binip çift dönüş olurdu): `P.deathClip` işaretlenir, eğim 0, hafif geri kayma. Yere çarpma anında (0,93 sn)
  gümleme sesi ve küçük kamera sarsıntısı. Zaten yerde yatarken ölünürse eski prosedürel ragdoll sürüyor. `respawn()` işareti siliyor.
- `src/60-game.js`: test için `die`, `knockDown` dışa açık.
- `test/s-anim.js`: 38 → 45 test (klip tüm gövdeyi ve kolu sürüyor, ragdoll eğimi 0, kalça 1,06 → 0,11 m / baş 0,11 m / göğüs
  kalçanın 48 cm gerisinde = sırt üstü, baş/gövde zemine gömülmüyor, NaN yok, yeniden doğunca ayakta yürüme katmanında,
  yerdeyken ölümde prosedürel ragdoll kalıyor) — 45/45. `test/s-deathshots.js`: 6 karelik ekran görüntüsü (`test/out/death-*.jpg`);
  sendeleme, geriye devrilme ve yerde yatış gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71 (3 ölüm/yeniden doğuş testi dahil), s-stance 11/11, s-ui 7/7; s-perf mantık 0,08–0,33 ms/kare (değişmedi).
- Bilinen kusur: yatarken pelerin gövdenin altında kalıp görünmüyor; düşerken kılıç gövdeyle birlikte savruluyor, elden bırakılmıyor.

## Sıradaki öncelikler
0. **Dalları birleştir (kullanıcı):** zamanlanmış turların her biri ayrı bir `ccr-…` dalına itiliyor ve hiçbiri `main`'e birleştirilmedi. En güncel birikmiş dal artık `ccr-70a30f22-7zm4ho` (tur 1+2+3+4+5). Bu dal `main`'e birleştirilmezse sonraki tur yine eski koddan başlar. Başka dallarda bitmiş işler de var: ayak IK'sı (`-8467z2`, `-p3ku0m`), pelerin fiziği (`-4zcmw1`), zırh denemeleri (`-tow8uj`, `-2wbxib`). Bunları yeniden yazmak yerine biri seçilip birleştirilmeli.
1. **Animasyon (devam):**
   - Kılıç ucu zemin çarpışması: savuruşta bıçak zemine girerse bileği ya da kalçayı düzelt.
   - Ağır saldırı için klip yok; `Sword_Regular_C`'nin tepeden vuruşu yavaşlatılıp ağır saldırıya da uygulanabilir (alt gövde + kalça; iki elli kollar prosedürel kalmalı). Şarj (`charge`) duruşu için `Sword_Idle` denenebilir.
   - Koşu saldırısı ve zıplama saldırısı.
   - Yan ve geri kaçınmalar: şu an model matrisiyle fıçı dönüşü ve prosedürel poz.
2. Koşuda uçuş fazı: en alttaki ayak yalnızca temas karelerinde zemine sabitlensin.
3. Kahraman: zırh yeniden tasarımı için kullanıcıdan yön/referans gerekiyor.
4. Yaratıklar: yaban.html'deki 14 türü Ay Kılıççısı'na taşı. İlk aday `fox.glb` (iskeletli, animasyonlu).
5. Android: dokunmatik düzen ve kalite ayarı (gölge/çizgi/çizim mesafesi), gerçek cihaz geri bildirimiyle.
