# PROGRESS — otomatik geliştirme turu

Bu dosyayı zamanlanmış görev her çalıştığında okur ve günceller. Oyunun ayrıntılı yol haritası ve
oturum günlüğü `ay-kiliccisi/PROGRESS.md` içinde; burası yalnızca aşağıdaki 7 ana özelliğin durumunu tutar.
Oynanan oyun: kökteki `index.html` (= `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası). Eski oyun: `yaban.html`.

## Tamamlananlar
_(Henüz tam bitmiş ana özellik yok. Bir özellik ancak gerçekten bittiğinde buraya taşınır.)_

## Ana özellikler (öncelik sırası)
1. [ ] **Kaliteli erkek kahraman (Kael, Kara Zırh)** — SDF heykel modeli oyunda (58 kemik, ~23k üçgen).
   Kalan: kask vizörünün alt kenarı (nefes yarıkları) hâlâ pürüzlü; dizlik/kolçak ayrıntısı; zırhsız yüz yok
   (hikâye sahneleri için); uzak mesafe LOD.
2. [ ] **Gerçekçi 3B karakter animasyonu** — pozlar kodla (eklem açısı + IK). Anahtar kareli klip sistemi + harmanlama yok.
3. [ ] **Gönderilen GLB modellerin entegrasyonu** — ejderha, elf gövdesi (kraliçe), saç GLB'si entegre;
   berserk_armor / kawaiope / aldrich / gwyndolin yalnızca iskelet oranı olarak kullanılıyor.
4. [ ] **Çok sayıda hayvan ve yaratık** — kurt, goblin (3 tür), timsah, ejderha. Eksik: geyik/kuş, iskelet, örümcek, golem, hortlak.
5. [ ] **Yaratık evcilleştirme ve yapay zekâ** — görüş/uyarı yapay zekâsı ve Veyra yoldaşı var; Ay Kılıççısı'nda evcilleştirme yok (yalnızca eski `yaban.html` oyununda).
6. [ ] **Açık dünya, dövüş, envanter, ilerleme** — büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/ekipman).
   Kalan: harita genişletme, zindanlar, NPC rutinleri, lonca.
7. [ ] **Android performansı ve mobil kontroller** — dokunmatik PlayStation düzeni, 30 m ötesi dış çizgi kapalı. Gerçek cihazda test edilmedi; HUD düzenleyici ve grafik ayarları yok.

## Bu tur (2026-11-24) — özellik 1: kahraman zırhı yeniden tasarımı, 1. adım
- Göğüs zırhı "kaslı zırh" oldu: kabarık göğüs plakaları, ortada bronz omurga (keel), karın üstünde
  sivri uçlu ikinci plaka (plackart) + bronz kenar + 6 perçin.
- Bacaklar artık silindir değil: uyluk plakası kas hacmini izliyor (ön sırtı eğri), baldırlık arkada baldır
  kabarıklığıyla şişiyor, alt ve üst kenarda bronz bant; diz üstü bronz bant.
- Kask nefes yarıkları 3→2, voksel boyutundan geniş (yırtılmayı azaltmak için).
- Model: 20 996 → 23 122 üçgen. Yalnızca `hero` yeniden üretildi; diğer modeller `data/models.js`'den aynen alındı.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-perf hatasız. Oyun içi görüntüler `s-hero.js` ile kontrol edildi (koşarken deri düzgün).

## Sıradaki öncelikler
1. Özellik 1 devam: kask vizör alt kenarını temizle (bevor ile birleşim), tasset alt bronz bandındaki testere görünümü,
   kolçak/dizlik ayrıntısı; sonra zırhsız Kael başı (hikâye panelleri).
2. Özellik 2: kahraman için anahtar kareli animasyon klipleri (yürüme/koşu döngüsü, saldırı) + harmanlama.
3. Özellik 4: geyik ve kuş (dünya canlılığı), ardından iskelet/örümcek.

## Not (bakım)
`tools/sculpt/cache/` git'te yok. Tek model yeniden üretmeden önce önbelleği `data/models.js`'den doldur,
yoksa `build.mjs` diğer modelleri dosyadan siler:
`node -e 'const fs=require("fs"),z=require("zlib");for(const m of fs.readFileSync("data/models.js","utf8").matchAll(/^(\w+):"([^"]+)"/gm))fs.writeFileSync("tools/sculpt/cache/"+m[1]+".bin",z.gunzipSync(Buffer.from(m[2],"base64")))'`
(`ay-kiliccisi/` içinde, `mkdir -p tools/sculpt/cache` sonrası).
