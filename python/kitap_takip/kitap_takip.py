import psycopg2
from islemler import *
conn = psycopg2.connect("host=localhost dbname=kitap_takip user=postgres password=postgres")
cur = conn.cursor()
anahtar = False
class kitap_takip():
    def __init__(self, kullanici_adi):
        self.kullanici_adi = kullanici_adi
        print("Kitap takip sistemine hoşgeldiniz.")
        print('Kullanıcı Adı: ', self.kullanici_adi)

    def kitap_ekle(self):
        terminal_temizle()
        kitap_ad = input("Kitap adını giriniz: ")
        toplam_sayfa = int(input(f"{kitap_ad} adlı kitabın toplam sayfa sayısını giriniz: "))
        if (toplam_sayfa == 0) or (toplam_sayfa < 0):
            while True:
                print("Toplam sayfa sayısı 0'dan büyük olmalıdır.")
                toplam_sayfa = int(input(f"{kitap_ad} adlı kitabın toplam sayfa sayısını giriniz: "))
                if toplam_sayfa > 0:
                    break
        cur.execute(f"UPDATE kullanici SET k_kitap_ad='{kitap_ad}', k_kitap_toplam_sayfa={toplam_sayfa},k_okunan_sayfa=0 WHERE k_kullaniciAdi='{self.kullanici_adi}'", (kitap_ad, toplam_sayfa))
        conn.commit()
        print(f"{menu_ayir()}\nKitap ekleme işlemi başarılı.\n{menu_ayir()}")

    def kitap_goruntule(self):
        terminal_temizle()
        cur.execute("SELECT k_kitap_ad,k_okunan_sayfa, k_kitap_toplam_sayfa FROM kullanici WHERE k_kullaniciAdi=%s", (self.kullanici_adi,))
        kitap = cur.fetchall()
        if type(kitap[0][0]) == type(None):
            print(f"{menu_ayir()}\nOkumakta olduğunuz kitap bulunmamaktadır.\n{menu_ayir()}")
        elif kitap[0][1] >= kitap[0][2]:
            print(f"{menu_ayir()}\n{kitap[0][0].title()} adlı {kitap[0][2]} sayfalık kitabı bitirmiş bulunmaktasınız.\n{menu_ayir()}")
        else:
            print(f'{menu_ayir()}\nŞu anda okuduğunuz kitap: {kitap[0][0]}\nToplam sayfa sayısı: {kitap[0][1]}/{kitap[0][2]}\n{menu_ayir()}')

    def kitap_sayfa_guncelle(self):
        terminal_temizle()
        cur.execute("SELECT k_okunan_sayfa, k_kitap_toplam_sayfa FROM kullanici WHERE k_kullaniciAdi=%s", (self.kullanici_adi,))
        kitap = cur.fetchall()
        if type(kitap[0][1]) == type(None):
            print(f"{menu_ayir()}\nOkumakta olduğunuz kitap bulunmamaktadır.\n{menu_ayir()}")
        elif kitap[0][0] < kitap[0][1]:
            okunan_sayfa = int(input(f"Okumuş olduğunuz sayfa sayısını giriniz: "))
            if (okunan_sayfa == 0) or (okunan_sayfa < 0):
                while True:
                    print("Girilen sayfa sayısı 0'dan büyük olmalıdır.")
                    okunan_sayfa = int(input(f"Okumuş olduğunuz sayfa sayısını giriniz: "))
                    if okunan_sayfa > 0:
                        break
            if okunan_sayfa+kitap[0][0] > kitap[0][1]:
                print("Toplam sayfa sayısından fazla sayfa girdiniz.")
            else:
                cur.execute(f"UPDATE kullanici SET k_okunan_sayfa=k_okunan_sayfa+{okunan_sayfa} WHERE k_kullaniciAdi='{self.kullanici_adi}'")
                conn.commit()
                print("Sayfa sayısı güncelleme işlemi başarılı.")
        elif kitap[0][0] >= kitap[0][1]:
            print(f"{menu_ayir()}\nOkumakta olduğunuz kitabı zaten bitirmişsiniz.\n{menu_ayir()}")

    def menu(self):
        print("1. Kitap Ekle/Değiştir\n2. Kitap Görüntüle\n3. Kitap Sayfa Sayısı Güncelle \n4. Çıkış")
        secim = int(input("Yapmak istediğiniz işlemi seçiniz(1-4): "))
        if secim == 1:
            kitap_takip.kitap_ekle(self)
        elif secim == 2:
            kitap_takip.kitap_goruntule(self)
        elif secim == 3:
            kitap_takip.kitap_sayfa_guncelle(self)
        elif secim == 4:
            print("Çıkış yapılıyor...")
            global anahtar
            anahtar= False
        else:
            print("Hatalı giriş yaptınız. Lütfen tekrar deneyin.")
            terminal_temizle()

def giris_yap():
        global anahtar, kullanici
        kullanici_adi = input("Kullanıcı adınızı giriniz: ")
        sifre = input("Şifrenizi giriniz: ")
        cur.execute("SELECT * FROM kullanici WHERE k_kullaniciAdi=%s AND k_sifre=%s", (kullanici_adi, sifre))
        terminal_temizle()
        if cur.fetchone():
            print("Giriş başarılı.")
            anahtar = True
            kullanici = kitap_takip(kullanici_adi)
        else:
            print("Kullanıcı adı veya şifre hatalı.")

def kayit_ol():
    kullanici_adi = input("Kullanıcı adınızı giriniz: ")
    if (type(kullanici_adi) == type(None)) or (kullanici_adi == "") or (kullanici_adi == " ") or (len(kullanici_adi) < 3 or len(kullanici_adi) > 20):
        print("Kullanıcı adınız 3-20 karakter arasında olmalıdır.")
        quit()
    sifre = input("Şifrenizi giriniz(6 karakter olmalı): ")
    if (len(sifre) > 6) or (len(sifre) < 6):
        print("Şifreniz 6 karakter olmalıdır.")
        quit()
    cur.execute("INSERT INTO kullanici(k_kullaniciAdi, k_sifre) VALUES(%s, %s)", (kullanici_adi, sifre))
    conn.commit()
    print("Kayıt işlemi başarılı.")
    giris_yap()

def kayit_giris():
    terminal_temizle()
    print("1. Kayıt Ol\n2. Giriş Yap\n3. Çıkış")
    secim = int(input("Yapmak istediğiniz işlemi seçiniz(1-3): "))
    if secim == 1:
        kayit_ol()
    elif secim == 2:
        giris_yap()
    elif secim == 3:
        print("Çıkış yapılıyor...")
        quit()
    else:
        terminal_temizle()
        print("Hatalı giriş yaptınız. Lütfen tekrar deneyin.")

while True:
    if anahtar == True:
        kullanici.menu()
    else:
        kayit_giris()