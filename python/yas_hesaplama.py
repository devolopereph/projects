# Kullanıcıdan doğum tarihi alarak yaşını hesaplayan program
import datetime

dogum_tarihi = input("Doğum tarihinizi girin (gg.aa.yyyy): ")

dogum_tarihi = dogum_tarihi.split(".")
dogum_tarihi = datetime.date(int(dogum_tarihi[2]), int(dogum_tarihi[1]), int(dogum_tarihi[0]))
tarih = datetime.date.today()

print("Bugünün tarihi: ", tarih)
print("Doğum tarihiniz: ", dogum_tarihi)

if tarih.month < dogum_tarihi.month:
    print("Yaşınız: ", tarih.year - dogum_tarihi.year - 1)
elif tarih.month == dogum_tarihi.month and tarih.day < dogum_tarihi.day:
    print("Yaşınız: ", tarih.year - dogum_tarihi.year - 1)
else:
    print("Yaşınız: ", tarih.year - dogum_tarihi.year)