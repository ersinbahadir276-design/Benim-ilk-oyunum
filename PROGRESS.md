# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin izleyicisidir. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı oyun günlüğü ve tasarım notları: `ay-kiliccisi/PROGRESS.md`, `ay-kiliccisi/ANALIZ.md`.

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik durumu (rutin listesi, öncelik sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var** — Kael «Kara Zırh», SDF heykel modeli (~21k üçgen, PBR malzeme kanalları, 58 kemik). Açık: kullanıcının istediği zırh yeniden tasarımı (yön/referans bekliyor). Tamamlandı sayılmadı. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor** — tüm pozlar prosedürel. Bu rutinde: arazi ayak IK'sı. Açık: anahtar kareli klip sistemi + harmanlama, duruşlara özgü pozlar, adım/hız eşleme, yürüme başlangıç/duruş geçişleri. |
| 3 | Gönderilen GLB modellerinin entegrasyonu | **Kısmen** — ejderha, elf gövdesi (kraliçe), saç GLB'si, şövalye heykeli oyunda. `assets/models/hero.glb` (VRoid) + Quaternius animasyonları yalnızca eski oyun `yaban.html`'de; Ay Kılıççısı'na aktarılmadı. |
| 4 | Çok sayıda hayvan ve yaratık | **Kısmen** — kurt, timsah, ejderha, goblin türleri. Geyik/kuş/zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen** — görüş konisi/uyarı AI'si, Veyra yoldaş AI'si, kurt besleme; Ay Kılıççısı'nda gerçek evcilleştirme sistemi yok (eski `yaban.html`'de var). |
| 6 | Açık dünya, dövüş, envanter, ilerleme | **Büyük ölçüde var** — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, ganimet, seviye/yetenek. Açık: harita genişletme, zindanlar (bkz. `ay-kiliccisi/PROGRESS.md`). |
| 7 | Android performansı ve mobil kontroller | **Kısmen** — dokunmatik PS düzeni, dikey/yatay, perf testi (yazılımsal WebGL). Gerçek cihazda test edilemedi; HUD düzenleyici yok. |

## Tamamlananlar
_(henüz rutin listesinden tamamen biten özellik yok)_

## Çalışma günlüğü

### 2026-11-17 — Rutin 1: arazi ayak IK'sı (özellik 2, kahraman animasyonu)
- Kök `PROGRESS.md` oluşturuldu; depo durumu ve özellik listesi değerlendirildi (açık issue/değişiklik yok).
- `ay-kiliccisi/src/32-footik.js` (yeni): Kael için arazi ayak IK'sı. Her ayağın altındaki zemin ve eğim örneklenir,
  pelvis alçak ayağa indirilir, her bacak iki kemikli zincir olarak (kalça→diz→bilek, diz öne) yeniden çözülür, ayak
  yokuşa göre eğilir. Havada, takla, ragdoll, suikast ve suda kapanır; geçişler yumuşatılır. Düzgünleştirilmiş poz
  (`P.ps`) değişmez, IK bir kopyada çalışır.
- `30-player-model.js`: ayak kemiği eğim açısı (`LfP/RfP`); `60-game.js`: `applyPose(footIK(P.ps,dt))`.
- Yeni test `test/s-footik.js` (5/5): %35 eğimde yana dururken IK kapalı ayak 8,2 cm havada → IK açık 2,4 cm;
  yokuş yukarı 0,2 cm; düz zeminde pelvis inmiyor.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5, s-ui 7/7, s-perf hatasız (mantık ≤0,19 ms/kare).

## Sıradaki öncelikler
1. Animasyon: kahraman için anahtar kareli klip sistemi (poz anahtarları + zaman eğrileri + çapraz harmanlama),
   önce boşta/yürü/koş geçişleri ve hafif kombo; adım uzunluğu–hız eşleme (ayak kayması).
2. Animasyon: ayak IK'sını köylü/muhafız/goblin gibi insansı NPC'lere genişletmek.
3. Kahraman: zırh yeniden tasarımı — kullanıcıdan referans/yön gerekli.
4. GLB: `assets/models/hero_anims*.glb` (Quaternius, CC0) kliplerini Kael iskeletine aktarmayı değerlendirmek.
