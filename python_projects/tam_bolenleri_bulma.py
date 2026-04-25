#Girilen sayının tam bölenlerini bulan fonksiyonu yazalım.
def tambolenleribulma(sayi):
    tambolenler=[]
    for i in range(2,sayi):
        if sayi %i == 0:
            tambolenler.append(i)
    return tambolenler
print(tambolenleribulma(int(input('Sayıyı giriniz: '))))
