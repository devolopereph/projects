# Kullanıcı giriş sistemi yazıyoruz.
# kullanıcı adı ve şifre yanlış ise, doğru şifre girilene kadar döngü her zaman tekrar çalışacak.
dogru_sifre = "admin"
girilen_sifre = ""
k_adi = "admin"
girilen_k_adi = ""

while dogru_sifre != girilen_sifre and k_adi != girilen_k_adi:
    print("Hoş geldiniz. Sisteme giriş yapabilmek için lütfen kullanıcı adınızı ve şifrenizi giriniz.")
    girilen_k_adi = input("Kullanıcı adınızı giriniz: ")
    girilen_sifre = input("Kullanıcı şifrenizi giriniz: ")
    if dogru_sifre == girilen_sifre and k_adi == girilen_k_adi:
        print("Kullanıcı doğrulandı. Hoş geldiniz, sisteme giriş yapılıyor...")
    else:
        print("Hatalı giriş yaptınız, lütfen tekrar deneyiniz.")