#Girilen 2 sayının aralağındaki asal sayıları bulan fonksiyonu yazıyoruz.
def asalsayibulucu(sayi1,sayi2):
    for sayi in range(sayi1, sayi2+1):
        if  sayi > 1:
            for i in range(2,sayi):
                if sayi % 2 == 0:
                    break
            else:
                print(sayi)
asalsayibulucu(int(input('1.sayiyi giriniz: ')),int(input('2.sayiyi giriniz: ')))