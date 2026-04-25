<p align="center">
  <img src="assets/icon/icon.png" width="120" alt="Not Defteri Logo" />
</p>

<h1 align="center">📝 Not Defteri</h1>

<p align="center">
  <strong>Modern, güçlü ve tamamen çevrimdışı çalışan not alma uygulaması</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-3.10+-02569B?logo=flutter&logoColor=white" alt="Flutter" />
  <img src="https://img.shields.io/badge/Dart-3.10+-0175C2?logo=dart&logoColor=white" alt="Dart" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green" alt="Platform" />
  <img src="https://img.shields.io/badge/Architecture-Clean%20Architecture-blueviolet" alt="Architecture" />
  <img src="https://img.shields.io/badge/State%20Management-BLoC-orange" alt="BLoC" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

## 📖 Hakkında

**Not Defteri**, Flutter ile geliştirilmiş, Clean Architecture prensiplerine dayanan, tamamen çevrimdışı çalışan modern bir not alma uygulamasıdır. Zengin metin düzenleyici, klasör sistemi, PIN güvenliği, yedekleme/geri yükleme ve etkileşimli graf görünümü gibi gelişmiş özellikler sunar.

Tüm veriler cihazda yerel olarak saklanır — internet bağlantısı veya bulut hesabı gerektirmez.

---

## ✨ Özellikler

### 📋 Not Yönetimi
- **Zengin Metin Düzenleyici** — AppFlowy Editor ile kalın, italik, altı çizili, üstü çizili, kod, bağlantı ve daha fazlası
- **Otomatik Kaydetme** — 2 saniyelik debounce ile anlık kayıt
- **Not İçi Arama** — Başlık ve içerikte full-text arama, vurgulama ve sonuçlar arası navigasyon
- **Görsel Ekleme** — Galeri/kamera'dan fotoğraf ekleme, tam ekran galeri görüntüleyici
- **Sabitleme** — Önemli notları listenin en üstüne sabitleyin
- **Arşivleme** — Notları silmeden arşive taşıyın
- **Hatırlatıcılar** — Not bazlı bildirim zamanlayıcı (timezone-aware)

### 📁 Klasör Sistemi
- **Renkli Klasörler** — 15 farklı renk seçeneği
- **Emoji İkonları** — Her klasöre özel emoji atama
- **Sürükle & Organize** — Notları klasörlere taşıma

### 🌳 Graf Görünümü
- **Etkileşimli Ağaç** — Notları klasörlere göre görselleştiren interaktif grafik
- **Yakınlaştırma & Kaydırma** — 0.3x–3.0x zoom, pan, sıfırlama
- **Animasyonlu Düğümler** — Renk kodlu, tıklanabilir not düğümleri
- **Doğrudan Navigasyon** — Graf'tan nota tek tıkla geçiş

### 🔒 Güvenlik
- **4 Haneli PIN Kilidi** — Uygulama girişinde PIN doğrulama
- **Yanlış Giriş Animasyonu** — Hatalı PIN'de sarsıntı efekti
- **Esnek Kontrol** — PIN oluşturma, değiştirme, kaldırma ve açma/kapama

### 💾 Yedekleme & Geri Yükleme
- **Tam Yedekleme** — Tüm notlar, klasörler ve ayarlar ZIP formatında
- **Kolay Paylaşım** — İşletim sistemi paylaşım menüsü ile dışa aktarma
- **Akıllı Geri Yükleme** — Mevcut kayıtlarla çakışma kontrolü (smart merge)

### 🎨 Tema & Kişiselleştirme
- **Açık / Koyu Tema** — AMOLED dostu saf siyah karanlık mod
- **Material 3** — Modern ve tutarlı tasarım dili
- **Çoklu Dil** — Türkçe ve İngilizce desteği

### 🗑️ Çöp Kutusu
- **Yumuşak Silme** — Notlar ve klasörler çöp kutusuna taşınır
- **Geri Yükleme** — Silinen öğeleri tek tıkla kurtarma
- **Kalıcı Silme** — Tümünü veya tek tek kalıcı olarak temizleme

### 🎯 Kullanıcı Deneyimi
- **Onboarding** — 4 adımlı interaktif tanıtım ekranı
- **Kaydırma Hareketleri** — Sola kaydır: sil, sağa kaydır: arşivle
- **Izgara / Liste Görünümü** — Not ve klasörler için ayrı ayrı hatırlanan mod
- **iOS Tarzı UI** — Cupertino ikonları ve geçiş animasyonları

---

## 🏗️ Mimari

Proje, **Clean Architecture** prensipleri ile yapılandırılmıştır:

```
lib/
├── main.dart                        # Uygulama girişi, DI kurulumu
├── core/                            # Paylaşılan çekirdek katman
│   ├── constants/                   # Sabitler
│   ├── locale/                      # Dil yönetimi (LocaleCubit)
│   ├── security/                    # PIN güvenlik (SecurityCubit)
│   ├── services/                    # Yedekleme & Bildirim servisleri
│   └── theme/                       # Tema yönetimi (ThemeCubit)
├── features/
│   └── notes/
│       ├── data/                    # 📦 VERİ KATMANI
│       │   ├── datasources/        #   └── SQLite CRUD operasyonları
│       │   └── repositories/       #   └── Repository implementasyonları
│       ├── domain/                  # 🧠 İŞ MANTIĞI KATMANI
│       │   ├── entities/           #   └── Note & Folder veri modelleri
│       │   └── repositories/       #   └── Soyut repository arayüzleri
│       └── presentation/           # 🎨 SUNUM KATMANI
│           ├── bloc/               #   └── NotesBloc & FoldersBloc
│           ├── pages/              #   └── 16 sayfa
│           ├── screens/            #   └── Ana ekran  
│           └── widgets/            #   └── Yeniden kullanılabilir bileşenler
└── l10n/                            # 🌍 Çoklu dil dosyaları (.arb)
```

---

## 🧩 State Management

| Bloc / Cubit | Sorumluluk |
|---|---|
| `NotesBloc` | Not CRUD, arama, sabitleme, arşiv, çöp kutusu, hatırlatıcılar |
| `FoldersBloc` | Klasör CRUD, arama, çöp kutusu |
| `ThemeCubit` | Açık / Koyu tema geçişi |
| `LocaleCubit` | Dil değişimi (TR / EN) |
| `SecurityCubit` | PIN kilidi yönetimi |

---

## 📦 Kullanılan Paketler

| Paket | Kullanım Amacı |
|---|---|
| `flutter_bloc` | BLoC/Cubit state management |
| `equatable` | Value equality (state karşılaştırma) |
| `sqflite` | Yerel SQLite veritabanı |
| `appflowy_editor` | Zengin metin düzenleyici |
| `image_picker` | Galeri/kamera'dan görsel seçme |
| `shared_preferences` | Anahtar-değer yerel depolama |
| `uuid` | Benzersiz ID üretimi |
| `google_nav_bar` | Animasyonlu bottom navigation |
| `share_plus` | Dosya paylaşımı (backup) |
| `archive` | ZIP sıkıştırma/açma |
| `file_picker` | Dosya seçici (restore) |
| `introduction_screen` | Onboarding ekranları |
| `emoji_picker_flutter` | Emoji seçici |
| `pinput` | PIN giriş alanı |
| `flutter_local_notifications` | Yerel bildirimler |
| `timezone` | Timezone-aware zamanlama |
| `url_launcher` | Harici bağlantılar |
| `package_info_plus` | Uygulama versiyon bilgisi |

---

## 🚀 Kurulum

### Gereksinimler
- Flutter SDK `>= 3.10`
- Dart SDK `>= 3.10`
- Android Studio / Xcode (platform'a göre)

### Adımlar

```bash
# 1. Repoyu klonlayın
git clone https://github.com/devolopereph/not-defteri.git
cd not-defteri

# 2. Bağımlılıkları yükleyin
flutter pub get

# 3. Lokalizasyon dosyalarını oluşturun
flutter gen-l10n

# 4. Uygulamayı çalıştırın
flutter run
```

---

## 📱 Ekranlar

| Ekran | Açıklama |
|---|---|
| **Ana Sayfa** | 4 sekmeli bottom nav (Notlar, Klasörler, Graf, Ayarlar) |
| **Not Düzenleyici** | Zengin metin, otomatik kayıt, görsel ekleme |
| **Klasör Düzenleyici** | Renk ve emoji seçimli klasör yönetimi |
| **Graf Görünümü** | Not-klasör ilişkilerini gösteren etkileşimli ağaç |
| **Ayarlar** | Tema, dil, güvenlik, yedekleme, çöp kutusu |
| **Çöp Kutusu** | Silinen not ve klasörlerin yönetimi |
| **Arşiv** | Arşivlenmiş notların listesi |
| **Yedekleme** | ZIP tabanlı yedekleme ve geri yükleme |
| **Güvenlik** | PIN oluşturma, değiştirme ve kilitleme |
| **Onboarding** | 4 adımlı uygulama tanıtımı |
| **Hakkında** | Versiyon bilgisi ve bağlantılar |

---

## 🛠️ Teknik Detaylar

- **Veritabanı**: SQLite (7 şema versiyonu, incremental migrations)
- **İçerik Formatı**: AppFlowy Editor JSON
- **Yedek Formatı**: ZIP arşivi (`backup_data.json`)
- **Bildirimler**: Android exact alarm + iOS permissions
- **Tasarım**: Material 3, Cupertino bileşenleri
- **Minimum Android SDK**: 21 (Android 5.0)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<p align="center">
  Flutter 💙 ile geliştirilmiştir
</p>
