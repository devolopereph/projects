#Kullanıcıdan aldığımız verilerle sayı tahmin oyunu yapıyoruz.
#Random kütüphanesini import ediyoruz.
import random
#Kullanıcıdan rastgele sayının aralığını alıyoruz.
sayi_araligi= input("Rastgele sayının aralığını giriniz(1-100): ")
#Aldığımız aralığı '-' ile ayırıyoruz sayi_araligi değerimiz listeye dönüşüyor.
sayi_araligi = sayi_araligi.split('-')
#Listedeki 0. yani başlangıç değeri olan elemanı ve 1. yani son elemanı çağırıyoruz ve rastgele bir sayı oluşturmasını söylüyoruz.
sayi = random.randint(int(sayi_araligi[0]),int(sayi_araligi[1]))
#tahmin ve sayaç'ın başlangıç değerlerini atıyoruz.
tahmin=0
sayac=0
#Kullanıcı, kaç hakkı olacağını kendisi belirleyecek.
girilen_hak = int(input("kaç hakkınız olsun: "))
#Girilen hakkın 0'dan büyük ve pozitif olma durumunu kontrol ediyoruz, şartlar sağlanırsa oyuna devam ediyoruz, sağlanmazsa kullanıcıya bilgi notu gösteriyoruz.
if girilen_hak > 0:
    kalan_hak = girilen_hak
    #Kullanıcının kaç hak istediğine göre 100 üzerinden puan hesaplamasını yapıyoruz.
    cikarilacak_puan=100//girilen_hak
    tam_puan=100
    print(f"Aklımdan {sayi_araligi[0]} ve {sayi_araligi[1]} arasında bir sayı tuttum, tahmin et ve bul!")
    #Rastgele sayımız, tahmine eşit olmadığı her süre boyunca while döngüsü çalışacak, biz durdurana kadar.(hak bitiminde.)
    #Tahmine başlangıç değeri olarak 0 vermemizin sebebi aşağıdaki while döngüsününe sunduğumuz koşulda belli olmakta. Döngünün başlamasını sağlıyoruz.
    while tahmin!= sayi:
            #Kullanıcının girdiği hak sayısı kadar oynama imkanı sunuyoruz.
            if 0 < kalan_hak <= girilen_hak:
                tahmin = int(input("Sayıyı tahmin et: "))
                kalan_hak-=1
                sayac+=1
                print(f"kalan hakkınız: {kalan_hak}")
                if tahmin > sayi:
                    print("Aşağı")
                    tam_puan-=cikarilacak_puan
                elif tahmin < sayi:
                    print("Yukarı")
                    tam_puan-=cikarilacak_puan
                else:
                    print(f"Tebrikler, tahmin ettiğim sayıyı {sayac}. denemenizde buldunuz. Tahminim: {sayi} idi. Puanınız: {tam_puan} ")
            #Kullanıcının girdiği hak sayısı biterse döngü dışına gönderiyoruz ve elsenin içerisine, break komutu ekleyerek while döngüsüne son veriyoruz ve oyun bitiyor.
            else:
                print(f"Tahmin hakkınız bitti. Tahminim: {sayi} idi. Puanınız: {tam_puan} ")
                break
#Kullanıcının girdiği hak sayısı 0'dan büyük ve pozitif olmaması durumunda yapılacak işlem.
else:
     print("Sadece pozitif sayı girebilirsiniz.")