# PROGRESS — otomatik geliştirme oturumları

Bu dosya zamanlanmış görevin (her çalışmada bir özelliği ilerletir) kaydıdır. Asıl oyun **Ay Kılıççısı**
(`ay-kiliccisi/`, site açılışı `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası). Oyunun ayrıntılı yol
haritası ve tasarım notları: `ay-kiliccisi/PROGRESS.md`. Eski oyun «Yaban Yoldaşları»: `yaban.html` + `src/`.

Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Testler: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (SDF hattı, ~21k üçgen, PBR malzeme) var. Pelerin artık fiziğe göre hareket ediyor (bu çalışma). Kalan: kullanıcının istediği zırh yeniden tasarımı, kürk/saç ikincil hareketi |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen: tüm hareketler kodla (eklem açıları + kol IK). Anahtar kareli klip sistemi, ayak IK'sı yok |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen: ejderha, elf gövdesi (kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, timsah, goblin türleri, ejderha (Ay Kılıççısı); 14 tür eski oyunda |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt evcilleştirme + görüş/uyarı yapay zekâsı; diğer türler yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, demirci, seviye) |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik düzen var; gerçek cihazda test edilmedi |

## Tamamlananlar
- (henüz tamamen biten özellik yok — her satır yukarıdaki tabloda gerçek durumuyla)

## Çalışma günlüğü

### 2026-11-26 — Özellik 1 (kahraman): pelerin ikincil hareketi
- Bulunan eksik: modelin pelerin kemikleri (CapeA/B/C) vardı ve ağ bunlara ağırlıklıydı ama kod onları **hiç döndürmüyordu**;
  pelerin göğse yapışık, tahta gibi duruyordu.
- `src/31-hero.js`: `capeStep(dt)` — üç sönümlü yay (her kemik için bir eğim açısı), UpperChest çerçevesinde:
  yerçekimi (göğüs eğilince pelerin dikey sarkar), hava sürtünmesi (hızla artan kalkma: yürüme ~0,4 rad, koşu ~0,7–1,0 rad),
  düşerken kalkma, ivmelenme tepkisi, koşuda hafif dalgalanma; sırt ve geriye savrulan uyluk **sert sınır** (kumaş bacağın içine girmez);
  yana koşma ve dönüşte yana savrulma (roll). Sayısal koruma (NaN olursa sıfırlanır), dt kırpma + 2 alt adım.
- `capePose()` → `applyPose` içinde kemik dönüşlerine yazılır; `step()` içinde `capeStep` çağrılır.
- Yeni test `ay-kiliccisi/test/s-cape.js` 7/7; ekran görüntüsü senaryosu `test/s-capeshots.js`.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-bow 4/4, s-save 1/1, s-perf hatasız.
  Önceden de kırık olan (bu değişiklikten bağımsız, değişiklik geri alınınca da düşüyor): s-ui «SALDIR basılı tut = yükleme»
  (PS düğme düzeninden sonra hafif düğmesi yüklemiyor, test eski davranışı bekliyor) ve s-assn okçu isabet oranı (%29–32, beklenen %35–85).
  s-ui kayıt testi bir kez düştü, iki tekrarda geçti (kararsız).

## Sıradaki öncelikler
1. Özellik 1 devam: kahraman zırhı yeniden tasarımı (kullanıcı isteği, `tools/sculpt/models/hero.mjs`). Dikkat: `tools/sculpt/cache/`
   git'te yok; tek model derlemeden önce `data/models.js` içindeki diğer modeller cache'e geri açılmalı, yoksa silinirler.
   Kürk manto ve boynuz/sorguç için küçük ikincil hareket.
2. Önceden kırık iki testi düzelt (s-ui yükleme testi yeni düğme düzenine göre; okçu isabet oranı).
3. Özellik 2: kahramana anahtar kareli klip katmanı + ayak IK (eğimli zeminde ayak kayması).
