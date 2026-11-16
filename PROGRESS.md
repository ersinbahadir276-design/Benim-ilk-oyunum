# PROGRESS

Otomatik geliştirme rutininin ilerleme kaydı. Her çalıştırma bir sonraki çalıştırmanın neyi yapacağını buradan okur.

## Özellik durumu

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | ✅ Tamam | VRoid anime avatarı, toon malzeme, kılıç (PR #1). |
| Gerçekçi 3B karakter animasyonları | 🟡 Kısmen | Kahraman: retarget edilmiş Quaternius klipleri + **saç/ceket yay kemiği fiziği (bu çalıştırma)**. Eksik: kahraman ayak IK'sı (eğimde), prosedürel hayvanlarda ayak–zemin kilidi, kök hareket (root motion) senkronu. |
| Gönderilen GLB modellerinin entegrasyonu | 🟡 Kısmen | Gönderilen tek GLB (ejderha) bağlı. Ejderha uçuşu yok (`fly2` sabit yollu). Yeni GLB gelirse `GLBCreature` ile bağlanacak. |
| Çoklu hayvan ve yaratıklar | ✅ Tamam (temel) | 14 tür. 12'si kodla üretilmiş stilize model; görsel kalite iyileştirilebilir. |
| Yaratık evcilleştirme ve yapay zekâ | ✅ Tamam (temel) | Türe özgü yöntemler, yoldaş takip/savaş/açlık. |
| Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmen | Dünya/bölgeler, savaş, envanter var. Eksik: ilerleme (seviye/XP), kayıt sistemi, görevler, ata binme. |
| Android performansı ve mobil kontroller | 🟡 Kısmen | Dokunmatik kontroller var. Eksik: düşük kalite ön ayarı, LOD/gölge ayarı, gerçek cihaz FPS ölçümü. |

## Tamamlananlar

- PR #1: 3B evcilleştirme macerası — erkek kahraman, 14 tür, evcil yoldaşlar, envanter, dokunmatik kontroller, 51 test.
- 2026-11-16: VRM yay kemiği (spring bone) fiziği — kahramanın saçı (20 eklem) ve ceket eteği (14 eklem) artık koşu, dönüş ve animasyonla doğal sallanıyor.

## Çalıştırma günlüğü

### 2026-11-16
- **Seçilen özellik:** Gerçekçi 3B karakter animasyonları (README'de "saç/giysi fiziği çalışmıyor" olarak listelenen açık).
- `src/springbone.js` eklendi: modelin kendi VRM 0.x `secondaryAnimation` verisini (kemik grupları, sertlik, sönüm, çarpışma küreleri) okuyan, 60 Hz sabit alt adımlı yay kemiği çözücüsü. Eklemeler: karakter hareketine kısmi eylemsizlik (`inertia`), ışınlanmada sıfırlama, en az sönüm (VRM verisinde ceketin sönümü 0 olduğundan sonsuz salınıyordu) ve dinlenme yönünden açı sınırı (ceket 43°, saç 57°).
- `hero.js` sistemi kurar, `player.js` her karede animasyon ve kök konumu belli olduktan sonra günceller, yeniden doğuşta sıfırlar.
- `test/model-viewer.html?m=hero&spin` ile görsel kontrol; 3 yeni oynanış testi (zincir kurulumu, koşu/dönüşte sallanma + açı sınırı, durunca yatışma). **54/54 test geçti, konsol hatası yok.**

## Sıradaki öncelikler

1. Animasyon: kahraman için iki kemikli ayak IK'sı (eğimli zeminde ayaklar zemine otursun) ve prosedürel hayvanlarda ayak kayması azaltma.
2. Mobil: düşük/orta/yüksek kalite ön ayarı (gölge haritası boyutu, piksel oranı, çizim mesafesi) ve FPS göstergesi.
3. İlerleme: XP/seviye, kayıt (localStorage) sistemi.
4. Ejderha uçuşu (kendi klipleriyle prosedürel uçuş yolu), ata binme.
