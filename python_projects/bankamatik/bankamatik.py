import psycopg2
from islemler import *
admission = False
conn = psycopg2.connect("host=localhost dbname=bankamatik user=postgres password=postgres")
cur = conn.cursor()

class bankamatik():
    def __init__(self, kimlik_no):
        self.kimlik_no = kimlik_no

    def bakiye_goruntule(self):
        terminal_temizle()
        cur.execute(f"SELECT hesap_ad_soyad, hesap_iban_no, hesap_bakiye, hesap_ek_hesap_bakiye, hesap_ek_hesap_bakiye_limit FROM hesaplar WHERE hesap_kimlik_no='{kimlik_no}';")
        bg_hesap = cur.fetchall()
        print(f'Hoş geldin {bg_hesap[0][0]}!\nIBAN Numarası: {temel_iban+bg_hesap[0][1]} \nBakiye: {bg_hesap[0][2]} TL\nKullanılabilir Ek Hesap Bakiyesi: {bg_hesap[0][3]} TL\nEk Hesap Bakiye Limiti: {bg_hesap[0][4]} TL')

    def para_cek(self):
        terminal_temizle()
        cur.execute(f"SELECT hesap_bakiye, hesap_ek_hesap_bakiye, hesap_ek_hesap_bakiye_limit FROM hesaplar WHERE hesap_kimlik_no='{kimlik_no}';")
        pc_hesap = cur.fetchall()
        print(f'Bakiye: {pc_hesap[0][0]} TL\nKullanılabilir Ek Hesap Bakiyesi: {pc_hesap[0][1]} TL\nEk Hesap Bakiye Limiti: {pc_hesap[0][2]} TL')
        try:
            miktar=int(input('Çekmek istediğiniz para miktarını giriniz: '))
        except ValueError:
            terminal_temizle()
            print('Geçersiz para miktarı girdiniz.')
            while True:
                try:
                    miktar = int(input(f'Hesabınızdan çekmek istediğiniz para miktarını giriniz: '))
                    break
                except ValueError:
                    terminal_temizle()
                    print('Geçersiz para miktarı girdiniz.')
        if (miktar > 0):
            if pc_hesap[0][0]>= miktar:
                if miktar >= 20000:
                    terminal_temizle()
                    print('Bu işlem için en fazla 20.000 TL çekebilirsiniz.')
                    miktar = int(input(f'Hesabınızdan çekmek istediğiniz para miktarını giriniz: '))
                terminal_temizle()
                print(f'Hesabınızdan {miktar} TL para çekme talebinde bulundunuz.')
                print('Bu işlem için ek hesabınız kullanılmayacaktır.')
                para_cekimi_onay = str(input(f'{miktar} TL Para çekimi işlemini onaylıyor musunuz(e/h): '))
                terminal_temizle()
                if para_cekimi_onay.upper() == 'E':
                    gerisayim(yazi='Paranız hazırlanıyor')
                    cur.execute(f"UPDATE hesaplar SET hesap_bakiye=hesap_bakiye-{miktar} WHERE hesap_kimlik_no='{kimlik_no}'")
                    conn.commit()
                    terminal_temizle()
                    print(f'Hesabınızdan {miktar} TL para çekilmiştir. Kalan bakiye:{pc_hesap[0][0]-miktar} TL, ek hesabınız kullanılmamıştır.')
                elif para_cekimi_onay.upper() == 'H':
                    terminal_temizle()
                    print(f'Hesabınızdan {miktar} TL para çekme işlemi isteğiniz üzere iptal edilmiştir. ')
                else:
                    terminal_temizle()
                    print('Geçersiz giriş yaptınız.')
            else:
                if pc_hesap[0][0] + pc_hesap[0][1] >=  miktar:
                    terminal_temizle()
                    print(f'Ek hesabınız ile birlikte {miktar} TL çekebilirsiniz.\n{pc_hesap[0][1]} TL bakiyeli ek hesabınızdan { miktar - pc_hesap[0][1]} TL çekilecektir. ')
                    ek_hesap_onay = str(input('Ek hesap kullanımını onaylıyor musunuz? (e/h): ')).upper()
                    if ek_hesap_onay == 'E':
                        cur.execute(f"UPDATE hesaplar SET hesap_bakiye=0, hesap_ek_hesap_bakiye={pc_hesap[0][1]-(miktar - pc_hesap[0][0])} WHERE hesap_kimlik_no='{k_kimlik_no}'")
                        conn.commit()
                        terminal_temizle()
                        print(f'Ek hesapla birlikte toplam {miktar} TL para çekildi.')
                    elif ek_hesap_onay == 'H':
                        print(f'{miktar} TL Para çekme işlemi isteğiniz üzerine iptal edildi.')
                    else:
                        print('Hatalı giriş yapıldı.')
                else:
                    terminal_temizle()
                    print(f'Hesabınızda yeterli miktarda bakiye ve limit bulunmamaktadır. \nDilerseniz canlı desteğe bağlanarak limit arttırma talebinde bulunabilirsiniz.')
        else:
            terminal_temizle()
            print('Geçersiz para miktarı girdiniz.')
            
    def para_yatir(self):
        terminal_temizle()
        cur.execute(f"SELECT  hesap_bakiye, hesap_ek_hesap_bakiye, hesap_ek_hesap_bakiye_limit FROM hesaplar WHERE hesap_kimlik_no='{kimlik_no}';")
        py_hesap = cur.fetchall()
        print(f'Bakiye: {py_hesap[0][0]} TL\nKullanılabilir Ek Hesap Bakiyesi: {py_hesap[0][1]} TL\nEk Hesap Bakiye Limiti: {py_hesap[0][2]} TL')
        try:
            miktar = int(input(f'Hesabınıza yatırmak istediğiniz para miktarını giriniz: '))
        except ValueError:
            terminal_temizle()
            print('Geçersiz para miktarı girdiniz.')
            while True:
                try:
                    miktar = int(input(f'Hesabınıza yatırmak istediğiniz para miktarını giriniz: '))
                    break
                except ValueError:
                    terminal_temizle()
                    print('Geçersiz para miktarı girdiniz.')
        if (miktar > 0):
            if miktar >= 20000:
                terminal_temizle()
                print('Bu işlem için en fazla 20.000 TL yatırabilirsiniz.')
                miktar = int(input(f'Yatırmak istediğiniz para miktarını giriniz: '))
            secim = input(f'{miktar} TL para yatırma işlemini onaylıyor musunuz? (e/h):').upper()
            terminal_temizle()
            if secim == 'E':
                gerisayim(yazi='Yatırılan para kontrol ediliyor')
                cur.execute(f"UPDATE hesaplar SET hesap_bakiye=hesap_bakiye+{miktar} WHERE hesap_kimlik_no='{kimlik_no}'")
                conn.commit()
                print(f'Hesabınıza {miktar} TL para yatırılmıştır.')
            elif secim == 'H':
                print(f'Hesabınıza {miktar} TL para yatırma işleminiz isteğiniz üzere iptal edilmiştir. ')
            else:
                print('Hatalı giriş yapıldı.')
        else:
            terminal_temizle()
            print('Geçersiz para miktarı girdiniz.')
        
    def y_no_para_gonder(self):
        cur.execute(f"SELECT hesap_iban_no, hesap_bakiye,hesap_ek_hesap_bakiye FROM hesaplar WHERE hesap_kimlik_no='{kimlik_no}'")
        gk_hesapDb=cur.fetchall()
        gonderilecek_iban_no= input(f'Para göndermek istediğiniz kişinin IBAN numarasını giriniz: ')[10:]
        cur.execute(f"SELECT hesap_iban_no FROM hesaplar")
        iban_liste =  cur.fetchall()
        if gonderilecek_iban_no in [item[0] for item in iban_liste]:
            if gk_hesapDb[0][0] == gonderilecek_iban_no:
                print('Kendinize para gönderemezsiniz.')
            else: 
                cur.execute(f"SELECT hesap_ad_soyad, hesap_iban_no FROM hesaplar WHERE hesap_iban_no='{gonderilecek_iban_no}'")
                gHesapDb = cur.fetchall()
                gonderilecek_hesap_ad_soyad= input(f'Para göndermek istediğiniz kişinin adını ve soyadını giriniz:  ').title()
                if gonderilecek_iban_no == gHesapDb[0][1] and gonderilecek_hesap_ad_soyad == gHesapDb[0][0]:
                    try:
                        miktar = int(input('Yollayacağınız para miktarı: '))
                    except ValueError:
                        terminal_temizle()
                        print('Geçersiz para miktarı girdiniz.')
                        while True:
                            try:
                                miktar = int(input('Yollayacağınız para miktarı: '))
                                break
                            except ValueError:
                                terminal_temizle()
                                print('Geçersiz para miktarı girdiniz.')
                    if (miktar > 0):
                        if gk_hesapDb[0][1] >= miktar:
                            secim=input(f"{temel_iban+gHesapDb[0][1]} IBAN numarasına sahip olan {gHesapDb[0][0]}'a {miktar} TL gönderme işlemini onaylıyor musunuz(E/H): ").upper()
                            if secim == "E" or secim == "EVET":
                                cur.execute(f"UPDATE hesaplar SET hesap_bakiye=hesap_bakiye-{miktar} WHERE hesap_kimlik_no='{kimlik_no}'")
                                cur.execute(f"UPDATE hesaplar SET hesap_bakiye=hesap_bakiye+{miktar}  WHERE hesap_iban_no='{gonderilecek_iban_no}'")
                                conn.commit()
                                terminal_temizle()
                                print(f"{gHesapDb[0][0]}'a {miktar} TL gönderildi.")
                            elif secim == "H" or secim =="HAYIR":
                                print('Para gönderme işlemi isteğiniz üzere iptal edildi.')
                        else:
                            print("Hesabınızda yeterli miktarda bakiye yok. ")
                    else:
                        print("Hatalı giriş yaptınız, miktar 0'dan büyük olmalı")
                else:
                    print('IBAN numarası veya IBAN sahibinin bilgileri hatalı.')
        else:
            print('İban bulunamadı.')

    def para_gonder(self):
        print(f'PARA GÖNDERME İŞLEMLERİ\n{menu_ayir()}\n1-Yabancı Hesap Numarasına Para Gönder\n2-Ana Menüye Dön')
        secim = input('Seçim yapınız:(1-4): ')
        if secim == '1':
            bankamatik.y_no_para_gonder(self) 
        elif secim == '2':
            terminal_temizle()
        else:
            print('Hatalı giriş yaptınız.')    


    def hesap_guvenligi(self):
        print(f'{menu_ayir()}\n1-Hesap Şifresini Değiştir \n2-Ana Menüye Geri Dön\n{menu_ayir()}')
        secim = input('Seçim yapınız:(1-2): ')
        if secim == '1':
            bankamatik.hesap_sifre_degistir(self)
        elif secim == '2':
            terminal_temizle()
            bankamatik.ana_menu(self)
        else:
            print('Hatalı giriş yaptınız.')

    def hesap_sifre_degistir(self):
        sifre_dogrula = None
        cur.execute(f"SELECT  hesap_sifre FROM hesaplar WHERE hesap_kimlik_no='{kimlik_no}';")
        hsd_hesap = cur.fetchone()
        while sifre_dogrula != hsd_hesap[0]:
            terminal_temizle()
            print(f'{menu_ayir()}\nŞİFRE DOĞRULAMA İŞLEMİ\n{menu_ayir()}')
            sifre_dogrula=input('Şu anda kullanmakta olduğunuz şifre: ')
            terminal_temizle()
        print(f'{menu_ayir()}\nŞİFRE DEĞİŞTİRME İŞLEMİ\n{menu_ayir()}')
        print(f'{menu_ayir()}\nLÜTFEN YALNIZCA SİZİN GÖREBİLECEĞİNİZ BİR YERDE ŞİFRENİZİ GİRİNİZ.\n{menu_ayir()}')
        print('6 karakterli olmalı ve yalnızca rakamlardan oluşan bir pin belirleyiniz.')
        yeni_sifre=input('Kullanmak istediğiniz yeni şifreyi giriniz: ')
        while len(str(yeni_sifre)) != 6  or not yeni_sifre.isdigit():
            terminal_temizle()
            print('Şifreniz 6 karakterli olmalı ve yalnızca rakamlardan oluşmalıdır.')
            yeni_sifre=input('Banka hesabınızın yeni şifresini giriniz: ')
        cur.execute(f"UPDATE hesaplar SET hesap_sifre={yeni_sifre} WHERE hesap_kimlik_no='{kimlik_no}';")
        conn.commit()
        terminal_temizle()
        print(f'Banka hesabınızın şifresi başarıyla değiştirildi.')

    def ana_menu(self):
        global admission
        print(f'{menu_ayir()}\n1-Bakiye Görüntüle\n2-Para Çek\n3-Para Yatır\n4-Para Gönder\n5-Güvenlik İşlemleri\n6-Hesaptan Çıkış Yap\n{menu_ayir()}')
        secim = input('Seçim yapınız:(1-6): ')
        if secim == '1':
            bankamatik.bakiye_goruntule(self)
        elif secim == '2':
            bankamatik.para_cek(self)
        elif secim == '3':
            bankamatik.para_yatir(self)
        elif secim == '4':
            terminal_temizle()
            bankamatik.para_gonder(self)
        elif secim == '5':
            terminal_temizle()
            bankamatik.hesap_guvenligi(self)
        elif secim == '6':
            terminal_temizle()
            print('Çıkış Yapılıyor...')
            admission = False
        else:
            print('Hatalı giriş yaptınız.')

#CLASS SONU
def giris_yap():
    cur.execute(f"SELECT hesap_kimlik_no FROM hesaplar")
    deneme = 1
    while True:
            global admission, kimlik_no
            giris_kimlik_no=input('Kimlik numaranızı giriniz: ')
            giris_hesap_sifre=input('Hesap şifrenizi giriniz: ')
            dbhesapkNo = cur.fetchall()
            dbhesapkNo = [item[0] for item in dbhesapkNo]
            if giris_kimlik_no in dbhesapkNo :
                cur.execute(f"SELECT hesap_sifre FROM hesaplar WHERE hesap_kimlik_no='{giris_kimlik_no}';")
                dbhesapSifre = cur.fetchone()
                if giris_hesap_sifre == dbhesapSifre[0]:
                    cur.execute(f"SELECT hesap_ad_soyad FROM hesaplar WHERE hesap_kimlik_no='{giris_kimlik_no}';")
                    gy_hesap = cur.fetchone()
                    terminal_temizle()
                    admission = True
                    kimlik_no = giris_kimlik_no
                    print('Başarılı giriş. Hesaba yönlendiriliyor...')
                    print(f'Hoş geldin {gy_hesap[0]}!')
                    bankamatik(giris_kimlik_no)
                    break
            elif deneme==3:
                    terminal_temizle()
                    print('3 defa hatalı giriş yaptınız. Lütfen daha sonra tekrar deneyiniz.')
                    quit()
            else:
                deneme += 1
                terminal_temizle()
                print('Kimlik numarası veya şifre yanlış.')  

def sozlesme_kayit_onaylama():
    global k_adSoyad, k_tel, k_eposta,k_sifre,k_kimlik_no,admission,girisK_no
    sozlesme = "KULLANICI SÖZLEŞMESİ\n1. GENEL HÜKÜMLER\n- Bu uygulamayı kullanarak tüm şartları kabul etmiş sayılırsınız.\n- Bankamatik uygulaması yalnızca bireysel kodlama becerisini denemek için tasarlanmıştır.\n- Bu uygulama sadece test amaçlı kişisel bir projedir.\n\n2. HESAP OLUŞTURMA\n- Kullanıcılar, hesap oluştururken doğru ve eksiksiz bilgi vermekle yükümlüdür.\n- Yanıltıcı bilgi verilmesi durumunda hesap askıya alınabilir veya silinebilir.\n\n3. GÜVENLİK VE SORUMLULUK\n- Hesabınızın güvenliğini sağlamak sizin sorumluluğunuzdadır.\n- Şifrenizi kimseyle paylaşmayınız. Aksi halde doğabilecek zararlardan uygulama sorumlu tutulamaz.\n\n4. VERİ POLİTİKASI\n- Kişisel bilgileriniz gizli tutulacaktır ve üçüncü şahıslarla paylaşılmayacaktır.\n- Verileriniz yalnızca uygulama hizmetlerini geliştirmek amacıyla kullanılacaktır.\n\n5. HİZMET KISITLAMALARI\n- Uygulamanın kötüye kullanımı, hesabınızın kalıcı olarak kapatılmasına neden olabilir.\n- Yasal olmayan işlemler tespit edilirse gerekli mercilere bildirim yapılacaktır.\n\n6. KABUL VE ONAY\n- Bu sözleşmeyi onaylayarak tüm şartları kabul ettiğinizi beyan edersiniz.\n- Uygulamayı kullanmaya devam etmek için bu sözleşmeyi onaylamanız gerekmektedir."
    print(f'Merhaba {k_adSoyad}!\n- Bankamıza bir onay uzaktasınız!\n\n{sozlesme}')
    sozlesme_onay=input(f'\nSözleşmeyi onaylamak için EVET(e) veya HAYIR(h) giriniz: ').upper()
    terminal_temizle()
    if (sozlesme_onay == "EVET") or  (sozlesme_onay == "E"):
        terminal_temizle()
        print('- Bilgileriniz kontrol edilecek, lütfen bekleyin...')
        gerisayim(yazi='Bilgileriniz kontrol ediliyor', kontrol=15)
        cur.execute(f"INSERT INTO hesaplar (hesap_ad_soyad, hesap_tel_no, hesap_eposta, hesap_sifre, hesap_iban_no, hesap_kimlik_no) VALUES ('{k_adSoyad}','{k_tel}','{k_eposta}','{k_sifre}', '{ibanHno_olustur()}', '{k_kimlik_no}')")
        conn.commit()
        cur.execute(f"SELECT hesap_ad_soyad, hesap_kimlik_no FROM hesaplar WHERE hesap_ad_soyad='{k_adSoyad}' AND hesap_sifre='{k_sifre}'")
        dbhesap= cur.fetchall()
        girisK_no = dbhesap[0][1]
        terminal_temizle()
        print(f'- Sayın {dbhesap[0][0]} Bankamıza Hoş Geldiniz!\n- Bize katıldığınız için mutluluk duyduk!\n- Banka hesabınıza, kimlik numaranız ve şifreniz ile giriş yapabilirsiniz.')
    elif (sozlesme_onay == "HAYIR") or  (sozlesme_onay == "H"):
        print('\n- Sözleşme reddedildi.\n- Kayıt işlemi iptal edildi.\nÇıkış yapılıyor...')
        quit()
    else:
        print('Hatalı giriş yapıldı.')
        sozlesme_kayit_onaylama()

def kayit_ol():
    global k_adSoyad, k_tel, k_eposta,k_sifre,k_kimlik_no
    terminal_temizle()
    print(f'{menu_ayir(sayi=60)}\nBankamıza kayıt olmak istediğiniz için çok mutluyuz!\n{menu_ayir(sayi=60)}\n- Bilgilerinizi hizmetimizi geliştirmek haricinde sizden başka kimseyle kullanmıyoruz.')
    print('- İlk olarak adınız ve soyadınızı Türkçe kurallarına dikkat ederek giriniz.')
    k_adSoyad=input('Adınızı ve soyadınızı giriniz: ').title()
    k_kimlik_no =input('11 Haneli kimlik numaranızı giriniz: ')
    while len(str(k_kimlik_no)) != 11 or not k_kimlik_no.isdigit():
        terminal_temizle()
        print('Geçersiz kimlik numarası girdiniz.')
        k_kimlik_no =input('11 Haneli kimlik numaranızı giriniz: ')
    print('- Size ulaşabilmemiz için telefon numaranız ve eposta adresiniz gerekmekte.')
    print('- Telefon numaranızı bitişik ve başında 0 olacak şekilde giriniz.(örnek: 0530)')
    k_tel=input('Telefon numaranızı giriniz: ')
    k_eposta=input('eposta adresinizi giriniz: ')
    terminal_temizle()
    print(f'{menu_ayir()}\nLÜTFEN YALNIZCA SİZİN GÖREBİLECEĞİNİZ BİR YERDE ŞİFRENİZİ GİRİNİZ.\n{menu_ayir()}')
    print('- Son olarak hesabınızı kullanabilmek için 6 karakterli olmalı ve yalnızca sayıdan oluşan bir pin belirleyiniz.')
    k_sifre=input('Banka hesabınızın şifresini giriniz: ')
    while len(str(k_sifre)) != 6  or not k_sifre.isdigit():
        terminal_temizle()
        print('Şifreniz 6 karakterli olmalı ve yalnızca sayıdan oluşmalıdır.')
        k_sifre=input('Banka hesabınızın şifresini giriniz: ')
    terminal_temizle()
    sozlesme_kayit_onaylama()

def varsayilan_menu():
    print(f'{menu_ayir()}\nEph Bankasına Hoş Geldin.\n{menu_ayir()}\n1-Giriş Yap\n2-Kayıt Ol\n3-Bankamatikten Çıkış Yap')
    secim = input("Seçim yapınız(1-3): ")
    terminal_temizle()
    if secim == '1':
        giris_yap()
    elif secim == '2':
        kayit_ol()
    elif secim == '3':
        print('Bankamatikten çıkış yapılıyor...')
        quit()
    else:
        print('Hatalı giriş yapıldı.')
        varsayilan_menu()

while True:
    if admission == True:
        bankamatik.ana_menu(kimlik_no)
    else:
        varsayilan_menu()