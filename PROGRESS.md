# PROGRESS

Zamanlanmış geliştirme çalışmalarının kaydı. Bir özellik yalnızca gerçekten bittiğinde "Tamamlandı" olarak işaretlenir.

## Tamamlandı

_(Henüz listedeki hiçbir özellik tamamen bitmiş sayılmıyor — hepsinin çalışan ilk sürümü var, eksikleri aşağıda.)_

## Özellik durumu

| Özellik | Durum | Eksik kalan |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | Büyük ölçüde hazır | Yüz ifadeleri/göz kırpma (VRM blendshape), göz/baş hedefe bakma |
| Gerçekçi 3B karakter animasyonları | Kısmen | Kahraman için ayak IK (eğimde ayak kayması), prosedürel hayvanlarda ayak–zemin kilidi |
| Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, tilki) | Diğer 12 tür için GLB gönderilmedi — dosya gelince `GLBCreature` ile bağlanacak; ejderha uçuşu |
| Çok sayıda hayvan ve yaratık | Kısmen | 14 tür var; 12'si kodla üretilmiş düşük poligonlu model |
| Yaratık evcilleştirme ve yapay zekâ | Kısmen | Yoldaş komutları (saldır/geri çekil) ve binme yok |
| Açık dünya, savaş, envanter, ilerleme | Kısmen | Seviye/XP, kayıt (save), görevler, gece/gündüz yok |
| Android performansı ve mobil kontroller | Kısmen | Dokunmatik kontroller var; kalite ayarı/LOD ve cihaz testi yok |

## Çalışma günlüğü

### 2026-11-15
- **Özellik:** Yüksek kaliteli erkek kahraman — README'de "bilinen sınır" olarak yazan saç/giysi fiziği eksiği giderildi.
- `src/springbones.js` (yeni): VRM 0.x `secondaryAnimation` okuyucusu ve Verlet yay kemiği çözücüsü. Modelin kendi 8 kemik grubu (7 saç tutamı + palto eteği, toplam 34 eklem) ve 10 çarpıştırıcı grubu kullanılır.
  - Palto eteğine bacak çarpıştırıcıları eklendi (modelde tanımlı değildi).
  - Modelde eteğin sönümü 0 olduğu için koşarken kumaş ~3 rad dönüp ters çevriliyordu; sönüm tabanı (0.45), hafif yerçekimi ve salınım konisi (etek 0.95 rad, saç 1.2 rad) eklendi.
  - 60 Hz sabit alt adımlar (düşük kare hızlı Android cihazlarda kararlılık), ışınlanma/yeniden doğmada zincir sıfırlama.
- `src/hero.js`, `src/player.js`: fizik, animasyon karıştırıcısı ve kök dönüşümünden sonra her karede çalışır; `respawn` zinciri sıfırlar.
- `test/model-viewer.js`: kahraman görüntüleyicisinde fizik de çalışır.
- `test/gameplay-test.js`: 4 yeni test (eklemler yüklendi, koşarken etek salınır ama bacağa gömülmez, ani dönüşte saç tepki verir, ışınlanmada savrulma yok). **55/55 test geçti, konsol hatası yok.**

## Sıradaki öncelikler
1. Kahraman: VRM yüz ifadeleri (göz kırpma, saldırıda/hasarda ifade) ve yakın hayvana baş/göz yönelimi.
2. Animasyon: kahraman için iki kemikli bacak IK'sı ile eğimli zeminde ayak yerleştirme.
3. İlerleme: XP/seviye ve `localStorage` kayıt sistemi (envanter, yoldaşlar, konum).
4. Android: kalite ön ayarları (gölge çözünürlüğü, piksel oranı, çizim mesafesi) ve dokunmatik kamera iyileştirmesi.
5. Yeni GLB'ler gönderilirse prosedürel türlerin değiştirilmesi.
