#PErsonel adında bir class tanımlıyoruz.
class Personel:
    def __init__(self, ad_soyad, dogum_yili, bolum, maas):
        self.ad_soyad = ad_soyad
        self.dogum_yili = dogum_yili
        self.bolum = bolum
        self.maas = maas
    
    def bilgi(self):
        print(f'Personelin adı ve soyadı: {self.ad_soyad}\nPersonelin yaşı: {2025-self.dogum_yili}\nPersonelin bölümü: {self.bolum}\nPersonelin maaşı: {self.maas}')

    def maas_belirle(self, yeni_maas):
        self.maas = yeni_maas
    
    def maas_arttir(self, eklenen_miktar):
        self.maas += eklenen_miktar

    def maas_azalt(self, azaltilan_miktar):
        self.maas -= azaltilan_miktar
    
    def bolum_degistir(self, yeni_bolum):
        self.bolum = yeni_bolum

eleman1 = Personel('Devoloper Eph',2000,'Güvenlik', 35000)
eleman1.bilgi()
eleman1.maas_arttir(5000)
eleman1.maas_belirle(30000)
eleman1.bolum_degistir('Yazılım')
eleman1.maas_azalt(10000)
eleman1.bilgi()
