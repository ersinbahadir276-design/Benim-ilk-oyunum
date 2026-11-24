# PROGRESS — zamanlanmış geliştirme görevi

Etkin oyun: **Ay Kılıççısı** (`ay-kiliccisi/`). Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası.
Ayrıntılı tasarım günlüğü: `ay-kiliccisi/PROGRESS.md`. Eski oyun (Yaban Yoldaşları) `yaban.html` + `src/`.
Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Test: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Büyük ölçüde var, tamamlanmadı.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik, PBR kanalları, pelerin kemikleri). Açık: kullanıcının istediği zırh yeniden tasarımı (sanat yönü kullanıcıdan bekleniyor), pelerin/saç için fizik yok. |
| 2 | Gerçekçi 3B karakter animasyonları | **Devam ediyor.** Prosedürel pozlar + kol IK; bu çalıştırmada arazi ayak IK'sı eklendi. Açık: anahtar kareli klip sistemi, pelerin yay fiziği, yürüyüşte ayak kilidi (kaymayı önleme), dönüşte ağırlık kaydırma. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha (kendi klipleri), elf gövdesi → Şeytan Kraliçe, saç GLB'si; diğer GLB'lerden yalnızca iskelet oranları. |
| 4 | Çoklu hayvan ve yaratıklar | Kısmen: kurt, goblin (3 tür), timsah, ejderha. Zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme/evcil, Veyra yoldaş YZ'si, görüş/uyarı sistemi. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ekipman/demirci). Açık: zindanlar, lonca, harita genişletme. |
| 7 | Android performansı ve mobil kontroller | Kısmen: PS tarzı dokunmatik düzen, 30 m dış çizgi sınırı. Gerçek cihazda test edilmedi. |

## Çalıştırma günlüğü

### 2026-11-24
- Kök PROGRESS.md yoktu; oluşturuldu. Açık issue/çalışma ağacı değişikliği yoktu.
- Seçilen iş: #2 animasyon (kahraman). #1'in kalan kısmı (zırh yeniden tasarımı) sanat yönü gerektirdiği için ertelendi.
- Yapılan: **arazi ayak IK'sı** — `legIK` (bükülmeyi ve bacak dönüşünü koruyan iki kemikli IK), `footIK` (leğen alçak ayağa iner, her ayak kendi altındaki zemine basar, zemin normaline göre ≤0,45 rad yatar), `footIKOn` (havada, takla, yere düşme, suikast, su ve ragdoll'da kapalı). Ölçüm: %51 eğimde ayaklar eskiden ±7,2 cm hatalıydı → şimdi 0,1 cm.
- Test: yeni `s-footik.js` 8/8; regresyon s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-save 1/1, s-perf hatasız.
- Not: s-ui'deki kayıt testi bir kez zamanlama nedeniyle başarısız oldu (500 ms otomatik kayıt penceresi), iki tekrarda geçti — kararsız test.

## Sıradaki öncelikler
1. Animasyon: yürüme/koşuda ayak kilidi (adım fazına göre basan ayağı dünyada sabitle → kayma biter), pelerin için yay-sönüm ikincil hareketi, dönüşlerde gövde eğilmesi.
2. Aynı ayak IK'sını kurtlara/goblinlere/NPC'lere genişlet (dört ayaklılar için ön/arka eğim).
3. Kahraman: zırh yeniden tasarımı için kullanıcıdan referans/yön al; kask açık/kapalı yüz seçeneği.
4. s-ui kayıt testini kararlı hâle getir (sabit bekleme yerine kayıt olayını bekle).
