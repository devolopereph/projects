# Kullanıcıdan okumak istediği kitabın adını ve toplam sayfasını öğreneceğiz ve kullanıcıya her zaman ne kadar okuduğunu soracağız, eğer okunan sayfa sayısı toplam sayfa sayısını geçerse başka bir kitabın verilerini alacağız, bu şekilde döngü sonsuza kadar devam edecek.

import os

while True:
    toplam_sayfa=0
    okunan_sayfa=0
    kitap_ad = ""
    print("Kitap takip sistemi başlatılıyor...")
    kitap_ad = str(input("Okumaya başlayacağınız kitabın adını giriniz: "))
    toplam_sayfa = int(input(f"{kitap_ad} adlı kitabın toplam sayfa sayısını giriniz: "))
    while True:
        os.system('cls||clear')
        if okunan_sayfa < toplam_sayfa:
            print(f"Okumakta olduğunuz kitap: {kitap_ad}\nOkunan sayfa sayısı: {okunan_sayfa}/{toplam_sayfa}")
            okunan_sayfa += int(input(f"Okumuş olduğunuz sayfa sayısını giriniz: "))
        elif okunan_sayfa >= toplam_sayfa:
            print(f"{toplam_sayfa} sayfalı {kitap_ad} adlı kitabı bitirdiniz, tebrikler.")
            print("Döngü yeniden başlatılıyor...")
            break
        else:
            print("Hatalı giriş yaptınız. Lütfen tekrar deneyin.")
