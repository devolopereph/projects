import os
username = 'admin'
password = 'admin'

while True:
    usernameinput = input("Kullanıcı adınızı giriniz: ")
    passwordinput = input("Kullanıcı şifrenizi giriniz: ")
    if (usernameinput == username) and (passwordinput == password):
        print("Hoş geldiniz.")
        break
    else:
        os.system('cls||clear')
        print("Kullanıcı adınız veya şifreniz yanlış. Lütfen tekrar deneyiniz.")