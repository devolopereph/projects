# Ephe Portfolio

Ephe Portfolio; geliştiriciler, içerik üreticileri ve kişisel markasını web üzerinde sunmak isteyen herkes için hazırlanmış modern, responsive ve interaktif bir portfolyo sitesi şablonudur.

Proje statik HTML, CSS ve JavaScript ile geliştirildiği için kolayca düzenlenebilir, GitHub Pages üzerinde yayınlanabilir ve kişisel bilgilere göre özelleştirilebilir. Varsayılan içerik örnek bir portfolyo düzeni sunar; isim, açıklama, sosyal bağlantılar, teknoloji listesi ve GitHub kullanıcı adı değiştirilerek farklı kişiler tarafından kullanılabilir.

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
- Kolay düzenlenebilir statik dosya yapısı

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

## Kişiselleştirme

Projeyi kendi portfolyonuz için kullanmak istiyorsanız aşağıdaki alanları güncelleyin:

| Dosya | Güncellenecek Alan |
| --- | --- |
| `index.html` | Sayfa başlığı, meta açıklamalar, hero metni, hakkımda alanı, teknoloji listesi ve iletişim bağlantıları |
| `script.js` | `GITHUB_USERNAME` değeri ve proje kartı davranışı |
| `style.css` | Renkler, boşluklar, kart stilleri ve responsive görünüm |
| `assets/screenshots/` | README'de görünen ekran görüntüleri |

## Proje Yapısı

```text
.
├── index.html
├── script.js
├── style.css
├── assets/
│   └── screenshots/
├── LICENSE
└── README.md
```

## Yayına Alma

Proje GitHub Pages üzerinde yayınlanmaya uygundur. Monorepo içinde bulunduğu için yayınlama sırasında kaynak klasör olarak `web/ephe-portfolio` seçilmelidir.

## Lisans

Bu proje MIT lisansı ile sunulmaktadır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.
