# PROGRESS — Ay Kılıççısı: Kara Zırh

Her oturumun başında bu dosyayı oku, kaldığın yerden devam et. Oturum sonunda güncelle.
Teslim edilen oyun: `dist/ay-kiliccisi.html` (tek HTML). Kaynak: `src/` + `data/`, birleştirme `python3 tools/build.py`.
Testler (Playwright + yazılımsal WebGL): `NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`
- `s-mech.js` → aşama 1 mekanikleri (47 test, `mech-tests.js`)
- `s-loop.js` → aşama 2 oynanış döngüsü (71 test, `loop-tests.js`)
- `s-ui.js`, `s-save.js`, `s-portrait.js`, `s-perf.js` → dokunmatik, kayıt, dikey ekran, performans
- `s-p2shots.js`, `s-p2portrait.js` → ekran görüntüleri (`test/out/`)
Hikâye ve karakterler: `SENARYO.md`. Yayın: claude.ai artifact XSyZ8dWNspYrNFxSMeMqp4 (aynı adrese güncellenir).

## Tasarım kararları (oyun yönetmeni notları)

**Neden 3 saat kalır?** Her bölgenin bir hikâye sebebi, bir mini boss'u, saklı sandıkları ve bir sunağı var.
Oyuncu bir sonraki bölgenin daha tehlikeli olduğunu görür (düşman seviyesi bölgeye bağlı), ama oradaki
ödülü de görür (nadir sandık, efsanevi eşya, yeni yetenek). Ölüm cezası küçük ama hissedilir (altın kesesi
ölünen yerde kalır, geri alınabilir), böylece tekrar denemek ister.

**Çekirdek döngü:** Keşfet (sunak, sandık, iz, olay) → Tehlike (bölge düşmanı, gece yaratığı, elit) →
Savaş (okunur hazırlık, kaçın/blok/savuştur, duruş kırma, İNFAZ) → Ödül (eşya, altın, XP, malzeme) →
Güçlen (seviye, stat, ekipman, yetenek, demirci) → Daha tehlikeli bölge (hikâye kapısı açılır).

**Savaşın kalbi:** Her düşmanın bir *duruş* (denge) çubuğu var. Saldırılar, özellikle ağır saldırı ve
savuşturma, duruşu kırar; kırılan düşman sendeler ve **İNFAZ** ile bitirilir. Zorluk can şişirerek değil,
davranışla gelir: kurt yan yan dolanıp aldatır, goblin kaçıp yardım çağırır, büyük goblin geniş savurur,
boss'lar aşama değiştirir. Alan saldırıları yerde kırmızı halka ile menzilini gösterir. **Öfke** (Berserk)
çubuğu vurdukça ve vuruldukça dolar; dolunca zırh kızarır: daha çok hasar, sendelememe, duruş kırma ×1.5;
bitince 3 sn nefes nefese kalırsın (bedeli var) ve zırh fısıldar (hikâye).

**İlerleme:** Seviye + stat (Güç, Çeviklik, Dayanıklılık), 4 ekipman yuvası (Silah, Zırh, Tılsım, Yüzük),
5 nadirlik (Sıradan, Sağlam, Nadir, Destansı, Efsanevi), 6 isimli efsanevi (boss/sır ödülü, oyun tarzını
değiştirir: kanatma, duruş, ateş izi, savuşturma penceresi, öfke ×2, kor patlaması), demircide +1..+5.
Yetenekler yeni hareketlerdir: Dönen Kesik (Sv.3 / Kül Yele), Savaş Kükremesi (Kırık Diş), Gölge Adımı (Sv.6),
Yer Yaran (Sv.10 / Veyra'nın güveni 40).

**Yapay zekâ:** Her canlı kendi önünü görür (görüş konisi + görüş hattı), grubunu uyarır. Kavgada 4 m
içindekini görmese de duyar. Veyra fayda puanlamasıyla karar verir (iyileştir / kaçın / alev patlaması /
uzak ateş / yakın kesik / yaklaş / takip), konuşur, güveni artar; önünde saldırıya hazırlanan düşmanın
vuruşu ona da değer, yere düşerse ETKİLEŞ ile kaldırılır.

## Yol haritası

### Aşama 1 — tamamlandı
- [x] Dövüş temeli: hafif/ağır/koşu/zıplama saldırısı, 4 yönlü kaçınma, blok + savunma canı + savuşturma
- [x] Kurt atlayışı, ragdoll, parça tutma; goblinler; timsah; sessiz alt etmeler; ejderha deseni
- [x] 2,8 km harita, bölgeler, köy NPC'leri, görüş sistemi, 47 mekanik testi

### Aşama 2 — tamamlandı (oturum 2–3)
- [x] Selene kaldırıldı → Kara Zırhlı kahraman Kael (berserk_armor iskeletinin oranları, model tamamen bize ait)
- [x] Dev kılıç (eşyaya göre boy/renk/ışıma), iki elle ağır vuruşlar
- [x] Ganimet: nadirlik, özellikler, isimli efsaneviler; düşmanlardan ve 39 sandıktan düşer, ışık sütunu, otomatik toplama
- [x] Sistem penceresi 7 sekme: Durum, Envanter (kuşan/parçala), Yetenek, Görev, Harita, Demirci, Ayar (+lisanslar)
- [x] 9 sunak: kontrol noktası, iyileşme, iksir dolumu, düşmanlar geri gelir, hızlı yolculuk; ölünce altın kesesi
- [x] İksir düğmesi (3 şişe, sandık/rahibe ile 6'ya kadar)
- [x] Duruş çubuğu + İNFAZ; Öfke (Berserk) modu
- [x] Hedef kilidi (HEDEF düğmesi)
- [x] Bölge seviyeleri (krallık 1 … ejder yuvası 18)
- [x] Yetenek düğmesi + 4 yetenek
- [x] Mini boss: Alfa Kurt «Kül Yele» (uluma → sürü), Goblin Şefi «Kırık Diş» (3 saldırı, yere vurma halkası, boru → kamp)
- [x] Manhwa panelli hikâye: önsöz, 1. ve 2. bölüm, kafesler, prenses (seçim), Kül Yele ve ejderha sonu
- [x] Veyra (boynuzlu iblis kız): kendi modelimiz, yoldaş yapay zekâsı, serbest bırak / öldür seçimi
- [x] Ana görev zinciri (10 adım) + köyde görev veren NPC'ler (Doran, Hask, Lena, Mira) + 2 yan görev
      (Lena: 3 kurt postu → kurt postu zırh; Mira: Ustanın Mirası, 3 mühür → «Aldren'in Yemini»)

### Aşama 2.5 — görsel kalite (oturum 4, kullanıcı: "modeller silindir olmasın, Play Store kalitesi")
Yöntem: `tools/sculpt/` — modeller işaretli uzaklık (SDF) "kili" ile heykel gibi yapılır: elipsoid/koni/kutu/kabuk,
yumuşak birleşim, kesme düzlemleri, gürültü ile kürk/kumaş. Voksel ızgara (5 mm) → yüzey ağları → yüzeye izdüşüm →
meshoptimizer sadeleştirme (~20k üçgen) → köşe başına: SDF normali, malzeme rengi + gürültü + kenar aşınması +
oyuk kiri + gömülü gölge (AO), malzeme kanalı (parlaklık, metal, ışıma, renklenebilir), 4 kemik ağırlığı.
Çıktı: `data/models.js` (gzip+base64), oyunda `decodeModels()` (10-engine.js) açar → `MODEL[ad]`.
Çalıştırma: `cd tools/sculpt && npm install` (bir kez), sonra `node --max-old-space-size=6000 tools/sculpt/build.mjs [ad]`.
İskeletler: `test/s-skel.js` oyundan `tools/sculpt/skeletons.json` üretir. İnceleme: `node test/view.js <ad> <çıktı>`.
Motor: 4 ağırlıklı GPU deri (aJ/aK vec4), malzeme kanalı aM, `obj({pbr:1})` → yeni ışık (gök/zemin ortamı,
metal parlaması, yansıma, ışıma `ob.em`, metal renklendirme `ob.tintM`).
- [x] Model hattı + görüntüleyici
- [x] Kahraman Kael heykel modeli oyunda (CPU deri, 58 kemik, ~21k üçgen)
- [x] İnsan türleri (köylü ×2, tüccar, muhafız, Doran, Hask, Lena, Mira): `lib/humanoid.mjs` + `models/*.mjs`,
      A-duruş bağlama (omuz rZ ±.55, kalça rZ ±.06 = oyundaki HBIND; rigDraw sonrası kemik = W·Bind⁻¹, `bindInv/applyBinv`).
      Yüzler boyalı doku (`FACES` + `faceTex` 45-rig.js), önden izdüşüm UV + maske (aW kanalı) — gözler üçgen sayısından bağımsız keskin.
- [x] Goblin, büyük goblin (şef aynı model + renk), Şeytan Kral (boynuz taç, yanan gözler, dikenli omuz, pelerin, kuyruk)
- [x] Kurt: tek deri, 12 kemik (drawWolves parça matrisleri × T(-bind)); 13 çizim yerine 1
- [x] Veyra (20 kemik: saç, etek ön/arka, kuyruk, saç2; kızıl göz, yarık göz bebeği, diş), timsah (16 kemik)
- [x] Kılıç heykeli (siper, oluk, mücevher, sargı); boy/genişlik eşyaya göre, bıçak rengi `tintM`
- [x] 30 m ötesinde dış çizgi çizilmiyor (telefon performansı)
- [x] Şeytan Kral = kadın hükümdar. Kullanıcı isteği: elf modelinin kendisi (body_base_low_poly_elf, Yamato, CC BY 4.0) + sadece boynuz, saç, sade elbise; normal boy (KING.sc=1).
      `tools/sculpt/import_elf.mjs <elf.glb>` eklemleri ölçer, 16 kemiğe oturtur, cache/king.bin + king_rig.json yazar (K ve BINDS.king oyuna elle kopyalandı).
- [~] Oturum 8 (otomatik tur): kahraman zırhı 1. adım — kaslı göğüs (göğüs plakaları, bronz omurga, sivri plackart + perçin), kas hacimli uyluk plakası, baldır kabarıklıklı baldırlık + bronz bantlar, kask nefes yarıkları 2'ye indi (hero 23k üçgen). Kalan: vizör alt kenarı, tasset bandı, kolçak/dizlik.
- [ ] Sıradaki (kullanıcı istedi): kahraman zırhını yeniden tasarla (devam ediyor, yukarı bak); Arknights tarzı kız (Kawaiope iskeleti); köylüleri yeni iskelet/görünüşe geçir; kurtları wolf_puppy iskeletine geçir
- [x] Oturum 5: kurtlar sersemletme kilidine girmiyor (saldırırken vurulsa da sürdürür, 2. vuruşta geri sıçrayıp karşı saldırı); ok sistemi (59-arrows.js): goblin okçular (her kampta 1 + yol devriyelerinde 2), kahramanın yayı (YAY / B), 3 yol devriyesi köy yakınında; kraliçe saçı/perçemi/yüzü (manhwa göz, kaş, burun, ağız)
- [x] Oturum 6 (Master Directive, ANALIZ.md; tema kara fantezi KALIYOR, savaş Ghost of Tsushima/Sekiro tarzı): AŞAMA 1 başladı — 51-stances.js: 4 duruş (Taş başlangıç; Rüzgâr 5 kurt; Ay Kül Yele; Su Kırık Diş), duruş avantajı (hasar ×1.25, denge ×1.8), kusursuz kaçınma (0.2 sn pencere → yavaş çekim + karşı saldırı ×1.8; ileri kaçınma = KARŞILAMA), zincir savuşturma, saldırı iptali, iksir bitince 40 öfke ile iyileşme. Hata: kurt yakalamışken vurulma, ok itmesi. Kraliçe: kullanıcının saç GLB'si (import_hair.py), etek kaldırıldı. Test: s-stance.js 11/11.
- [x] Oturum 7: suikast (△ arkadan, 51-stances.js), okçu isabeti insan gibi, PlayStation düğme düzeni (□ hafif, △ ağır, ✕ zıpla, ○ kaçın, L1 blok, R1 etkileş, R2 duruş, L2 yay). Su hatası: kıyı setleri (hRaw) + su diskleri küçültüldü. Hikâye (kullanıcı isteği): Kael sıradan maceracı, Şeytan Kraliçe ile kişisel bağı yok, 'son şövalye' değil. DÜNYA 1 (21-scenery.js): kamerayı izleyen karlı dağ halkaları, 1500 kaya, 5200 çalı (ağaç parçalarında k=6), 6 çitli tarla + saman, yel değirmeni (dönen kanat), nehir başında şelale. Site: kök index.html = oyun (dist kopyası), eski oyun yaban.html; main'e PR.
- [ ] DÜNYA DİREKTİFİ sırası (kullanıcı): 2) harita/bölge genişletme (karlı dağ bölgesi, liman, kasaba; WS büyütmek gerek) 3) yaşayan köyler/NPC rutinleri, han, pazar 4) Maceracılar Loncası: kayıt, rütbe F→S, görev panosu 5) AYRI zindan haritaları (çok katlı, tuzak, bulmaca) 6) zindan yaratıkları (iskelet, örümcek, golem, lanetli şövalye…) 7) ekipman türleri + Mitik nadirlik 8) görev/gizem 9) ilişki altyapısı (kişilik, hafıza, güven) 10) optimizasyon. Krallık büyütülecek (referans: katmanlı şehir + saray).
- [ ] AŞAMA 1 kalan: oyuncu denge çubuğunu 'Denge' olarak göster, duruşlara özgü pozlar (hamle/saplama), kombo bitirici efektleri, yönlü saldırı; AŞAMA 2: kalkanlı/mızraklı/suikastçı/elit düşmanlar, boss girişleri
- [ ] SIRADAKİ (kullanıcı istedi): haritayı büyüt + farklı bölgeler; mağara; büyük zindan + uzun zindan kulesi (katlar, boss); daha çok yaratık türü ve olay (manhwa RPG: iskelet, hortlak, örümcek, golem, gece baskını)
- [ ] Dünya: ağaç, kaya, ev, kale (hâlâ eski düşük poligon) — sıradaki iş
- [ ] Uzak mesafe LOD (ikinci, daha az üçgenli model) — köy kalabalığında gerekirse
- [ ] Şeytan Kral'ın kolları ince; aşama 3 boss dövüşünde iyileştirilecek

### Aşama 3 — sonraki oturumlar (öncelik sırası)
- [ ] Şeytan Kral Azgal: savaşılabilir model (aldrich iskelet oranları), Kül Kale bölgesi, 3 aşamalı final
- [ ] Ejderha 2. aşama (öfkeli) + Kül Kanat sonrası manhwa
- [ ] Yılan Rahibe boss'u (gwyndolin iskeleti), bataklık tapınağı zindanı
- [ ] Gece yaratıkları (hortlak/iskelet), rastgele olaylar (pusu, kervan, kayıp çocuk), nadir yaratık Ak Kurt
- [ ] Gizli zincirler: Ak Kurt, Soluk Avcı (SENARYO.md)
- [ ] Veyra'yı öldürme yolunun devamı (Hırlayan konuşmaları, farklı son)
- [ ] Set bonusları, evcil yaratık güçlendirme ağacı
- [ ] Mağaralar (gizli geçitler)
- [ ] Veyra yüzü: şimdiki doku düz; daha ifadeli yüz ve göz animasyonu
- [ ] Kamera ağaç tacının içine girince saydamlaştırma

## Bilinen sorunlar / test edilemeyenler
- Gerçek Android cihazda dokunma, titreşim ve gerçek GPU performansı test edilemedi (yazılımsal WebGL ile ölçüldü).
- Ses yalnızca kodla üretiliyor (WebAudio); kulakla dinlenemedi.
- Manhwa panelleri oyun motoruyla çizilir; ilk açılışta 1–2 sn "Sahne çiziliyor…" görünür.
- Eğimli zeminde büyük tehlike halkası yer yer zemine gömülebilir.

## Modeller (yalnızca iskelet oranları alındı)
| Kaynak dosya | Kullanım | Durum |
| --- | --- | --- |
| berserk_armor.glb (Angy97, CC BY 4.0) | Kahramanın iskelet oranları | iskelet var (83 kemik) |
| kawaiope.glb (chained_tan, CC BY 4.0) | Veyra'nın iskelet oranları + saç/etek/pelerin kemikleri | iskelet var (92) |
| aldrich_devourer_of_gods.glb (9S, CC BY 4.0) | Şeytan Kral oranları (kuyruk zinciri) | iskelet var (166) |
| dark_sun_gwyndolin.glb (9S, CC BY 4.0) | Yılan Rahibe (yılan kuyruk zincirleri) — aşama 3 | iskelet var (545) |
| arknights_endfield_-laevatain-.glb | — | iskelet yok; Veyra kendi tasarımımız |
| body_base_low_poly_elf.glb | — | iskelet yok |
| momonga_ainz_ooal_gown.glb (CC BY-NC) | — | iskelet yok |
| mita_miside_free.glb (CC BY-NC-ND) | kullanılmıyor | iskelet yok, değiştirme yasak |
| tarisland dragon (yeni zip) | aynı ejderha | önceki dosyayla birebir aynı |

## Oturum günlüğü
- Oturum 2: tasarım belgesi, PROGRESS.md, SENARYO.md; Kara Zırh kahramanı; ganimet, sunak, sandık, duruş/İNFAZ,
  öfke, yetenekler, hedef kilidi, bölge seviyeleri, bosslar, Veyra, hikâye modülleri yazıldı.
- Oturum 4: kullanıcı modelleri çok kötü buldu → SDF heykel hattı; kahraman, 8 insan, goblinler, kurt, Veyra, timsah, Şeytan Kral, kılıç yeniden yapıldı; yeni ışık.
- Oturum 3: hepsi birleştirildi ve test edildi. Yeni düğmeler (İKSİR, YETENEK, HEDEF, ÖFKE) + yatay/dikey yerleşim,
  öfke çubuğu, boss adı + duruş çubuğu, hızlı yolculuk, manhwa görünümü (sabit oranlı paneller, sıra kuyruğu),
  görev pusulası, yeni sesler. Düzeltilenler: açılış sırası (Veyra/hikâye), kese ve mühür toplama artık oyun
  adımında, kavgada 4 m algı, Veyra'ya düşman vuruşu, Kırık Diş yere vurma halkası. s-loop.js 71/71.
