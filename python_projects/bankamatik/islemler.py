import os, time,random

def terminal_temizle(): # Terminali temizlemek için kullandığımız kod.
    return os.system('cls||clear')

def menu_ayir(sayi=35): # Menülerde farkındalığı sağlamak için kullandığımız sembolleri bu fonksiyon ile tek bir değişiklikle güncelleyebiliriz.
 return '*'*sayi

def gerisayim(kontrol=10,yazi=''): # Para yatırıldığında parayı kontrol edermiş gibi yapmak için gerisayım yaptık.
     while kontrol: 
        mins, secs = divmod(kontrol, 60) 
        timer = yazi+': {:02d}:{:02d}'.format(mins, secs) 
        print(timer, end="\r") 
        time.sleep(1) 
        kontrol-= 1
        terminal_temizle()

# İban bilgilerinin değiştirebilir olmasını sağladık.
ulke_kodu= "TR"
kontrol_basamaklari= "00"
banka_kodu="1923"
rezerv_alan="00"
temel_iban = ''.join([ulke_kodu+kontrol_basamaklari+banka_kodu+rezerv_alan])

# Iban oluşturmak için fonksiyon
def ibanHno_olustur():
    hesap_numarasi=[]
    for i in range(16):
        numara =  random.randint(0,9)
        hesap_numarasi.append(str(numara))
    return ''.join(hesap_numarasi)