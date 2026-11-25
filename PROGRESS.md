# PROGRESS — otomatik geliştirme turları

Bu dosyayı zamanlanmış geliştirme görevi tutar. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` onun derlenmiş kopyası).
Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski deneme oyunu: `yaban.html` + `src/` (three.js).

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js` (s-mech, s-loop, s-stance, s-ui, s-anim, s-perf)

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var** — Kael (SDF heykel, 21k üçgen, PBR malzeme). Açık: kullanıcının istediği zırh yeniden tasarımı (tasarım yönü belirtilmemiş, onay bekliyor) |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — tur 1: hareket klipleri; tur 2: zıplama/iniş/darbe; tur 3: ileri takla. Açık: kılıç saldırısı alt gövdesi, yan/geri kaçınma, ölüm, koşuda uçuş fazı, ayak IK'sı |
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

## Sıradaki öncelikler
0. **Dalları birleştir (kullanıcı):** en güncel dal `ccr-70a30f22-18esij` (tur 1+2+3); sonraki tur bunun üstüne kurmalı. Bu dal `main`'e birleştirilmezse sonraki tur yine
   sıfırdan başlar. Ayrıca ayak IK'sı (`ccr-70a30f22-8467z2`, `-29vp0a`, `-irc6qg`, `-miihkf`) ve pelerin fiziği (`-4zcmw1`) başka
   dallarda bitmiş durumda — tekrar yazmak yerine bunlardan biri seçilip birleştirilmeli.
1. **Animasyon (devam):** `hero_anims2.glb` kılıç kliplerinden (Sword_Regular_A/B/C) saldırılarda yalnızca alt gövde + gövde dönüşü;
   `Death01` (şu an ragdoll model matrisi devirmesi — klip ile çift dönüş olmaması için devirme açısı klipte olmalı);
   yan kaçınmalar hâlâ model matrisiyle fıçı dönüşü (`P.roll`), geri kaçınma prosedürel; s-ui'deki kararsız zamanlama testini oyun saatine bağla.
2. Koşuda uçuş fazı: şu an en alttaki ayak hep zemine sabitleniyor (sıçrama kaybolur) — yalnızca temas karelerinde sabitle.
3. Kahraman: zırh yeniden tasarımı için kullanıcıdan yön/referans gerekiyor; o gelene kadar yüz/miğfer çıkarma seçeneği düşünülebilir.
4. Yaratıklar: yaban.html'deki 14 türü (tavşan, geyik, at, tilki, ayı, aslan, kaplan, yılan, kartal…) Ay Kılıççısı'na taşı;
   `fox.glb` (iskeletli, animasyonlu) ilk aday.
5. Android: dokunmatik düzen ve kalite ayarı (gölge/çizgi/çizim mesafesi) gerçek cihaz geri bildirimiyle.
