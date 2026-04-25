# Sayı tahmin oyunu geliştiriyoruz, burada sistem otomatik olarak 1-50 arasında rastgele bir sayı belirleyecek.
# Kullanıcı rastgele belirlenen doğru sayıyı bulana kadar döngümüz devam edecek.
import random
# Bir ile 50 arasında rastgele bir sayı oluşturturuyoruz.
sayi = random.randint(1,50)
tahmin = 0
print("Aklımdan 1 ve 50 arasında olan bir sayı tuttum. Bakalım bulabilecek misin?")

while tahmin != sayi:
    tahmin = int(input("Tahminim: "))
    if sayi > tahmin:
        print("Daha büyük bir sayı giriniz.")
    elif sayi < tahmin:
        print("Daha küçük bir sayı giriniz.")
    # Garantiye almak adına aradığımız sonuca eşit olup olmadığını sorguluyorum.
    elif sayi == tahmin:
        print("Tebrikler. Tahmin ettiğim sayıyı buldun!")
        # Break eklemiyorum çünkü while döngüsü sayı tahmine eşit olmadığında çalışıyor.
        # dolayısıyla doğru sayı bulunduğunda döngü çalışmayacak.
    else:
        print("Hatalı giriş, lütfen tekrar dene.")
