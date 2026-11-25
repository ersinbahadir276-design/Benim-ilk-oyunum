# PROGRESS — Benim İlk Oyunum

Zamanlanmış geliştirme görevinin takip dosyası. Ana oyun **Ay Kılıççısı** (`ay-kiliccisi/`); kök `index.html`,
`ay-kiliccisi/dist/ay-kiliccisi.html` dosyasının kopyasıdır. Ayrıntılı oturum günlüğü ve teknik notlar:
`ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları) `yaban.html` olarak duruyor.

Derleme: `cd ay-kiliccisi && python3 tools/build.py` → sonra `cp ay-kiliccisi/dist/ay-kiliccisi.html index.html`.
Test: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var, tamamlanmadı.** Kael "Kara Zırh": SDF heykel modeli (~21k üçgen, 58 kemik, parlaklık/metal/ışıma kanalları), dev kılıç. Açık: kullanıcının istediği zırh yeniden tasarımı (sanat yönü bekleniyor). |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor.** Tüm hareketler kodla üretilen pozlar + kol IK. Oturum 8: ayak IK'sı + eğim/dönüş vücut dili eklendi. |
| 3 | Gönderilen GLB modellerin entegrasyonu | **Kısmen.** Ejderha (kendi klipleri), elf gövdesi (Şeytan Kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları. Açık: Kawaiope ve wolf_puppy iskeletlerine geçiş. |
| 4 | Birden çok hayvan ve yaratık | **Kısmen.** Kurt, goblin (3 tür), timsah, ejderha. Açık: geyik/kuş, gece yaratıkları, zindan yaratıkları. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | **Kısmen.** Kurt besleme/evcil kurt, görüş konisi + uyarı yayılması, Veyra yoldaş yapay zekâsı. Yaban Yoldaşları'ndaki 14 türlük evcilleştirme Ay Kılıççısı'na taşınmadı. |
| 6 | Açık dünya, savaş, envanter, ilerleme | **Büyük ölçüde var.** 2,8 km harita, Tsushima tarzı savaş, 4 duruş, ganimet/demirci/yetenek, sunaklar, görevler. Açık: harita genişletme, zindanlar. |
| 7 | Android performansı ve mobil kontroller | **Kısmen.** Dokunmatik PlayStation düzeni, 30 m ötesinde dış çizgi kapalı. Açık: HUD düzenleyici, grafik kalite ayarı, gerçek cihaz testi. |

Hiçbir özellik henüz "tamamlandı" olarak işaretlenmedi.

## Tamamlanan işler

### Çalışma 1 — 2026-11-25 (zamanlanmış) — Özellik 2: animasyon
- **Kahraman ayak IK'sı** (`ay-kiliccisi/src/32-footik.js`): her ayak altındaki zemine göre kalkar/iner, kalça
  aşağı iner, diz iki kemikli IK ile bükülür (animasyonun diz yönü korunur), taban zemin eğimine yatar (en çok ~29°).
  Havada, suda, takla, yere düşme ve alt etmelerde yumuşakça kapanır.
- **Vücut dili** (`55-player.js`): koşarken yokuşa göre öne/arkaya eğilme, dönüşte gövde yatışı, beklerken nefes.
- Ölçüm (25,7° yokuş): duruşta taban hatası ±7 cm → 0,1 cm; yürürken en kötü gömülme −15,9 cm → −0,8 cm.
- Testler: yeni `s-footik.js` 9/9; `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-assn` 5/5, `s-bow` 4/4, `s-perf` hatasız.
- Önceden kalan sorun: `s-ui.js` "SALDIR basılı tut = yükleme" testi değişiklikten önce de kalıyordu (aşağıda).

## Sıradaki öncelikler
1. **Animasyon (özellik 2):** anahtar kareli klip sistemi + çapraz geçiş (crossfade) — saldırı/kaçınma pozlarını
   tek hedef pozdan çok kareli kliplere taşımak; pelerin ve saç için ikincil hareket (yay–sönüm); yürürken ayak
   kaymasını önleyen adım kilidi.
2. **Kahraman (özellik 1):** zırh yeniden tasarımı — kullanıcıdan sanat yönü/referans gerekiyor.
3. `s-ui.js` basılı tutarak yükleme testini PlayStation düzenine göre gözden geçir (2,5 sn sonra durum zaten `heavy`).
4. Aynı ayak IK'sını kurt ve goblinlere uygulamak (özellik 4/5).
