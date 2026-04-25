# Alışveriş listesi tasarlıyoruz.
# Kullanıcı ürün ekleyebilecek, tüm ürünleri görebilecek ve silebiliyor olacak. Ayrıca sistemden çıkışta yapabiliyor.

import os
listedb = []

def menu():
    print("---MENÜ---\n1-Listeyi Görüntüle\n2-Ürün Ekle\n3-Ürün Sil\n4-Çıkış")
    secim = input("Seçim yapınız: ")
    os.system('cls||clear')
    if secim == "1":
        liste()
    elif secim == "2":
        uekle()
    elif secim == "3":
        usil()
    elif secim == "4":
        exit()
    else:
        print("Geçersiz seçim. Ana menüye yönlendiriliyorsunuz...")
def liste():
        if not listedb:
            os.system('cls||clear')
            print("Alışveriş listeniz boş. Ana menüye yönlendiriliyorsunuz.")
        else:
            os.system('cls||clear')
            print("---Alışveriş Listeniz---")
            for urun in range(len(listedb)):
                print(f"{urun}-: {listedb[urun]}")


def uekle():
    urun = input("Eklemek istediğiniz ürün(geri dönmek için 0/1): ").upper()
    os.system('cls||clear')
    if urun == "0":
        print("Ana menüye yönlendiriliyorsunuz...")
    elif urun == "1":
        print("Ana menüye yönlendiriliyorsunuz...")
    else:
        listedb.append(urun)
        print(f"{urun} başarıyla alışveriş listenize eklendi.")

def usil():
    urun = input("Silmek istediğiniz ürün(hepsi için 0, geri dönmek için 1): ").upper()
    os.system('cls||clear')
    if urun == "0":
        sorgu = input("Alışveriş listenizdeki tüm ürünleri silmek istediğinize emin misiniz? (Evet/Hayır Yalnızca E/H): ")
        os.system('cls||clear')
        if sorgu.upper() == "E":
            listedb.clear()
            print("Alışveriş listenizdeki tüm ürünler silindi.")
        elif sorgu.upper() == "H":
            print("Tüm ürünleri silme işlemi iptal edildi. Ana menüye yönlendiriliyorsunuz...")
        else:
            print("Geçersiz seçim. Ana menüye yönlendiriliyorsunuz...")
    elif urun == "1":
            print("Ana menüye yönlendiriliyorsunuz...")
    elif urun in listedb:
            listedb.remove(urun)
            print(f"{urun} başarıyla alışveriş listenizden silindi.")
    elif urun not in listedb:
            print("Silmek istediğiniz ürün alışveriş listenizde bulunamadı.")
    else:
        print("Geçersiz seçim. Ana menüye yönlendiriliyorsunuz.")

while True:
     menu()
