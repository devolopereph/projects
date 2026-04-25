# Ephe Portfolio

Efe (`ephe`) için hazırlanmış modern, responsive ve interaktif kişisel portfolyo sitesi. Profil bilgilerini, teknoloji yığınını, GitHub projelerini, sosyal bağlantıları ve küçük bir okçuluk etkileşimini tek sayfalık sade bir arayüzde sunar.

## Önizleme

![Ephe Portfolio ana sayfa ekran görüntüsü](assets/screenshots/home.png)

## Ekran Görüntüleri

![Ephe Portfolio giriş bölümü](assets/screenshots/hello.png)

![Ephe Portfolio projeler bölümü](assets/screenshots/projects.png)

![Ephe Portfolio mobil görünüm](assets/screenshots/mobile.png)

## Özellikler

- Responsive tek sayfa portfolyo yapısı
- Animasyonlu hero alanı, scroll reveal efektleri ve özel cursor glow
- GitHub public API üzerinden otomatik proje kartları
- Devicon destekli teknoloji kartları
- Canvas ile hazırlanmış interaktif okçuluk bölümü
- GitHub, YouTube, Instagram ve e-posta iletişim kartları

## Teknolojiler

- HTML5
- CSS3
- JavaScript
- GitHub REST API
- Devicon CDN

## Yerelde Çalıştırma

Bu proje statik bir web sitesidir; doğrudan tarayıcıda açılabilir. Yerel sunucuyla çalıştırmak için:

```bash
python3 -m http.server 5173
```

Ardından tarayıcıda açın:

```text
http://localhost:5173
```

## Proje Yapısı

```text
.
├── index.html
├── script.js
├── style.css
├── assets/
│   └── screenshots/
└── README.md
```

## Yayına Alma

Proje GitHub Pages üzerinde yayınlanmaya uygundur. Monorepo içinde bulunduğu için yayınlama sırasında kaynak klasör olarak `web/ephe-portfolio` seçilmelidir.

## Lisans

Henüz lisans eklenmemiştir. Yeniden kullanım, dağıtım veya katkı kabul edilmeden önce uygun bir lisans eklenmelidir.
