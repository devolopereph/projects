# Klavyeden girilen üç sayı arasından en büyüğünü bulan sistem.
sayi1 = int(input("1.sayıyı giriniz: "))
sayi2 = int(input("2.sayıyı giriniz: "))
sayi3 = int(input("3.sayıyı giriniz: "))

en_buyuk = sayi1

if sayi2 > en_buyuk:
    en_buyuk = sayi2

if sayi3 > en_buyuk:
    en_buyuk = sayi3

print(f"En büyük sayı: {en_buyuk}")