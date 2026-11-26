# PROGRESS — otomatik geliştirme turu (zamanlanmış görev)

Her tur bu dosyayı okur, aşağıdaki listeden en yüksek öncelikli bitmemiş özelliği ilerletir.
Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`. Oyun kaynağı: `ay-kiliccisi/src/`, kök `index.html` = derlenmiş oyun.

## Özellik listesi (öncelik sırası)
- [ ] Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) — *devam ediyor*
- [ ] Gerçekçi 3B karakter animasyonları
- [ ] Gönderilen GLB modellerin entegrasyonu
- [ ] Çok sayıda hayvan ve yaratık
- [ ] Yaratık evcilleştirme ve yapay zekâ
- [ ] Açık dünya, dövüş, envanter ve ilerleme sistemleri
- [ ] Android performansı ve mobil kontroller

Hiçbiri henüz "bitti" sayılmıyor; her birinin bir kısmı oyunda var (bkz. `ay-kiliccisi/PROGRESS.md`).

## Tamamlananlar
- [x] Tur 1 (2026-11-26): kahramanın pelerini canlandırıldı (aşağıda).

## Tur günlüğü
### Tur 1 — 2026-11-26 · Özellik: Yüksek kaliteli erkek kahraman
- Tespit: heykel modeldeki pelerin CapeA/B/C kemiklerine bağlıydı (~1200 köşe ağırlığı) ama bu kemikleri hiçbir kod
  döndürmüyordu; pelerin sırta yapışık sert bir tahta gibi duruyordu (koşarken, eğilirken, düşerken hiç oynamıyordu).
- Yapılan: `capeSim()` (`ay-kiliccisi/src/30-player-model.js`) — segment başına sönümlü yay:
  dünya yerçekimine göre sarkar (gövde öne eğilse de dik kalır), koşu hızıyla arkaya savrulur (alt kısım daha çok),
  dönüşte ve yana adımda yana sallanır, düşerken havalanır, rüzgârda dalgalanır; diz ve ayak bileği eklemlerine
  çarpınca geri itilir (bacakların içinden geçmez). Işınlanma/hızlı yolculukta (>25 m/s) sıçramaz. Manhwa sahnelerinde de uygulanır.
- Yeni test `ay-kiliccisi/test/s-cape.js`: 6/6 geçti.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-perf hatasız (mantık süresi kare başına ≤0,34 ms).
- s-ui'deki eski bir test hatası düzeltildi: test 2,5 sn basılı tutup "yükleme" bekliyordu, oysa ağır saldırı
  tasarım gereği 1,3 sn'de kendiliğinden çıkıyor; ölçüm 0,7 sn'ye alındı (oyun kodu değişmedi).
- Test erişimi için `window.__G` içine `PLD, MODEL, HERO, CAPE, capeSim` eklendi.

## Sıradaki öncelikler
1. Kahraman: kürk yakaya ve miğfer sorgucuna da ikincil hareket (heykel modelde bunlar gövde kemiğine bağlı;
   ayrı kemik gerekirse `tools/sculpt` hattı lazım — bu hat depoda YOK, yeniden kurulmalı ya da kodla çözülmeli).
2. Kahraman: zırhın yeniden tasarımı (kullanıcı isteği, `ay-kiliccisi/PROGRESS.md`) — heykel hattı olmadan yapılamıyor;
   önce `tools/sculpt` kaynağının depoya eklenmesi/yeniden yazılması gerek.
3. Kahraman yüz/göz yarığı ışıması, yakın plan doku detayı; ardından "Gerçekçi animasyonlar": anahtar kareli klip
   sistemi + ayak IK (ANALIZ.md §3 önerisi).
