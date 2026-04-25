# Kullanıcıdan alınan bilgilere göre tanıtım metni hazırlayacağız.

# Terminali temizlemek için os kütüphanesini kullanıyoruz.
import os

ad = str(input("Adınız: "))
soyad = str(input("Soyadınız: "))
yas = int(input("Yaşınız: "))
hobi= str(input("Hobileriniz (virgül ile ayırarak yazınız): ")).lower()
os.system('cls||clear')
metin = print(f"Merhaba, ben {ad} {soyad}, {str(yas)} yaşındayım. Hobilerim {hobi}. Kendine iyi bak, iyi günler.")
